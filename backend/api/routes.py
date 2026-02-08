from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import SourceConfig, ChatRequest, ChatResponse, ManualEntry
from rag.ingest import ingest_file
from rag.sql_ingest import ingest_sql_view
from rag.router import route_question
from rag.retriever import generate_answer
from models import KnowledgeSource, SourceType
from sqlalchemy import select

router = APIRouter()

@router.get("/sources")
async def get_sources(db: AsyncSession = Depends(get_db)):
    stmt = select(KnowledgeSource).order_by(KnowledgeSource.created_at.desc())
    result = await db.execute(stmt)
    sources = result.scalars().all()
    return sources

@router.post("/ingest/file")
async def upload_file(
    file: UploadFile = File(...), 
    category: str = Form("general"),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await ingest_file(file, file.filename, db, category)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/sql")
async def ingest_sql(config: SourceConfig, db: AsyncSession = Depends(get_db)):
    if not config.connection_string or not config.query:
        raise HTTPException(status_code=400, detail="Connection string and query are required")
        
    try:
        result = await ingest_sql_view(config.connection_string, config.query, config.name, db, config.category)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/manual")
async def ingest_manual(entry: ManualEntry, db: AsyncSession = Depends(get_db)):
    # Simple manual entry: create a source and a single chunk
    from models import KnowledgeSource, DocumentChunk, SourceType
    from langchain_ollama import OllamaEmbeddings
    
    embeddings_model = OllamaEmbeddings(model="nomic-embed-text")
    
    source = KnowledgeSource(
        name=entry.title, 
        source_type=SourceType.MANUAL, 
        category=entry.category,
        description=entry.content[:100]
    )
    db.add(source)
    await db.flush()
    
    vector = embeddings_model.embed_query(entry.content)
    chunk = DocumentChunk(
        source_id=source.id,
        content=entry.content,
        embedding=vector
    )
    db.add(chunk)
    await db.commit()
    return {"status": "success"}

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # 1. Get available categories
    stmt = select(KnowledgeSource.category).distinct()
    result = await db.execute(stmt)
    categories = [row[0] for row in result.all()]
    
    # 2. Router
    category = await route_question(request.message, categories)
    print(f"Routing to: {category}")
    
    # 3. Retrieval & Generation
    result = await generate_answer(request.message, db, category)
    
    return ChatResponse(
        response=result["answer"],
        sources=[str(s) for s in result["sources"]]
    )
