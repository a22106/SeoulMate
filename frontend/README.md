# SeoulMate Frontend

서울 거주 외국인을 위한 AI 생활 에이전트의 웹 클라이언트.
채팅 기반 UI로 텍스트 질문과 사진 촬영/업로드를 통한 문서 분석을 제공한다.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Fonts**: Outfit (headings) + Pretendard (body)

## Quick Start

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:3000
```

백엔드 서버가 `http://localhost:8000`에서 실행 중이어야 한다.

## Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint 실행 |

## Project Structure

```
frontend/src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (폰트, 메타데이터)
│   ├── page.tsx            # 메인 페이지 (Header + ChatInterface)
│   └── globals.css         # 디자인 토큰, Tailwind 테마, 마크다운 스타일
├── components/
│   ├── Header.tsx          # 상단바 — 로고 + 언어 선택
│   ├── ChatInterface.tsx   # 채팅 컨테이너 — 웰컴 화면, 메시지 목록, SSE 스트리밍
│   ├── MessageBubble.tsx   # 메시지 버블 — 유저(파랑/우측), AI(회색/좌측)
│   └── ChatInput.tsx       # 입력바 — 텍스트, 카메라, 전송, 이미지 미리보기
└── lib/
    └── api.ts              # SSE fetch 유틸리티
```

## Features

- **통합 채팅**: 텍스트 질문 + 이미지 첨부를 하나의 인터페이스에서 처리
- **SSE 스트리밍**: AI 응답을 실시간으로 렌더링
- **이미지 업로드**: 카메라 촬영 또는 갤러리 선택 → Base64 변환 후 전송
- **마크다운 렌더링**: AI 응답의 제목, 볼드, 리스트, 링크 등을 파싱하여 표시
- **퀵 가이드**: 웰컴 화면에 6개 카테고리 버튼 (주거, 분리수거, 의료, 비자, 교통, 금융)
- **다국어 선택**: EN / KR / CN / VN / JP 전환, 선택한 언어로 API 요청
- **모바일 퍼스트**: 카메라 버튼 강조, safe-area 대응, 반응형 레이아웃

## Design System

| 토큰 | 값 |
|------|-----|
| Primary (Seoul Blue) | `#2563EB` |
| Secondary (Hanok Coral) | `#F97316` |
| Background | `#FAFBFD` |
| Text Primary | `#0F172A` |
| Text Secondary | `#475569` |
| Font Display | Outfit 700 |
| Font Body | Pretendard 400 |

## Environment Variables

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | `http://localhost:8000` |
