from typing import Optional

from pydantic import BaseModel


class HistoryMessage(BaseModel):
    role: str
    text: str
    image: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    image: Optional[str] = None
    language: str = "English"
    history: list[HistoryMessage] = []
    conversation_id: Optional[str] = None
