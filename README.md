# 영어 교육 콘텐츠 플랫폼 🎓

구독형 영어 교육 콘텐츠 플랫폼 - Storytel 스타일의 직관적인 UX와 체계적인 학습 관리 시스템

## 📖 프로젝트 개요

이 플랫폼은 스토리텔(Storytel)과 같은 직관적인 UI/UX를 채택하면서, 영어 교육에 특화된 다양한 학습 기능을 제공하는 구독형 교육 플랫폼입니다.

### 핵심 특징

- 📚 **전자책 리더 + 오디오북**: 텍스트와 오디오 동시 제공, 싱크된 읽기 기능
- 📊 **학습 진도 추적**: 실시간 진도 관리 및 대시보드
- ✅ **퀴즈 시스템**: 자동 채점, 오답 노트, 반복 학습
- 📖 **북마크 & 노트**: 학습 내용 표시 및 메모 기능
- 📚 **단어장**: 개인 단어장 관리 및 복습 시스템
- 💳 **구독 모델**: 월정액, 연간, 가족 플랜 등 다양한 옵션
- 🎯 **카테고리별 분류**: 초등/중등/고등/TOEIC/TOEFL/TEPS 등

## 🏗️ 프로젝트 구조 (멀티 플랫폼)

이 프로젝트는 웹, iOS, Android를 모두 지원하는 멀티 플랫폼 구조로 설계되었습니다.

```
education-platform-2025/
├── backend/                      # Node.js + Express + PostgreSQL
│   ├── routes/                   # API 라우트
│   │   ├── auth.js               # 인증 (회원가입/로그인)
│   │   ├── users.js              # 사용자 관리
│   │   ├── books.js              # 책/코스 관리
│   │   ├── chapters.js           # 챕터 관리
│   │   ├── progress.js           # 학습 진도
│   │   ├── quizzes.js            # 퀴즈 시스템
│   │   └── subscriptions.js      # 구독 관리
│   ├── middleware/               # 미들웨어 (인증, 권한)
│   ├── database.js               # DB 연결 및 헬퍼
│   ├── server.js                 # 메인 서버
│   └── Dockerfile                # Backend Docker 이미지
│
├── packages/                     # 공유 패키지 (Monorepo)
│   ├── api-client/               # API 클라이언트 라이브러리
│   │   ├── src/
│   │   │   ├── index.ts          # API 클라이언트 클래스
│   │   │   └── types.ts          # TypeScript 타입 정의
│   │   └── package.json
│   │
│   └── shared/                   # 공유 유틸리티
│       ├── src/
│       │   └── index.ts          # 공통 함수, 상수, 헬퍼
│       └── package.json
│
├── apps/                         # 클라이언트 앱
│   ├── web/                      # React 웹 앱
│   │   ├── src/
│   │   │   ├── components/       # React 컴포넌트
│   │   │   ├── pages/            # 페이지 컴포넌트
│   │   │   ├── store/            # Zustand 상태 관리
│   │   │   ├── lib/              # API 클라이언트 설정
│   │   │   ├── App.tsx           # 루트 컴포넌트
│   │   │   └── main.tsx          # 진입점
│   │   ├── Dockerfile            # Web Docker 이미지
│   │   ├── vite.config.ts        # Vite 설정
│   │   └── package.json
│   │
│   ├── mobile/                   # React Native 모바일 앱
│   │   ├── src/
│   │   │   ├── navigation/       # 네비게이션 구조
│   │   │   ├── screens/          # 화면 컴포넌트
│   │   │   ├── components/       # 공통 컴포넌트
│   │   │   └── store/            # 상태 관리
│   │   ├── App.tsx               # 루트 컴포넌트
│   │   ├── app.json              # Expo 설정
│   │   └── package.json
│   │
│   └── admin/                    # 관리자 대시보드 (예정)
│       └── (콘텐츠 관리 시스템)
│
├── database/                     # 데이터베이스
│   ├── schema.sql                # 전체 스키마
│   └── migrations/               # 마이그레이션 파일
│
├── deployment/                   # 배포 설정
│   ├── nginx.conf                # Nginx 설정
│   └── README.md                 # 배포 가이드
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # CI/CD 파이프라인
│
├── docker-compose.yml            # 프로덕션 Docker Compose
├── docker-compose.dev.yml        # 개발 환경 Docker Compose
└── README.md                     # 이 파일
```

### 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│                  클라이언트 레이어                │
├──────────────┬──────────────┬───────────────────┤
│   웹 앱      │  모바일 앱    │   관리자 패널      │
│  (React)     │(React Native)│    (React)        │
└──────────────┴──────────────┴───────────────────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
              ┌─────────▼──────────┐
              │  공유 패키지        │
              │  - API Client      │
              │  - 공통 유틸리티    │
              └─────────┬──────────┘
                        │
              ┌─────────▼──────────┐
              │   Backend API      │
              │  (Node.js/Express) │
              └─────────┬──────────┘
                        │
              ┌─────────▼──────────┐
              │   PostgreSQL       │
              │   (데이터베이스)    │
              └────────────────────┘
