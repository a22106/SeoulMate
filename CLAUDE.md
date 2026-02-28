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
uv add <package>       # add dependency
uv add --dev <package> # add dev dependency
```

## Environment Variables

```bash
# backend/.env (see backend/.env.example)
GEMINI_API_KEY=...              # from Google AI Studio

# frontend (inline or .env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000   # default
```

## Architecture

Monorepo, stateless MVP (no database). Client-side message history passed per request.

```
hackerton/
├── frontend/          # Next.js 15 + React 19 + Tailwind CSS 4 + TypeScript
├── backend/           # FastAPI (Python 3.13+) + google-genai SDK
└── docs/              # PRD (prd.md), design system (seoulmate-design-system.jsx)
```

### Frontend Data Flow

`page.tsx` (language state) → `ChatInterface` (messages + streaming) → `ChatInput` / `MessageBubble`

- State lives in React hooks (no state management library)
- Images are Base64-encoded client-side, sent inline in JSON
- SSE streaming via Fetch API with manual event parsing (`lib/api.ts`)
- Markdown rendering in AI bubbles uses simple regex (no remark/marked library)
- Path alias: `@/*` → `./src/*`
- Design tokens defined as CSS variables in `globals.css` `@theme` block

### Backend Conventions (see also `backend/CLAUDE.md`)

- **Routers** (`routers/`): request parsing → service call → response only. No business logic.
- **Services** (`services/`): pure Python functions, no FastAPI imports. Gemini API calls live here.
- **Schemas** (`schemas/`): Pydantic models shared by routers and services.
- **main.py**: only app init, CORS middleware, router registration. No endpoint definitions.
- **Tests**: `uv run pytest`. Mock all external API calls. Test file naming: `tests/test_<module>.py`.

### SSE Streaming Contract (POST /api/chat)

Request:
```json
{"message": "str", "image": "base64|null", "language": "English", "history": [{"role": "user|assistant", "text": "str", "image": "base64|null"}]}
```

Response (text/event-stream):
```
data: {"type": "text", "content": "chunk"}\n\n
data: [DONE]\n\n
```

### Current Gemini Model

`gemini-2.5-flash-preview-05-20` in `services/gemini.py`. Use Flash during dev, Pro for demo ($20 API budget).

## Design System

Defined in `docs/seoulmate-design-system.jsx`. Light mode only.

- **Primary**: Seoul Blue `#2563EB` | **Secondary**: Hanok Coral `#F97316`
- **Fonts**: Outfit (headings) + Pretendard Variable (body/Korean) + JetBrains Mono (code)
- **Mobile-first**: camera button prominent, card-based results, safe-area insets

## Key Constraints

- **Hackathon scoring**: Demo 50%, Impact 25%, Creativity 15%, Pitch 10%
- **Prohibited**: basic chatbots, simple image analyzers, Streamlit apps, medical/mental health advisors
- **Full PRD**: `docs/prd.md` | **Rules**: `hackerton-rules.md`
