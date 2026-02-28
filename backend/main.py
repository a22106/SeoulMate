from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, health

app = FastAPI(title="SeoulMate API")

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
app.include_router(health.router)
