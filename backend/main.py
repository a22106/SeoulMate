from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, conversation, health, voice
from services.database import close_pool, init_pool
from services.secrets import load_secrets

# dotenv보다 먼저 Secret Manager에서 환경변수를 로드한다.
# GCP_SECRET_ENV가 설정되어 있으면 Secret Manager 사용, 없으면 기존 .env 방식.
load_secrets()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()


app = FastAPI(title="SeoulMate API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://seoulmate.piusdev.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(conversation.router)
app.include_router(health.router)
app.include_router(voice.router)
