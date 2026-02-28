from fastapi import APIRouter, HTTPException

from schemas.conversation import (
    ConversationCreate,
    ConversationDetail,
    ConversationListItem,
    ConversationResponse,
    MessageResponse,
)
from services.conversation import (
    create_conversation as create_conv,
    get_conversation,
    get_messages,
    list_conversations,
)

router = APIRouter(prefix="/api/conversations")


@router.get("", response_model=list[ConversationListItem])
async def list_all():
    return await list_conversations()


@router.post("", status_code=201, response_model=ConversationResponse)
async def create(req: ConversationCreate):
    row = await create_conv(req.language)
    return row


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def detail(conversation_id: str):
    conv = await get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = await get_messages(conversation_id)
    return ConversationDetail(
        conversation=conv,
        messages=[MessageResponse(**m) for m in msgs],
    )
