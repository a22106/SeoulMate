# SeoulMate

외국인 거주자를 위한 AI 서울 생활 도우미. 사진 기반 문서 해석과 대화형 Q&A로 서울 생활의 언어 장벽을 해소합니다.

> Gemini 3 Seoul Hackathon (2026.02.28) — Track: Gemini for Social Good

## 핵심 기능

- **사진 기반 문서 해석** — 계약서, 고지서, 안내문, 허가증 등을 촬영하면 AI가 내용을 분석하고 행동 가이드 제공
- **대화형 Q&A** — 주거, 분리수거, 의료, 비자, 교통, 금융 등 서울 생활 전반에 대한 질문 응답
- **다국어 지원** — 영어, 한국어, 중국어, 베트남어, 일본어
- **실시간 정보** — Google Search Grounding으로 최신 규정/서비스 정보 반영

## 기술 스택

| 영역 | 스택 |
|------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4, TypeScript |
| Backend | FastAPI, Python 3.13+, google-genai SDK |
| AI Model | Gemini 3 Flash Preview (멀티모달 + Search Grounding) |
| Database | PostgreSQL 16 (Docker Compose) |
| 패키지 매니저 | pnpm (frontend), uv (backend) |
| 린터 | Biome |

## 프로젝트 구조

```
hackerton/
├── frontend/          # Next.js 앱
│   └── src/
│       ├── app/       # 페이지, 레이아웃, 글로벌 스타일
│       ├── components/  # Header, ChatInterface, MessageBubble, ChatInput
│       └── lib/       # API 유틸, i18n
├── backend/           # FastAPI 서버
│   ├── routers/       # 엔드포인트 (chat, health)
│   ├── services/      # Gemini API, DB 연결
│   └── schemas/       # Pydantic 모델
├── db/                # PostgreSQL 마이그레이션, Docker 설정
└── docs/              # PRD, 디자인 시스템
```

## 시작하기

### 사전 준비

- Node.js 18+, pnpm
- Python 3.13+, [uv](https://docs.astral.sh/uv/)
- Docker (PostgreSQL용)

### 환경 변수

```bash
# backend/.env
GEMINI_API_KEY=...              # Google AI Studio에서 발급
DATABASE_URL=postgresql://...   # Docker Compose 사용 시 자동 설정
```

### 실행

```bash
# 1. DB 실행
docker compose up -d

# 2. Backend
cd backend
uv sync
uv run uvicorn main:app --reload   # localhost:8000

# 3. Frontend
cd frontend
pnpm install
pnpm dev                           # localhost:3000
```

## API

### `POST /api/chat`

SSE 스트리밍으로 응답을 반환합니다.

**Request:**
```json
{
  "message": "이 고지서 내용이 뭔가요?",
  "image": "base64 | null",
  "language": "English",
  "history": [
    { "role": "user", "text": "...", "image": "base64 | null" },
    { "role": "assistant", "text": "..." }
  ]
}
```

**Response** (`text/event-stream`):
```
data: {"type": "text", "content": "chunk"}\n\n
data: [DONE]\n\n
```

### `GET /health`

서버 및 DB 연결 상태 확인.

## 테스트

```bash
cd backend
uv run pytest
```

## 라이선스

Hackathon project — not licensed for production use.
