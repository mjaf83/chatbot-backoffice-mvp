from database import AsyncSessionLocal
from models import KnowledgeSource, DocumentChunk, SourceType
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
import shutil

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize Embeddings
embeddings_model = OllamaEmbeddings(model="nomic-embed-text")

async def ingest_file(file, filename: str, db_session, category: str = "general"):
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file temporarily
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Determine loader
    if filename.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path)
        
    docs = loader.load()
    
    # Text Splitter
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    # Create Source Entry
    source = KnowledgeSource(name=filename, source_type=SourceType.FILE, category=category)
    db_session.add(source)
    await db_session.flush() # Get ID
    
    # Process Chunks
    for split in splits:
        vector = embeddings_model.embed_query(split.page_content)
        chunk = DocumentChunk(
            source_id=source.id,
            content=split.page_content,
            embedding=vector,
            metadata_json=split.metadata
        )
        db_session.add(chunk)
        
    await db_session.commit()
    
    # Cleanup
    os.remove(file_path)
    return {"status": "success", "chunks": len(splits)}
