from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database import AsyncSessionLocal
from models import KnowledgeSource, DocumentChunk
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

embeddings_model = OllamaEmbeddings(model="nomic-embed-text:latest", base_url="http://127.0.0.1:11434")
llm = ChatOllama(model="llama3.1:8b", temperature=0, base_url="http://127.0.0.1:11434")

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


# Chitchat Prompt
chitchat_template = """You are a helpful and professional AI assistant for a corporation.
The user is engaging in general conversation (greetings, small talk, or general questions).
Answer politely and professionally. You do not need to use the knowledge base for this.
If they ask about specific company policies or data that you don't know, suggest they ask a more specific question so you can look it up.

Question: {question}
"""
chitchat_prompt = ChatPromptTemplate.from_template(chitchat_template)
chitchat_chain = chitchat_prompt | llm | StrOutputParser()

async def get_relevant_documents(question: str, db_session, category: str = None, top_k: int = 4):
    query_vector = embeddings_model.embed_query(question)
    
    # Base query: Select DocumentChunks, order by distance
    stmt = select(DocumentChunk).join(KnowledgeSource)
    
    # Filter by category if provided and not "default" or "chitchat"
    if category and category.lower() not in ["default", "chitchat"]:
        stmt = stmt.where(KnowledgeSource.category == category)
        
    # Vector Search (L2 distance)
    # Using the <-> operator for L2 distance from pgvector
    stmt = stmt.order_by(DocumentChunk.embedding.l2_distance(query_vector)).limit(top_k)
    
    result = await db_session.execute(stmt)
    chunks = result.scalars().all()
    
    return chunks

async def generate_answer(question: str, db_session, category: str = None):
    # Handle Chitchat/Generic
    if category == "chitchat":
        answer = await chitchat_chain.ainvoke({"question": question})
        return {"answer": answer, "sources": [], "context_used": "General Conversation"}

    docs = await get_relevant_documents(question, db_session, category)
    
    if not docs:
        return {"answer": "Lo siento, no dispongo de información suficiente en mi base de conocimientos para responder a esa pregunta.", "sources": []}
        
    context_text = "\n\n".join([doc.content for doc in docs])
    
    answer = await chain.ainvoke({"context": context_text, "question": question})
    
    # Extract sources
    sources = list(set([doc.source_id for doc in docs])) # Just IDs for now, could fetch names
    
    return {"answer": answer, "sources": sources, "context_used": context_text}
