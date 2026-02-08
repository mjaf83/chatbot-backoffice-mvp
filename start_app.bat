@echo off
echo ==========================================
echo      Chatbot RAG - Startup Script
echo ==========================================

echo [1/3] Starting Database (Docker)...
docker compose up -d
if %errorlevel% neq 0 (
    echo Error starting Docker. Make sure Docker Desktop is running.
    pause
    exit /b
)

echo [2/3] Starting Backend (FastAPI)...
start "Backend API" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload"

echo [3/3] Starting Frontend (Next.js)...
start "Frontend App" cmd /k "cd frontend && npm run dev"

echo ==========================================
echo Services are starting in new windows.
echo - Frontend: http://localhost:3000
echo - Backend Docs: http://localhost:8000/docs
echo ==========================================
pause
