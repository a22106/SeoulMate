# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SeoulMate** — Gemini 3 Seoul Hackathon project (Feb 28, 2026). AI agent helping foreign residents in Seoul navigate daily life through photo-based document interpretation and conversational Q&A. Uses Google Gemini 3.1 Pro for multimodal analysis with Google Search Grounding.

**Track**: Gemini for Social Good
**Team**: 1 person + Claude Code
**Deadline**: 5 PM submission, 1-min demo video required

## Expected Commands

```bash
# Frontend (frontend/)
cd frontend
npm install
npm run dev          # localhost:3000
npm run build
npm run lint

# Backend (backend/)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload  # localhost:8000
```

## Architecture

Monorepo with three-tier stateless MVP:

```
hackerton/
├── frontend/          # Next.js 15 + TypeScript + Tailwind CSS
├── backend/           # FastAPI (Python) → Gemini API
└── docs/              # PRD, design system
```

- **No database** — stateless for hackathon scope
- **Streaming responses** (SSE) for AI calls
- **Function calling** for structured data (district info, visa procedures)
- **Google Search Grounding** for real-time administrative info

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS      |
| Backend  | FastAPI (Python)                            |
| AI Model | Gemini 3.1 Pro (gemini-3.1-pro-preview)     |
| Search   | Google Search Grounding                     |
| Deploy   | Vercel (frontend) + Cloud Run (backend)     |

## Core Features (Priority Order)

**P0**: Image upload + Gemini Vision analysis, Chat Q&A with Search Grounding, multilingual response (EN + 2 more)
**P1**: Mobile responsive UI + camera, 3 quick guide categories, Function Calling for district-specific info
**P2**: UI polish, error handling, demo prep

## Design System

Defined in `docs/seoulmate-design-system.jsx`. Light mode only.

- **Primary**: Seoul Blue `#2563EB` (trust, CTA)
- **Secondary**: Hanok Coral `#F97316` (accent, alerts)
- **Typography**: Outfit (headings) + Pretendard (body, Korean support) + JetBrains Mono (code)
- **Radius**: 6/12/16/24px scale
- **Mobile-first**: camera button prominent, card-based results

## Key Constraints

- **Hackathon rules**: `hackerton-rules.md` — demo scoring: Demo 50%, Impact 25%, Creativity 15%, Pitch 10%
- **Prohibited**: basic chatbots, simple image analyzers, Streamlit apps, medical/mental health advisors
- **API budget**: $20 Gemini credit (use Flash during dev, Pro for demo)
- **Full PRD**: `docs/prd.md`
