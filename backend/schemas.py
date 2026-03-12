from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class SourceConfig(BaseModel):
    name: str
    category: str = "general"
    connection_string: Optional[str] = None
    query: Optional[str] = None

class ManualEntry(BaseModel):
    title: str
    content: str
    category: str = "general"

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    # history is now managed server-side, but frontend can still send it if needed
    history: List[dict] = [] # [{"role": "user", "content": "..."}]

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
    conversation_id: str

class ConversationResponse(BaseModel):
    id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class ConversationDetailResponse(ConversationResponse):
    history: List[dict] = []
