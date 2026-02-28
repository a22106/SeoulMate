import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from google.genai import types

from services.gemini_live import create_live_session

router = APIRouter(prefix="/api")


@router.websocket("/voice")
async def voice_ws(ws: WebSocket, language: str = "English"):
    await ws.accept()

    async with await create_live_session(language) as session:

        async def forward_audio():
            """Browser mic PCM → Gemini Live API."""
            try:
                while True:
                    data = await ws.receive_bytes()
                    await session.send_realtime_input(
                        audio=types.Blob(data=data, mime_type="audio/pcm;rate=16000")
                    )
            except WebSocketDisconnect:
                pass

        async def receive_audio():
            """Gemini Live API audio → Browser speaker."""
            try:
                async for msg in session.receive():
                    if msg.server_content:
                        if msg.server_content.model_turn:
                            for part in msg.server_content.model_turn.parts:
                                if part.inline_data:
                                    await ws.send_bytes(part.inline_data.data)
                        if msg.server_content.turn_complete:
                            await ws.send_text("TURN_COMPLETE")
            except WebSocketDisconnect:
                pass

        tasks = [
            asyncio.create_task(forward_audio()),
            asyncio.create_task(receive_audio()),
        ]
        try:
            await asyncio.gather(*tasks)
        except WebSocketDisconnect:
            for task in tasks:
                task.cancel()
