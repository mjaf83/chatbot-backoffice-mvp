from database import AsyncSessionLocal
from models import KnowledgeSource, DocumentChunk, SourceType
from langchain_ollama import OllamaEmbeddings
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
import json

embeddings_model = OllamaEmbeddings(model="nomic-embed-text")

async def ingest_sql_view(connection_string: str, query: str, name: str, db_session, category: str = "general"):
    # 1. Connect to external DB
    # Note: Use create_async_engine for async execution if possible, or standard engine
    # For simplicity assuming the connection string is compatible with SQLAlchemy
    
    try:
        external_engine = create_async_engine(connection_string)
        async with external_engine.connect() as conn:
            result = await conn.execute(text(query))
            rows = result.fetchall()
            keys = result.keys()
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

    # 2. Create Source Entry
    source = KnowledgeSource(
        name=name, 
        source_type=SourceType.SQL_VIEW,
        db_connection_string=connection_string,
        sql_query=query,
        category=category
    )
    db_session.add(source)
    await db_session.flush()

    # 3. Process Rows
    count = 0
    for row in rows:
        # Convert row to text
        row_dict = dict(zip(keys, row))
        content_text = json.dumps(row_dict, indent=2, default=str)
        
        vector = embeddings_model.embed_query(content_text)
        
        chunk = DocumentChunk(
            source_id=source.id,
            content=content_text, # Or a specific formatting
            embedding=vector,
            metadata_json=row_dict
        )
        db_session.add(chunk)
        count += 1
        
    await db_session.commit()
    return {"status": "success", "rows_processed": count}
