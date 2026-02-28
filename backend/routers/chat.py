import asyncio
import json
import logging

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from schemas.chat import ChatRequest
from services.conversation import save_message
from services.gemini import stream_chat

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

SSE_HEADERS = {"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}


async def _stream_and_persist(req: ChatRequest):
    """Wrap the sync SSE generator, accumulate full response, then persist."""
    full_text = ""
    gen = stream_chat(req)
    try:
        while True:
            try:
                chunk = await asyncio.to_thread(next, gen)
            except StopIteration:
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
async def chat(req: ChatRequest):
    return StreamingResponse(
        _stream_and_persist(req),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )
