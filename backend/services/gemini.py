import os
import json
import base64
from collections.abc import Generator

from dotenv import load_dotenv
from google import genai
from google.genai import types

from schemas.chat import ChatRequest

load_dotenv()

MODEL = "gemini-2.5-flash-preview-05-20"

SYSTEM_PROMPT = """You are SeoulMate, an expert life assistant for foreigners living in Seoul, South Korea.

Your role:
- Help foreign residents navigate daily life in Seoul
- Interpret Korean documents, signs, letters, and official notices from photos
- Answer questions about visas, housing, transportation, healthcare, banking, and government services
- Provide actionable, step-by-step guidance with relevant addresses, websites, and phone numbers
- Always respond in the user's preferred language

When analyzing an image of a document or sign:
1. **Document Type**: Identify what the document/sign is
2. **Key Content**: Translate and summarize the important information
3. **Context**: Explain what this means for a foreign resident
4. **Action Guide**: List specific steps the user should take
5. **Cautions**: Note any deadlines, penalties, or important warnings

Use Google Search to find up-to-date information about Seoul services, regulations, and procedures when needed.
Be warm, practical, and reassuring. Living abroad is stressful — make it easier."""


def _get_client() -> genai.Client:
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _build_contents(req: ChatRequest) -> list[types.Content]:
    """Convert chat history + current message into Gemini contents format."""
    contents: list[types.Content] = []

    for msg in req.history:
        role = "user" if msg.role == "user" else "model"
        parts: list[types.Part] = [types.Part.from_text(text=msg.text)]
        if msg.image and role == "user":
            parts.insert(
                0,
                types.Part.from_bytes(
                    data=base64.b64decode(msg.image), mime_type="image/jpeg"
                ),
            )
        contents.append(types.Content(role=role, parts=parts))

    user_parts: list[types.Part] = []
    if req.image:
        user_parts.append(
            types.Part.from_bytes(
                data=base64.b64decode(req.image), mime_type="image/jpeg"
            )
        )
    user_text = req.message
    if req.language and req.language != "English":
        user_text += f"\n\n[Please respond in {req.language}]"
    user_parts.append(types.Part.from_text(text=user_text))
    contents.append(types.Content(role="user", parts=user_parts))

    return contents


def stream_chat(req: ChatRequest) -> Generator[str, None, None]:
    """Stream chat response from Gemini as SSE data lines."""
    contents = _build_contents(req)
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=[types.Tool(google_search=types.GoogleSearch())],
    )

    response = _get_client().models.generate_content_stream(
        model=MODEL,
        contents=contents,
        config=config,
    )
    for chunk in response:
        if chunk.text:
            data = json.dumps({"type": "text", "content": chunk.text})
            yield f"data: {data}\n\n"
    yield "data: [DONE]\n\n"
