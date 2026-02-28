from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConversationCreate(BaseModel):
    language: str = "English"


class ConversationResponse(BaseModel):
    id: str
    language: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    text: str
    image_included: bool
    created_at: datetime


class ConversationDetail(BaseModel):
    conversation: ConversationResponse
    messages: list[MessageResponse]
