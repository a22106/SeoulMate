# SeoulMate Backend

서울 거주 외국인을 위한 AI 생활 에이전트 API 서버.
Gemini 멀티모달 API를 활용한 문서 해석 + 생활 상담 채팅 기능을 제공한다.

## Tech Stack

- **Framework**: FastAPI
- **AI Model**: Gemini 2.5 Flash (`gemini-2.5-flash-preview-05-20`)
- **Search**: Google Search Grounding (실시간 행정 정보)
- **Package Manager**: uv

## Quick Start

```bash
# 의존성 설치
uv sync

# 환경 변수 설정
cp .env.example .env
# .env 파일에 GEMINI_API_KEY 입력

# 개발 서버 실행
uv run uvicorn main:app --reload
# → http://localhost:8000
```

## API Endpoints

### `POST /api/chat`

통합 채팅 엔드포인트. 텍스트 질문과 이미지 분석을 모두 처리한다.

**Request Body:**

```json
{
  "message": "How do I sort recycling in Gangnam?",
  "image": null,
  "language": "English",
  "history": []
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `message` | `string` | 사용자 메시지 (필수) |
| `image` | `string?` | Base64 인코딩된 이미지 (선택) |
| `language` | `string` | 응답 언어 (기본: `"English"`) |
| `history` | `array` | 이전 대화 내역 `[{role, text, image?}]` |

**Response:** `text/event-stream` (SSE)

```
data: {"type": "text", "content": "In Gangnam-gu, recycling..."}

data: {"type": "text", "content": " follows a specific schedule."}

data: [DONE]
```

### `GET /health`

헬스 체크. `{"status": "ok"}` 반환.

## Project Structure

```
backend/
├── main.py              # FastAPI 앱, CORS, 라우터 등록
├── routers/
│   ├── chat.py          # POST /api/chat
│   └── health.py        # GET /health
├── services/
│   └── gemini.py        # Gemini API 호출, 프롬프트, 스트리밍
├── schemas/
│   └── chat.py          # ChatRequest, HistoryMessage
├── tests/
│   └── test_gemini.py   # 서비스 테스트
└── pyproject.toml       # 의존성 정의
```

## Testing

```bash
uv run pytest
```

## Environment Variables

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | Google AI Studio에서 발급한 Gemini API 키 |
