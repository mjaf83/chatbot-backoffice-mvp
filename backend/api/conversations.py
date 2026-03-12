from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import Conversation
from schemas import ConversationResponse, ConversationDetailResponse

router = APIRouter()

@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(db: AsyncSession = Depends(get_db)):
    # Retrieve all conversations ordered by updated_at descending
    stmt = select(Conversation).order_by(Conversation.updated_at.desc().nulls_last(), Conversation.created_at.desc())
    result = await db.execute(stmt)
    conversations = result.scalars().all()
    return conversations

@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    return conversation

@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    await db.delete(conversation)
    await db.commit()
    return {"status": "success", "message": "Conversation deleted"}
