from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import AsyncSessionLocal
from models import KnowledgeSource, DocumentChunk
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

embeddings_model = OllamaEmbeddings(model="nomic-embed-text")
llm = ChatOllama(model="llama3.1", temperature=0)

template = """You are a professional AI assistant for a corporate knowledge base.
Your goal is to answer questions ACCURATELY based ONLY on the provided context.

Rules:
1. Use ONLY the information in the context below.
2. If the answer is not in the context, say "lo siento, no dispongo de información suficiente en mi base de conocimientos para responder a esa pregunta."
3. Do not make up information or use outside knowledge.
4. Keep the tone professional and concise.

Context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | llm | StrOutputParser()

async def get_relevant_documents(question: str, db_session, category: str = None, top_k: int = 4):
    query_vector = embeddings_model.embed_query(question)
    
    # Base query: Select DocumentChunks, order by distance
    stmt = select(DocumentChunk).join(KnowledgeSource)
    
    # Filter by category if provided and not "default"
    if category and category.lower() != "default":
        stmt = stmt.where(KnowledgeSource.category == category)
        
    # Vector Search (L2 distance)
    # Using the <-> operator for L2 distance from pgvector
    stmt = stmt.order_by(DocumentChunk.embedding.l2_distance(query_vector)).limit(top_k)
    
    result = await db_session.execute(stmt)
    chunks = result.scalars().all()
    
    return chunks

async def generate_answer(question: str, db_session, category: str = None):
    docs = await get_relevant_documents(question, db_session, category)
    
    if not docs:
        return {"answer": "I could not find any relevant information in the knowledge base.", "sources": []}
        
    context_text = "\n\n".join([doc.content for doc in docs])
    
    answer = await chain.ainvoke({"context": context_text, "question": question})
    
    # Extract sources
    sources = list(set([doc.source_id for doc in docs])) # Just IDs for now, could fetch names
    
    return {"answer": answer, "sources": sources, "context_used": context_text}