```

### 플랫폼별 특징

#### 🌐 웹 앱 (apps/web)
- **기술**: React + TypeScript + Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand
- **라우팅**: React Router
- **배포**: Docker + Nginx

#### 📱 모바일 앱 (apps/mobile)
- **기술**: React Native + Expo
- **플랫폼**: iOS + Android
- **내비게이션**: React Navigation
- **상태 관리**: Zustand
- **배포**: EAS Build (App Store / Play Store)

#### 🔧 공유 패키지 (packages/)
- **API Client**: 모든 플랫폼에서 공유하는 API 통신 로직
- **Shared Utils**: 공통 유틸리티, 상수, 타입 정의

## 🗄️ 데이터베이스 스키마

### 주요 테이블

1. **사용자 관련**
   - `users`: 사용자 계정
   - `user_profiles`: 사용자 프로필 (학년, 목표 시험 등)

2. **구독 관련**
   - `subscription_plans`: 구독 플랜
   - `subscriptions`: 사용자 구독 정보
   - `payments`: 결제 내역

3. **콘텐츠 구조**
   - `categories`: 카테고리 (초등/중등/고등/TOEIC 등)
   - `books`: 책/코스
   - `chapters`: 챕터
   - `audio_files`: 오디오 파일

4. **학습 관리**
   - `learning_progress`: 학습 진도
   - `bookmarks`: 북마크
   - `notes`: 노트
   - `vocabulary`: 단어장

5. **퀴즈 시스템**
   - `quizzes`: 퀴즈
   - `quiz_questions`: 퀴즈 질문
   - `quiz_attempts`: 퀴즈 시도 기록
   - `quiz_answers`: 답안 (오답 노트용)

6. **분석**
   - `learning_stats`: 학습 통계 (일일/주간/월간)

## 🚀 시작하기

### 필수 요구사항

- Node.js 20+
- PostgreSQL 16+ (또는 Docker)
- npm 또는 yarn

### 방법 1: Docker를 사용한 빠른 시작 (권장)

가장 빠르고 간단한 방법입니다. Docker가 설치되어 있어야 합니다.

```bash
# 1. 저장소 클론
git clone <repository-url>
cd education-platform-2025

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 환경 변수 설정

# 3. Docker Compose로 전체 스택 실행
docker-compose up -d

# 4. 서비스 확인
# Backend API: http://localhost:3001
# Web App: http://localhost:80
```

상세한 Docker 배포 가이드는 [deployment/README.md](deployment/README.md)를 참조하세요.

### 방법 2: 로컬 개발 환경 설정

#### 1. 저장소 클론

```bash
git clone <repository-url>
cd education-platform-2025
```

#### 2. 데이터베이스 설정

```bash
# Docker로 PostgreSQL 실행 (권장)
docker-compose -f docker-compose.dev.yml up -d postgres

# 또는 로컬 PostgreSQL 사용
psql -U postgres
CREATE DATABASE education_platform;
\q

# 스키마 적용
psql -U postgres -d education_platform -f database/schema.sql
```

#### 3. Backend 설정 및 실행

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 입력

# 개발 서버 실행
npm run dev
```

서버가 http://localhost:3001 에서 실행됩니다.

#### 4. Web App 설정 및 실행

```bash
cd apps/web

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

웹 앱이 http://localhost:3000 에서 실행됩니다.

#### 5. Mobile App 실행 (선택사항)

```bash
cd apps/mobile

# 의존성 설치
npm install

# Expo 개발 서버 실행
npx expo start

# iOS 시뮬레이터: i 키 입력
# Android 에뮬레이터: a 키 입력
# 실제 기기: Expo Go 앱으로 QR 코드 스캔
```

### .env 파일 설정

```env
# 데이터베이스
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=education_platform
DB_PORT=5432

# 백엔드
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000

