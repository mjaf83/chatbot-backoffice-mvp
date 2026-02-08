from fastapi import FastAPI
from database import init_db
from api.routes import router as api_router
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown

app = FastAPI(title="Chatbot RAG API", version="0.1.0", lifespan=lifespan)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Chatbot RAG API"}
