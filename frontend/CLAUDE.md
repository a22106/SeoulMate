# Frontend CLAUDE.md

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router (pages, layout, globals)
│   ├── components/       # React 컴포넌트
│   └── lib/              # 유틸리티, API 클라이언트 등 비즈니스 로직
├── public/               # 정적 파일
├── biome.json            # Biome (lint + format) 설정
├── next.config.ts        # Next.js 설정
├── tsconfig.json         # TypeScript 설정
└── package.json
```

## Rules

### 1. 패키지 관리 — pnpm 사용

- 패키지 매니저는 **pnpm**을 사용한다.
- 의존성 추가: `pnpm add <package>`
- 개발 의존성 추가: `pnpm add -D <package>`
- 스크립트 실행: `pnpm <script>` (예: `pnpm dev`, `pnpm build`)

### 2. Lint & Format — Biome 사용

- ESLint 대신 **Biome**을 사용한다.
- 린트 검사: `pnpm lint`
- 자동 수정: `pnpm lint:fix`
- 새 코드를 작성한 후 반드시 `pnpm lint`를 실행하여 오류가 없는지 확인한다.

### 3. 테스트 — 비즈니스 로직 단위 테스트

- `src/lib/` 디렉토리의 비즈니스 로직(유틸리티 함수, API 클라이언트, 데이터 변환 등)은 반드시 단위 테스트를 작성한다.
- 테스트 파일 위치: 해당 모듈과 같은 디렉토리에 `*.test.ts` (또는 `*.test.tsx`) 파일로 작성한다.
  - 예: `src/lib/api.ts` → `src/lib/api.test.ts`
- 외부 API 호출(fetch 등)은 mock 처리하여 테스트한다. 실제 네트워크 요청을 보내지 않는다.
- 새로운 비즈니스 로직 함수를 추가하면, 해당 함수의 테스트도 함께 작성한다.
- 테스트 실행: `pnpm test`
