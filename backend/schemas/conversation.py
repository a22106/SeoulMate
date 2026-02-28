from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, BeforeValidator

# psycopg returns UUID objects for PostgreSQL UUID columns; coerce to str
StrFromUUID = Annotated[str, BeforeValidator(lambda v: str(v))]


class ConversationCreate(BaseModel):
    language: str = "English"


class ConversationResponse(BaseModel):
    id: StrFromUUID
    language: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: StrFromUUID
    conversation_id: StrFromUUID
    role: str
    text: str
    image_included: bool
    created_at: datetime


class ConversationListItem(BaseModel):
    id: StrFromUUID
    language: str
    preview: str | None = None
    created_at: datetime
    updated_at: datetime


class ConversationDetail(BaseModel):
    conversation: ConversationResponse
    messages: list[MessageResponse]
