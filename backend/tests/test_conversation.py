from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from services.conversation import (
    create_conversation,
    get_conversation,
    get_messages,
    save_message,
)


def _make_mock_pool(rows=None, fetchone=None):
    """Create a mock pool with async context managers for connection and transaction."""
    mock_cursor = AsyncMock()
    mock_cursor.fetchone = AsyncMock(return_value=fetchone)
    mock_cursor.fetchall = AsyncMock(return_value=rows or [])

    mock_conn = AsyncMock()
    mock_conn.execute = AsyncMock(return_value=mock_cursor)
    mock_conn.transaction = MagicMock(return_value=AsyncMock())

    mock_pool = MagicMock()
    mock_pool.connection = MagicMock(return_value=AsyncMock(__aenter__=AsyncMock(return_value=mock_conn), __aexit__=AsyncMock()))

    return mock_pool, mock_conn


@pytest.mark.asyncio
@patch("services.conversation.get_pool")
async def test_create_conversation(mock_get_pool):
    fake_row = {"id": "abc-123", "language": "English", "created_at": "2026-01-01", "updated_at": "2026-01-01"}
    mock_pool, mock_conn = _make_mock_pool(fetchone=fake_row)
    mock_get_pool.return_value = mock_pool

    result = await create_conversation("English")

    assert result == fake_row
    mock_conn.execute.assert_called_once()
    call_args = mock_conn.execute.call_args
    assert "INSERT INTO conversations" in call_args[0][0]


@pytest.mark.asyncio
@patch("services.conversation.get_pool")
async def test_get_conversation_found(mock_get_pool):
    fake_row = {"id": "abc-123", "language": "English"}
    mock_pool, mock_conn = _make_mock_pool(fetchone=fake_row)
    mock_get_pool.return_value = mock_pool

    result = await get_conversation("abc-123")

    assert result == fake_row
    call_args = mock_conn.execute.call_args
    assert "SELECT * FROM conversations" in call_args[0][0]


@pytest.mark.asyncio
@patch("services.conversation.get_pool")
async def test_get_conversation_not_found(mock_get_pool):
    mock_pool, _ = _make_mock_pool(fetchone=None)
    mock_get_pool.return_value = mock_pool

    result = await get_conversation("nonexistent")

    assert result is None


@pytest.mark.asyncio
@patch("services.conversation.get_pool")
async def test_get_messages(mock_get_pool):
    fake_msgs = [
        {"id": "m1", "conversation_id": "abc", "role": "user", "text": "hi"},
        {"id": "m2", "conversation_id": "abc", "role": "assistant", "text": "hello"},
    ]
    mock_pool, mock_conn = _make_mock_pool(rows=fake_msgs)
    mock_get_pool.return_value = mock_pool

    result = await get_messages("abc")

    assert len(result) == 2
    assert result[0]["role"] == "user"
    call_args = mock_conn.execute.call_args
    assert "ORDER BY created_at ASC" in call_args[0][0]


@pytest.mark.asyncio
@patch("services.conversation.get_pool")
async def test_save_message(mock_get_pool):
    fake_msg = {"id": "m1", "conversation_id": "abc", "role": "user", "text": "hi", "image_included": False}
    mock_pool, mock_conn = _make_mock_pool(fetchone=fake_msg)
    mock_get_pool.return_value = mock_pool

    result = await save_message("abc", "user", "hi", False)

    assert result == fake_msg
    # Should have 2 execute calls: INSERT message + UPDATE conversations
    assert mock_conn.execute.call_count == 2
