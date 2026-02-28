import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

MODEL = "gemini-2.5-flash-native-audio-preview-12-2025"
FALLBACK_MODEL = "gemini-2.0-flash-live-001"

VOICE_SYSTEM_PROMPT = """You are SeoulMate, a friendly voice assistant for foreigners in Seoul.
Keep answers short and conversational — 1-3 sentences max.
Help with Korean life: documents, transport, food, admin, emergencies.
If the user speaks Korean, respond in Korean. Otherwise match their language.
Pronounce Korean words slowly and clearly when teaching phrases."""


def _get_async_client() -> genai.Client:
    if os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() == "true":
        return genai.Client(
            vertexai=True,
            project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
        )
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


async def create_live_session(language: str = "English"):
    client = _get_async_client()
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        system_instruction=types.Content(
            parts=[
                types.Part.from_text(
                    text=f"{VOICE_SYSTEM_PROMPT}\nUser's preferred language: {language}"
                )
            ]
        ),
    )
    try:
        session = client.aio.live.connect(model=MODEL, config=config)
    except Exception:
        session = client.aio.live.connect(model=FALLBACK_MODEL, config=config)
    return session
