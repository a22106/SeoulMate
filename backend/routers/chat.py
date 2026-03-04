import asyncio
import json
import logging

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse

from schemas.chat import ChatRequest
from services.conversation import save_message
from services.gemini import stream_chat
from services.rate_limit import check_rate_limit

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

SSE_HEADERS = {"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}

_EXHAUSTED = object()


def _next_chunk(gen):
    """Wrapper around next() that returns a sentinel instead of raising StopIteration."""
    return next(gen, _EXHAUSTED)


async def _stream_and_persist(req: ChatRequest):
    """Wrap the sync SSE generator, accumulate full response, then persist."""
    full_text = ""
    gen = stream_chat(req)
    try:
        while True:
            chunk = await asyncio.to_thread(_next_chunk, gen)
            if chunk is _EXHAUSTED:
                break
            yield chunk
            # Extract text content from SSE data lines (skip [DONE])
            if chunk.startswith("data: {"):
                try:
                    parsed = json.loads(chunk[6:].strip())
                    if parsed.get("content"):
                        full_text += parsed["content"]
                except json.JSONDecodeError:
                    pass
    except Exception:
        logger.exception("Streaming failed")
        return

    # Persist after successful streaming
    if req.conversation_id and full_text:
        try:
            await save_message(
                req.conversation_id,
                "user",
                req.message,
                image_included=bool(req.image or req.file_url),
            )
            await save_message(req.conversation_id, "assistant", full_text)
        except Exception:
            logger.exception("Failed to persist messages")


@router.post("/chat")
async def chat(req: ChatRequest, request: Request):
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if not client_ip:
        client_ip = request.client.host if request.client else "unknown"

    allowed, remaining = check_rate_limit(client_ip)
    if not allowed:
        return JSONResponse(
            status_code=429,
            content={"detail": "Daily question limit reached. Please try again tomorrow."},
        )

    return StreamingResponse(
        _stream_and_persist(req),
        media_type="text/event-stream",
        headers={**SSE_HEADERS, "X-RateLimit-Remaining": str(remaining)},
    )
