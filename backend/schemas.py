from pydantic import BaseModel
from typing import Optional, List, Any

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
    history: List[dict] = [] # [{"role": "user", "content": "..."}]

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
