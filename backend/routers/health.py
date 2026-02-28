from fastapi import APIRouter

from services.database import get_pool

router = APIRouter()


@router.get("/health")
async def health():
    pool = get_pool()
    async with pool.connection() as conn:
        await conn.execute("SELECT 1")
    return {"status": "ok", "db": "connected"}
