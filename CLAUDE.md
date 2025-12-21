# Project: English Education Platform

## 개요
영어 학습을 위한 종합 교육 플랫폼. 도서 리더, 어휘 학습, 퀴즈, 오디오 학습, 플래시카드 등 다양한 학습 도구를 제공합니다.

## 기술 스택
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Styling:** Tailwind CSS
- **Auth:** JWT + 2FA (TOTP) + OAuth (Google/Kakao)
- **Error Tracking:** Sentry
- **State Management:** Zustand
- **Deployment:** Vercel (Frontend) / Railway (Backend)

## 프로젝트 구조
```
/
├── apps/
│   └── web/              # React Frontend (Vite)
│       ├── src/
│       │   ├── components/    # React 컴포넌트
│       │   ├── pages/         # 페이지 컴포넌트
│       │   ├── store/         # Zustand 스토어
│       │   ├── lib/           # 유틸리티 함수
│       │   ├── hooks/         # 커스텀 훅
│       │   └── types/         # TypeScript 타입
│       └── package.json
├── backend/               # Express Backend
│   ├── routes/           # API 라우트
│   ├── lib/              # 유틸리티
│   ├── middlewares/      # Express 미들웨어
│   └── __tests__/        # Jest 테스트
├── packages/              # 공유 패키지
│   ├── api-client/       # API 클라이언트
│   └── shared/           # 공유 타입/유틸리티
├── database/              # SQL 스키마
└── scripts/               # 유틸리티 스크립트
```

## 명령어
### Frontend (apps/web)
- `npm run dev` - 개발 서버 (http://localhost:5173)
- `npm run build` - 프로덕션 빌드
- `npm run typecheck` - TypeScript 검사
- `npm run lint` - ESLint 검사
- `npm run verify` - typecheck + lint + build

### Backend (backend)
- `npm run dev` - 개발 서버 (http://localhost:3000)
- `npm test` - Jest 테스트
- `npm run lint` - ESLint 검사

### Root
- `npm run dev` - 개발 서버 (Frontend + Backend 동시)
- `npm run build` - Frontend 빌드
- `npm run test` - 전체 테스트

## 코딩 컨벤션
- 함수형 컴포넌트 + React Hooks 사용
- 절대 경로 import 사용 (@/로 시작)
- TypeScript strict mode (일부 완화)
- 한국어 주석 OK, 변수명은 영어
- Tailwind CSS 유틸리티 클래스 사용

## 환경 변수
### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_VAPID_PUBLIC_KEY` - Push 알림용

### Backend (.env)
- `DATABASE_URL` - PostgreSQL 연결 문자열
- `JWT_SECRET` - JWT 서명 키
- `GOOGLE_CLIENT_ID/SECRET` - Google OAuth
- `KAKAO_CLIENT_ID/SECRET` - Kakao OAuth

## 주의사항
- API 키는 .env 파일에만 저장 (절대 커밋 금지)
- 배포 전 빌드 검증 필수
- `forceConsistentCasingInFileNames: true` 설정으로 파일명 대소문자 일관성 유지
- 데이터베이스 연결 풀 설정 최적화됨 (서버리스 환경 고려)

## CI/CD
- GitHub Actions: `.github/workflows/ci.yml`
- Pre-commit hook: lint-staged로 변경 파일만 검사
- Pre-push hook: 전체 typecheck + build
