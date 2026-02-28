from unittest.mock import MagicMock, patch

from schemas.chat import ChatRequest, HistoryMessage
from services.gemini import _build_contents, stream_chat


class TestBuildContents:
    def test_simple_text_message(self):
        req = ChatRequest(message="Hello")
        contents = _build_contents(req)

        assert len(contents) == 1
        assert contents[0].role == "user"

    def test_adds_language_suffix_for_non_english(self):
        req = ChatRequest(message="Hello", language="Korean")
        contents = _build_contents(req)

        last_part_text = contents[-1].parts[-1].text
        assert "[Please respond in Korean]" in last_part_text

    def test_no_language_suffix_for_english(self):
        req = ChatRequest(message="Hello", language="English")
        contents = _build_contents(req)

        last_part_text = contents[-1].parts[-1].text
        assert "[Please respond in" not in last_part_text

    def test_history_preserved(self):
        history = [
            HistoryMessage(role="user", text="Hi"),
            HistoryMessage(role="assistant", text="Hello!"),
        ]
        req = ChatRequest(message="Follow up", history=history)
        contents = _build_contents(req)

        assert len(contents) == 3
        assert contents[0].role == "user"
        assert contents[1].role == "model"
        assert contents[2].role == "user"

    def test_image_included_as_first_part(self):
        # base64 of a single pixel
        fake_image = "iVBORw0KGgo="
        req = ChatRequest(message="What is this?", image=fake_image)
        contents = _build_contents(req)

        # image part should come before text part
        assert len(contents[0].parts) == 2


class TestStreamChat:
    @patch("services.gemini._get_client")
    def test_stream_yields_sse_and_done(self, mock_get_client):
        mock_chunk = MagicMock()
        mock_chunk.text = "Hello world"

        mock_response = [mock_chunk]
        mock_client = MagicMock()
        mock_client.models.generate_content_stream.return_value = mock_response
        mock_get_client.return_value = mock_client

        req = ChatRequest(message="Hi")
        chunks = list(stream_chat(req))

        assert len(chunks) == 2
        assert '"content": "Hello world"' in chunks[0]
        assert chunks[-1] == "data: [DONE]\n\n"
