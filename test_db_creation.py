import asyncio
import uuid
from backend.database import engine, Base
from backend.models import Conversation

async def test_db():
    print("Initializing DB...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("DB Initialized")

if __name__ == "__main__":
    asyncio.run(test_db())
