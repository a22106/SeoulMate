# Backend CLAUDE.md

## Project Structure

```
backend/
├── main.py              # FastAPI app 초기화, lifespan(DB pool), 미들웨어 설정
├── routers/             # API 라우터 (도메인별 분리)
│   ├── chat.py          # /api/chat 관련 엔드포인트
│   └── health.py        # /health 헬스체크 (DB 연결 확인 포함)
├── services/            # 비즈니스 로직 (모듈별 분리)
│   ├── gemini.py        # Gemini API 호출, 프롬프트 구성
│   └── database.py      # PostgreSQL 비동기 커넥션 풀 (psycopg)
├── schemas/             # Pydantic 모델 (요청/응답 스키마)
│   └── chat.py          # ChatRequest, HistoryMessage 등
├── tests/               # pytest 테스트 코드
│   └── test_gemini.py   # services/gemini.py 테스트
├── pyproject.toml       # uv 프로젝트 설정
└── .env.example
```

## Rules

### 1. 라우터 분리

- `main.py`에 직접 `@app.get`, `@app.post` 를 정의하지 않는다.
- 모든 엔드포인트는 `routers/` 디렉토리에 `APIRouter`로 작성하고, `main.py`에서 `app.include_router()`로 등록한다.
- 라우터 파일은 도메인 단위로 분리한다 (chat, health 등).
- 라우터 함수는 요청 파싱 → 서비스 호출 → 응답 반환만 담당한다. 비즈니스 로직을 포함하지 않는다.

### 2. 비즈니스 로직 분리

- 비즈니스 로직은 `services/` 디렉토리에 모듈별로 작성한다.
- 라우터는 서비스 함수를 호출할 뿐, Gemini API 호출·프롬프트 구성·데이터 변환 등을 직접 수행하지 않는다.
- 서비스 함수는 FastAPI 의존성(Request, Response 등)을 직접 참조하지 않는다. 순수 Python 함수로 유지한다.

### 3. 스키마 분리

- Pydantic 모델(요청/응답)은 `schemas/` 디렉토리에 도메인별로 정의한다.
- 라우터와 서비스 모두 `schemas/`에서 import 하여 사용한다.

### 4. main.py 역할 제한

`main.py`는 아래 역할만 수행한다:
- FastAPI 앱 인스턴스 생성
- `lifespan`으로 DB 커넥션 풀 초기화/종료 관리
- 미들웨어 설정 (CORS 등)
- 라우터 등록 (`include_router`)

### 5. 데이터베이스 — psycopg (async)

- `services/database.py`에서 `AsyncConnectionPool`을 관리한다.
- `main.py`의 `lifespan`에서 `init_pool()` / `close_pool()`을 호출한다.
- 라우터/서비스에서 DB 접근 시 `get_pool()`로 풀을 가져와 사용한다.
- ORM 없이 raw SQL을 사용한다. 스키마는 `db/init.sql`에서 관리한다.
- `DATABASE_URL` 환경변수가 필수이다. 미설정 시 앱 시작이 실패한다.
- 로컬: `localhost:27361` (Docker Compose) / Production: `localhost:5432` (VM의 기존 PostgreSQL)

### 6. 패키지 관리 — uv 사용

- 패키지 매니저는 **uv**를 사용한다. `pip`를 직접 사용하지 않는다.
- 의존성 추가: `uv add <package>`
- 개발 의존성 추가: `uv add --dev <package>`
- 의존성 설치: `uv sync`
- 스크립트 실행: `uv run <command>` (예: `uv run uvicorn main:app --reload`)
- `pyproject.toml`로 프로젝트를 관리하고, `requirements.txt`는 사용하지 않는다.

### 7. 테스트 — pytest

- `services/`의 비즈니스 로직은 반드시 `tests/` 디렉토리에 pytest 테스트를 작성한다.
- 테스트 파일 네이밍: `tests/test_<모듈명>.py` (예: `tests/test_gemini.py`)
- 외부 API 호출(Gemini 등)은 mock 처리하여 테스트한다. 실제 API를 호출하지 않는다.
- 테스트 실행: `uv run pytest`
- 새로운 서비스 함수를 추가하면, 해당 함수의 테스트도 함께 작성한다.
