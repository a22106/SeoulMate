# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SeoulMate** — Gemini 3 Seoul Hackathon project (Feb 28, 2026). AI agent helping foreign residents in Seoul navigate daily life through photo-based document interpretation and conversational Q&A. Uses Gemini multimodal analysis with Google Search Grounding.

**Track**: Gemini for Social Good | **Team**: 1 person + Claude Code | **Deadline**: 5 PM submission, 1-min demo video

## Commands

```bash
# Frontend (frontend/)
pnpm install
pnpm dev              # localhost:3000
pnpm build
pnpm lint

# Backend (backend/)
uv sync               # install dependencies (NOT pip)
uv run uvicorn main:app --reload   # localhost:8000
uv run pytest          # run tests
uv run pytest tests/test_gemini.py # single test file
uv add <package>       # add dependency
uv add --dev <package> # add dev dependency

# Database (local dev)
docker compose up -d   # PostgreSQL 16 on localhost:5432
```

## Environment Variables

```bash
# backend/.env (see backend/.env.example)
GEMINI_API_KEY=...              # from Google AI Studio
DATABASE_URL=postgresql://seoulmate:seoulmate@localhost:5432/seoulmate

# frontend (inline or .env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000   # default
```

## Architecture

Monorepo with PostgreSQL persistence. Conversations and messages stored in DB; chat history loaded per conversation.

```
hackerton/
├── frontend/          # Next.js 15 + React 19 + Tailwind CSS 4 + TypeScript
├── backend/           # FastAPI (Python 3.13+) + google-genai SDK + psycopg (async)
├── db/                # init.sql — schema with IF NOT EXISTS for idempotency
└── docs/              # PRD (prd.md), design system (seoulmate-design-system.jsx)
```

### Frontend Data Flow

`page.tsx` (language state, SOS modal, history panel) → `ChatInterface` (messages + streaming) → `ChatInput` / `MessageBubble`

Dynamic route: `chat/[id]/page.tsx` loads existing conversations with `enableVoice` prop.

- State lives in React hooks (no state management library)
- Images are Base64-encoded client-side, sent inline in JSON
- SSE streaming via Fetch API with manual event parsing (`lib/api.ts`)
- Markdown rendering in AI bubbles uses regex-based line-by-line parser (no remark/marked)
- i18n: 5 languages (English, 한국어, 中文, Tiếng Việt, 日本語) via `lib/i18n.ts`
- SOS emergency module: `lib/sos.ts` + `SOSModal.tsx` (Police 112, Fire 119, Hospital 1339)
- Web Speech API for voice input (browser-native, integrated in `ChatInput`)
- Path alias: `@/*` → `./src/*`
- Design tokens defined as CSS variables in `globals.css` `@theme` block

### Backend Conventions (see also `backend/CLAUDE.md`)

- **Routers** (`routers/`): request parsing → service call → response only. No business logic.
  - `chat.py` — `POST /api/chat` (SSE streaming, persists messages after success)
  - `conversation.py` — CRUD: `GET/POST /api/conversations`, `GET /api/conversations/{id}`
  - `health.py` — `GET /health` (DB connectivity check)
  - `voice.py` — `WebSocket /api/voice` (Gemini Live API bidirectional audio)
- **Services** (`services/`): pure Python functions, no FastAPI imports. Gemini API calls live here.
  - `gemini.py` — synchronous streaming chat with Google Search Grounding
  - `gemini_live.py` — async Gemini Live API for voice (model: `gemini-2.5-flash-native-audio-preview`)
  - `conversation.py` — DB operations for conversations and messages
  - `database.py` — `AsyncConnectionPool` (psycopg), initialized in FastAPI lifespan
- **Schemas** (`schemas/`): Pydantic models shared by routers and services.
- **main.py**: app init, lifespan (DB pool), CORS middleware, router registration. No endpoints.
- **Tests**: `uv run pytest`. Mock all external API calls. Test file naming: `tests/test_<module>.py`.

### Database Schema (`db/init.sql`)

Two tables, raw SQL via psycopg (no ORM):
- `conversations` — id (UUID), language, created_at, updated_at
- `messages` — id (UUID), conversation_id (FK CASCADE), role (user|assistant), text, image_included, created_at

### SSE Streaming Contract (POST /api/chat)

Request:

```json
{
  "message": "str",
  "image": "base64|null",
  "language": "English",
  "history": [{ "role": "user|assistant", "text": "str", "image": "base64|null" }],
  "conversation_id": "uuid|null"
}
```

Response (text/event-stream):

```
data: {"type": "text", "content": "chunk"}\n\n
data: [DONE]\n\n
```

### Current Gemini Models

- Chat: `gemini-3-flash-preview` in `services/gemini.py`. Use Flash during dev, Pro for demo.
- Voice: `gemini-2.5-flash-native-audio-preview-12-2025` in `services/gemini_live.py`.

## Design System

Defined in `docs/seoulmate-design-system.jsx`. Light mode only.

- **Primary**: Seoul Blue `#2563EB` | **Secondary**: Hanok Coral `#F97316`
- **Fonts**: Outfit (headings) + Pretendard Variable (body/Korean) + JetBrains Mono (code)
- **Mobile-first**: camera button prominent, card-based results, safe-area insets

## Deployment

- **Production backend**: `docker-compose.prod.yml` on port 30002
- **GitHub Actions** (`.github/workflows/deploy.yml`): triggers on `backend/**` changes to main
- **CORS origins**: `https://seoulmate.piusdev.com`, `http://localhost:3000`

## Key Constraints

- **Hackathon scoring**: Demo 50%, Impact 25%, Creativity 15%, Pitch 10%
- **Prohibited**: basic chatbots, simple image analyzers, Streamlit apps, medical/mental health advisors
- **Full PRD**: `docs/prd.md` | **Rules**: `hackerton-rules.md`
