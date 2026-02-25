# Chatbot RAG with Dynamic Sources

A professional RAG (Retrieval-Augmented Generation) chatbot capable of answering questions from multiple data sources.

## Features
- **Multi-Source Ingestion**:
    - **Files**: PDF, Text, Markdown.
    - **Manual Entries**: Direct input via Admin UI.
    - **SQL Views**: Connect to external databases (Postgres/MySQL) and ingest content from SQL queries.
- **Intelligent Routing**: Classifies user queries to target the right knowledge category (HR, Tech, Sales, etc.).
- **Local AI**: Uses **Ollama** (Llama 3.1 + Nomic Embeddings) for privacy and zero cost.
- **Vector Database**: PostgreSQL with `pgvector`.
- **Admin Dashboard**: Manage sources and upload files.

## Prerequisites
1. **Docker Desktop** (for PostgreSQL + pgvector).
2. **Ollama** installed locally.
   - Run: `ollama pull llama3.1:8b`
   - Run: `ollama pull nomic-embed-text`
   - Start: `ollama serve`
3. **Node.js** (v18+) and **Python** (v3.10+).

## Quick Start
Double-click `start_app.bat` to launch everything.

## Manual Setup

### 1. Database
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# Update .env with your settings (though we use local Ollama by default now)
uvicorn main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Access
- **Chat**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API Docs**: http://localhost:8000/docs
