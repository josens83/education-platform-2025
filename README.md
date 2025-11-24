# 영어 학습 플랫폼 (English Education Platform)

[![CI/CD](https://github.com/josens83/education-platform-2025/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/josens83/education-platform-2025/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-60%2B%25-brightgreen)](./backend/coverage)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)

구독형 영어 원서 읽기 플랫폼. Storytel 스타일의 이북 리더와 오디오북, AI 기반 학습 지원으로 영어 실력을 향상시킬 수 있는 엔터프라이즈급 웹 애플리케이션입니다.

## 🌟 주요 기능

### 핵심 학습 기능
- ✅ **이북 리더** - 반응형 리딩 인터페이스
- ✅ **오디오북** - 속도 조절 가능한 음성 재생
- ✅ **인터랙티브 퀴즈** - 다양한 문제 유형 지원
- ✅ **단어장 & 플래시카드** - 간격 반복 학습
- ✅ **하이라이트 & 북마크** - 색상별 구분
- ✅ **학습 진도 추적** - 실시간 동기화
- ✅ **학습 통계 & 연속 기록** - 상세한 분석

### AI 기능 🤖
- ✅ **AI 챗봇** (GPT-4) - 학습 지원, 문법 설명
- ✅ **AI 추천 시스템** - 개인화된 콘텐츠 추천
- ✅ **실시간 학습 피드백**

### 인증 & 보안 🔒
- ✅ **JWT 인증** + **OAuth 2.0** (Google, Kakao)
- ✅ **2FA (이중 인증)** - TOTP 기반
- ✅ **이메일 인증** - 계정 보안
- ✅ **세션 관리** - 활성 디바이스 추적
- ✅ **CSRF 보호** - Double-submit cookie
- ✅ **Rate Limiting** - DDoS 방지
- ✅ **SQL Injection & XSS 방지**

### 결제 & 구독 💳
- ✅ **Stripe 통합** - 안전한 결제 처리
- ✅ **4가지 구독 플랜** (무료, 월간, 연간, 가족)
- ✅ **쿠폰 시스템** - 할인 코드 지원
- ✅ **자동 갱신** - 웹훅 처리
- ✅ **결제 이력** - 상세 내역

### 관리자 기능 👨‍💼
- ✅ **종합 대시보드** - 시스템 개요
- ✅ **사용자 관리** - 역할 기반 접근 제어
- ✅ **콘텐츠 관리** - 책, 챕터, 오디오, 퀴즈
- ✅ **분석 & 리포트** - 상세한 통계
- ✅ **쿠폰 관리** - 할인 코드 생성
- ✅ **리뷰 심사** - 콘텐츠 모니터링

### PWA & 실시간 🌐
- ✅ **Progressive Web App** - 오프라인 지원
- ✅ **푸시 알림** - Web Push API
- ✅ **실시간 업데이트** - Socket.IO WebSocket
- ✅ **설치 가능** - 홈 화면 추가

### UX 기능 ✨
- ✅ **글로벌 검색** - 즉시 검색
- ✅ **Command Palette** - 키보드 단축키 (⌘K)
- ✅ **다크 모드** - 시스템 설정 연동
- ✅ **스켈레톤 로딩** - 향상된 체감 성능
- ✅ **온보딩 투어** - 신규 사용자 가이드
- ✅ **알림 센터** - 인앱 알림

### 프로덕션 준비 🚀
- ✅ **Sentry 에러 추적** - 실시간 모니터링
- ✅ **Winston 로깅** - 구조화된 로그, 일일 로테이션
- ✅ **Docker 컨테이너화** - 쉬운 배포
- ✅ **헬스 체크 엔드포인트** - 모니터링
- ✅ **데이터베이스 백업** - 자동화
- ✅ **SEO 최적화** - 검색엔진 최적화

## 🏗️ 기술 스택

### Frontend
- **React 18** + **TypeScript** - 타입 안전한 UI
- **Vite 5** - 초고속 빌드 도구
- **React Router 6** - 클라이언트 사이드 라우팅
- **React Query 3** - 서버 상태 관리
- **Zustand 4** - 클라이언트 상태 관리
- **Tailwind CSS 3.3** - 유틸리티 스타일링
- **Framer Motion** - 부드러운 애니메이션
- **Socket.IO Client** - 실시간 통신

### Backend
- **Node.js 16+** + **Express 4** - RESTful API
- **PostgreSQL 15** - 관계형 데이터베이스
- **JWT** + **Passport.js** - 인증 & OAuth 2.0
- **Stripe** - 결제 처리
- **OpenAI GPT-4** - AI 기능
- **Socket.IO** - 실시간 WebSocket
- **Winston** - 프로덕션 로깅
- **Sentry** - 에러 추적
- **Redis** (선택) - 캐싱 & Socket.IO 확장

### 클라우드 & 인프라
- **AWS S3** - 파일 저장소 (선택)
- **CloudFront** - CDN (선택)
- **SendGrid** - 이메일 서비스 (선택)
- **Docker** + **Docker Compose** - 컨테이너화
- **Nginx** - 리버스 프록시

### 개발 도구
- **Vitest** + **Jest** - 테스트 프레임워크
- **Testing Library** - 컴포넌트 테스트
- **Swagger/OpenAPI** - API 문서화
- **ESLint** + **Prettier** - 코드 품질
- **GitHub Actions** - CI/CD 자동화

## 📊 프로젝트 통계

- **총 코드 라인**: 35,000+ 줄
- **테스트 커버리지**: 60%+
- **API 엔드포인트**: 100+ 개
- **컴포넌트**: 50+ 개
- **데이터베이스 테이블**: 19개
- **총 커밋**: 147개

## 📁 프로젝트 구조

```
education-platform-2025/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD 파이프라인
├── apps/
│   └── web/                    # Frontend (React + Vite + TS)
│       ├── src/
│       │   ├── components/     # 재사용 컴포넌트 (32+)
│       │   ├── pages/          # 페이지 컴포넌트 (27+)
│       │   ├── lib/            # 유틸리티 (5)
│       │   ├── hooks/          # 커스텀 훅 (4)
│       │   ├── store/          # Zustand 스토어
│       │   └── test/           # 테스트 설정
│       └── public/
│           └── offline.html    # PWA 오프라인 페이지
├── backend/                    # Backend (Node.js + Express)
│   ├── routes/                 # API 라우트 (26 파일, 7,215 줄)
│   ├── middleware/             # 미들웨어 (6)
│   ├── lib/                    # 비즈니스 로직 (10)
│   ├── config/                 # 설정 (2)
│   ├── scripts/                # 유틸리티 스크립트
│   ├── __tests__/              # 테스트 (70+ 테스트)
│   └── uploads/                # 업로드 파일 (로컬)
├── packages/
│   ├── api-client/             # API 클라이언트 라이브러리
│   └── shared/                 # 공유 타입/유틸
├── database/
│   └── migrations/             # SQL 마이그레이션 (19)
├── deployment/                 # 배포 설정
├── docker-compose.yml          # Docker 오케스트레이션
├── DEPLOYMENT.md               # 배포 가이드
├── SENTRY_SETUP.md             # Sentry 설정 가이드
└── README.md                   # 이 파일
```

## 🚀 빠른 시작

### 사전 요구사항
- **Node.js** 16 이상
- **PostgreSQL** 12 이상
- **npm** 또는 **yarn**
- **Docker** (선택사항)

### 1. 저장소 클론

```bash
git clone https://github.com/josens83/education-platform-2025.git
cd education-platform-2025
```

### 2. 환경 변수 설정

#### Backend
```bash
cd backend
cp .env.example .env
# .env 파일 편집 (필수 값 입력)
```

**필수 환경 변수:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/education_platform
JWT_SECRET=your-super-secret-key
STRIPE_SECRET_KEY=sk_test_...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**선택 환경 변수 (고급 기능):**
```env
# AWS S3 (파일 저장소)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# SendGrid (이메일)
SENDGRID_API_KEY=...

# Redis (Socket.IO 확장)
REDIS_URL=redis://localhost:6379

# OpenAI (AI 기능)
OPENAI_API_KEY=sk-...

# Sentry (에러 추적)
SENTRY_DSN=https://...@sentry.io/...
```

#### Frontend
```bash
cd apps/web
cp .env.example .env
# .env 파일 편집
```

### 3. 의존성 설치

```bash
# Backend
cd backend
npm install

# Frontend
cd ../apps/web
npm install
```

### 4. 데이터베이스 설정

```bash
cd backend

# 마이그레이션 실행
npm run db:migrate

# 데모 데이터 생성 (선택사항)
npm run db:seed
```

**시드 데이터 포함:**
- 5개 카테고리
- 3개 샘플 책 (The Great Gatsby, 1984, The Hobbit)
- 4개 사용자 (admin, teacher, student, demo)
- 3개 구독 플랜
- 2개 활성 쿠폰

**데모 계정:**
```
Email: demo@example.com
Password: Demo1234!

Admin: admin@example.com / Admin1234!
```

### 5. 개발 서버 실행

```bash
# Backend (터미널 1)
cd backend
npm run dev
# → http://localhost:3001

# Frontend (터미널 2)
cd apps/web
npm run dev
# → http://localhost:3000
```

### 6. API 문서 확인

브라우저에서 접속:
```
http://localhost:3001/api-docs
```

Swagger UI로 모든 API 엔드포인트를 테스트할 수 있습니다.

## 🐳 Docker로 실행

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

서비스:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432

## 🧪 테스트

### Backend 테스트

```bash
cd backend

# 모든 테스트 실행
npm test

# 커버리지 리포트
npm run test:coverage

# Watch 모드
npm run test:watch

# CI 모드 (GitHub Actions)
npm run test:ci
```

### Frontend 테스트

```bash
cd apps/web

# 모든 테스트 실행
npm test

# 커버리지 리포트
npm run test:coverage

# UI 모드
npm run test:ui
```

### E2E 테스트

```bash
# Coming soon - Playwright
```

## 🔍 코드 품질

```bash
# Backend Lint
cd backend
npm run lint
npm run lint:fix

# Frontend Lint
cd apps/web
npm run lint
npm run lint:fix
```

## 📚 API 문서

### Swagger UI (인터랙티브)
```
http://localhost:3001/api-docs
```

### OpenAPI JSON
```
http://localhost:3001/api-docs.json
```

### 주요 엔드포인트

#### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/forgot-password` - 비밀번호 찾기
- `POST /api/auth/verify-email` - 이메일 인증
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/kakao` - Kakao OAuth

#### 2FA
- `POST /api/2fa/setup/start` - 2FA 설정 시작
- `POST /api/2fa/setup/verify` - 2FA 활성화
- `POST /api/2fa/verify` - 2FA 로그인 검증

#### 콘텐츠
- `GET /api/books` - 책 목록
- `GET /api/books/:id` - 책 상세
- `GET /api/chapters/:id` - 챕터 상세
- `GET /api/audio/:id` - 오디오 재생

#### 구독 & 결제
- `GET /api/subscriptions/plans` - 플랜 목록
- `POST /api/payments/create-checkout-session` - 결제 세션 생성
- `GET /api/subscriptions/my` - 내 구독 정보

#### 학습
- `GET /api/progress` - 학습 진도
- `POST /api/vocabulary` - 단어 저장
- `POST /api/quizzes/:id/attempt` - 퀴즈 제출

전체 API 목록은 Swagger 문서에서 확인하세요.

## 🚢 배포

### 프로덕션 체크리스트

- [ ] 환경 변수 모두 설정
- [ ] JWT_SECRET 강력한 키로 변경 (32+ 문자)
- [ ] PostgreSQL 프로덕션 DB 설정
- [ ] Stripe 라이브 키로 변경
- [ ] CORS_ORIGIN 프로덕션 도메인으로 변경
- [ ] HTTPS/SSL 인증서 설정
- [ ] Sentry DSN 설정
- [ ] 데이터베이스 백업 자동화
- [ ] 로그 모니터링 설정
- [ ] Rate Limiting 튜닝

### 배포 옵션

1. **Docker + VPS** (DigitalOcean, Linode 등)
2. **AWS** (ECS, Elastic Beanstalk)
3. **Heroku** (Backend) + **Vercel** (Frontend)
4. **Google Cloud Platform**
5. **Azure**

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

## 🔐 보안

이 프로젝트는 다음 보안 모범 사례를 따릅니다:

- ✅ **SQL Injection 방지** - 파라미터화된 쿼리 100%
- ✅ **XSS 방지** - HTML 살균화 (DOMPurify)
- ✅ **CSRF 보호** - Double-submit cookie 패턴
- ✅ **Rate Limiting** - 엔드포인트별 제한
- ✅ **Helmet** - 보안 HTTP 헤더
- ✅ **bcrypt** - 안전한 비밀번호 해싱
- ✅ **JWT** - 토큰 기반 인증
- ✅ **2FA** - TOTP 이중 인증
- ✅ **입력 검증** - express-validator
- ✅ **HTTPS 강제** - 프로덕션 환경

## 📈 성능 최적화

- ✅ **Response 캐싱** - Node-Cache
- ✅ **Gzip 압축** - 1KB 이상 응답
- ✅ **데이터베이스 인덱싱** - 모든 쿼리 컬럼
- ✅ **커넥션 풀링** - PostgreSQL
- ✅ **코드 스플리팅** - React lazy loading
- ✅ **이미지 최적화** - WebP 지원
- ✅ **CDN** - AWS CloudFront (선택)
- ✅ **Service Worker** - PWA 캐싱

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 개발자

**Josens83**
- GitHub: [@josens83](https://github.com/josens83)

## 🙏 감사의 말

- [Storytel](https://www.storytel.com) - UI/UX 영감
- [Stripe](https://stripe.com) - 결제 시스템
- [OpenAI](https://openai.com) - AI 기능
- [Sentry](https://sentry.io) - 에러 추적

## 📞 지원

문제가 발생하거나 질문이 있으면:
- [GitHub Issues](https://github.com/josens83/education-platform-2025/issues)
- Email: support@education-platform.com

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**
