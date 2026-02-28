from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from schemas.chat import ChatRequest
from services.gemini import stream_chat

router = APIRouter(prefix="/api")


@router.post("/chat")
async def chat(req: ChatRequest):
    return StreamingResponse(stream_chat(req), media_type="text/event-stream")
