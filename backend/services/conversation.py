from services.database import get_pool


async def create_conversation(language: str = "English") -> dict:
    pool = get_pool()
    async with pool.connection() as conn:
        row = await conn.execute(
            "INSERT INTO conversations (language) VALUES (%s) RETURNING *",
            (language,),
        )
        return await row.fetchone()


async def get_conversation(conversation_id: str) -> dict | None:
    pool = get_pool()
    async with pool.connection() as conn:
        row = await conn.execute(
            "SELECT * FROM conversations WHERE id = %s",
            (conversation_id,),
        )
        return await row.fetchone()


async def get_messages(conversation_id: str) -> list[dict]:
    pool = get_pool()
    async with pool.connection() as conn:
        rows = await conn.execute(
            "SELECT * FROM messages WHERE conversation_id = %s ORDER BY created_at ASC",
            (conversation_id,),
        )
        return await rows.fetchall()


async def save_message(
    conversation_id: str, role: str, text: str, image_included: bool = False
) -> dict:
    pool = get_pool()
    async with pool.connection() as conn:
        async with conn.transaction():
            row = await conn.execute(
                "INSERT INTO messages (conversation_id, role, text, image_included) "
                "VALUES (%s, %s, %s, %s) RETURNING *",
                (conversation_id, role, text, image_included),
            )
            await conn.execute(
                "UPDATE conversations SET updated_at = NOW() WHERE id = %s",
                (conversation_id,),
            )
            return await row.fetchone()