# 웹 앱
WEB_PORT=80
VITE_API_URL=http://localhost:3001
```

## 📡 API 엔드포인트

### 인증 (Auth)

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신

### 사용자 (Users)

- `GET /api/users/me` - 내 프로필 조회
- `PUT /api/users/me` - 프로필 업데이트
- `GET /api/users/me/stats` - 학습 통계

### 책/코스 (Books)

- `GET /api/books` - 책 목록 조회 (검색, 필터)
- `GET /api/books/:id` - 책 상세 조회 + 챕터 목록
- `POST /api/books` - 책 생성 (관리자)

### 챕터 (Chapters)

- `GET /api/chapters/:id` - 챕터 조회 (구독자만)

### 학습 진도 (Progress)

- `POST /api/progress` - 진도 저장/업데이트
- `GET /api/progress/my` - 내 진도 조회

### 퀴즈 (Quizzes)

- `GET /api/quizzes/:id` - 퀴즈 조회
- `POST /api/quizzes/:id/submit` - 퀴즈 제출 및 자동 채점
- `GET /api/quizzes/my/attempts` - 내 퀴즈 기록

### 구독 (Subscriptions)

- `GET /api/subscriptions/plans` - 구독 플랜 목록
- `GET /api/subscriptions/my` - 내 구독 정보
- `POST /api/subscriptions` - 구독 시작
- `DELETE /api/subscriptions/my` - 구독 취소

## 🔐 인증 시스템

- **JWT (JSON Web Token)** 기반 인증
- **bcrypt**를 사용한 비밀번호 해싱
- 토큰 유효기간: 7일 (환경변수로 설정 가능)

### 인증이 필요한 엔드포인트

대부분의 엔드포인트는 인증이 필요합니다. 요청 헤더에 JWT 토큰을 포함해야 합니다:

```
Authorization: Bearer <your-jwt-token>
```

### 구독이 필요한 엔드포인트

챕터 내용 조회 등 일부 엔드포인트는 활성화된 구독이 필요합니다.

## 📊 구독 모델

### 플랜 종류

1. **Free Trial** - 7일 무료 체험
   - 가격: 0원
   - 모든 콘텐츠 접근
   - 오프라인 모드 제외

2. **Monthly** - 월 구독
   - 가격: 11,900원/월
   - 모든 기능 이용 가능
   - 오프라인 모드 포함

3. **Annual** - 연간 구독 (2개월 할인)
   - 가격: 119,000원/년
   - 월 환산: 9,917원/월
   - AI 튜터 기능 포함

4. **Family** - 가족 플랜 (최대 3인)
   - 가격: 19,900원/월
   - 3개 계정 공유
   - 모든 기능 이용 가능

## 🎯 주요 기능 구현 상태

### ✅ 완료

**Backend & 인프라**
- [x] 데이터베이스 스키마 설계
- [x] Backend API 구조
- [x] 인증 시스템 (회원가입/로그인)
- [x] 사용자 프로필 관리
- [x] 책/챕터 관리
- [x] 학습 진도 추적
- [x] 퀴즈 시스템 (자동 채점)
- [x] 구독 관리

**공유 패키지**
- [x] API 클라이언트 라이브러리
- [x] 공통 유틸리티 및 타입 정의

**웹 앱**
- [x] React + Vite 프로젝트 구조
- [x] 라우팅 및 인증 플로우
- [x] 기본 UI 컴포넌트 및 페이지

**모바일 앱**
- [x] React Native + Expo 프로젝트 구조
- [x] 네비게이션 시스템
- [x] 기본 화면 구조

**배포**
- [x] Docker 컨테이너 설정
- [x] Docker Compose (개발/프로덕션)
- [x] CI/CD 파이프라인 (GitHub Actions)
- [x] Nginx 웹 서버 설정

### 🚧 진행 중

- [ ] 전자책 리더 UI 완성
- [ ] 오디오 플레이어 (텍스트-오디오 싱크)
- [ ] 대시보드 및 통계 UI 구현
- [ ] 모바일 앱 UI 완성
- [ ] 결제 시스템 통합
- [ ] 콘텐츠 관리 시스템 (CMS)

### 📝 향후 계획

- [ ] 오프라인 모드 (PWA)
- [ ] AI 튜터 통합
- [ ] 소셜 학습 (스터디 그룹)
- [ ] 성과 인증서 발급
- [ ] 실시간 채팅 지원
- [ ] 알림 시스템 (Push Notifications)

## 🛠️ 기술 스택

### Backend
- **Node.js 20** - JavaScript 런타임
- **Express** - 웹 프레임워크
- **PostgreSQL 16** - 관계형 데이터베이스
- **JWT** - 인증
- **bcrypt** - 비밀번호 해싱
- **Express Rate Limit** - API 보호

### 공유 패키지
- **TypeScript** - 타입 안정성
- **Axios** - HTTP 클라이언트

### Web Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Router 6** - 라우팅
- **Zustand** - 상태 관리
- **Tailwind CSS** - 스타일링
- **React Query** - 서버 상태 관리
- **Framer Motion** - 애니메이션

### Mobile App
- **React Native** - 크로스 플랫폼 프레임워크
- **Expo 50** - 개발 플랫폼
- **React Navigation 6** - 네비게이션
- **Zustand** - 상태 관리
- **EAS Build** - 앱 빌드 및 배포

### DevOps & 배포
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 관리
- **Nginx** - 웹 서버 및 리버스 프록시
- **GitHub Actions** - CI/CD
- **PostgreSQL Docker** - 개발용 데이터베이스

## 📝 개발 가이드

### API 테스트

```bash
# Health Check
curl http://localhost:3001/api/health

# 회원가입
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"테스터"}'

# 로그인
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 책 목록 조회
curl http://localhost:3001/api/books
```

## 🤝 기여

이 프로젝트는 현재 개발 초기 단계입니다. 기여를 환영합니다!

## 📄 라이선스

MIT License

## 📧 문의

프로젝트 관련 문의사항은 Issue를 통해 등록해주세요.

---

**Made with ❤️ for English Learners**
