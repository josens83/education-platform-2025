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
│   └── admin/                    # 관리자 대시보드
│       └── (웹 앱 내부에 통합 구현됨 - /admin 라우트)
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

- **Docker Desktop** (권장) - Windows/Mac/Linux
- 또는 Node.js 20+ + PostgreSQL 16+ (로컬 개발)
- npm 또는 yarn

### 방법 1: Docker를 사용한 빠른 시작 (권장) ⭐

가장 빠르고 간단한 방법입니다. Docker Desktop이 설치되어 있어야 합니다.

```bash
# 1. 저장소 클론
git clone <repository-url>
cd education-platform-2025

# 2. Docker Compose로 전체 스택 빌드 및 실행
docker-compose up -d --build

# 3. 서비스 확인
# Backend API: http://localhost:3001
# Web App: http://localhost:80
# PostgreSQL: localhost:5432

# 4. 로그 확인 (선택사항)
docker-compose logs -f web      # 웹 앱 로그
docker-compose logs -f backend  # 백엔드 로그
docker-compose logs -f postgres # 데이터베이스 로그
```

#### 샘플 데이터 자동 로딩

Docker Compose를 사용하면 **샘플 데이터가 자동으로 로드**됩니다:

- **3권의 샘플 책**: Charlie and the Chocolate Factory, The Little Prince, 1984
- 각 책마다 여러 챕터와 실제 콘텐츠 포함
- 카테고리, 난이도 등급 등 완전한 데이터

#### Phase 1 기능 테스트하기

1. **책 목록 페이지**: http://localhost/books
   - 3권의 샘플 책이 카드 형태로 표시됩니다
   - 책 표지, 제목, 저자, 난이도, 예상 독서 시간 확인

2. **책 상세 페이지**: http://localhost/books/2
   - 책의 상세 정보와 챕터 목록 표시
   - "읽기 시작" 버튼 클릭

3. **챕터 읽기 페이지**: http://localhost/reader/4
   - 챕터 내용이 HTML 형식으로 표시됩니다
   - 상단에 책 제목과 챕터 정보 표시
   - "뒤로" 버튼으로 책 상세 페이지로 이동

#### Docker 명령어 참고

```bash
# 컨테이너 중지
docker-compose down

# 컨테이너 재시작 (코드 변경 후)
docker-compose restart web backend

# 완전히 재빌드 (캐시 무시)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
docker-compose down -v
docker-compose up -d --build
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

### 관리자 (Admin) - 관리자 전용

**통계 & 분석**
- `GET /api/admin/stats` - 플랫폼 전체 통계
- `GET /api/admin/stats/users-by-role` - 역할별 사용자 통계
- `GET /api/admin/stats/quiz-performance` - 퀴즈 성과 분석
- `GET /api/admin/stats/monthly-signups` - 월별 가입자 추이

**콘텐츠 관리**
- `POST /api/books` - 책 생성
- `PUT /api/books/:id` - 책 수정
- `DELETE /api/books/:id` - 책 삭제
- `POST /api/books/:id/chapters` - 챕터 생성
- `PUT /api/chapters/:id` - 챕터 수정
- `DELETE /api/chapters/:id` - 챕터 삭제
- `POST /api/chapters/:id/quizzes` - 퀴즈 생성
- `PUT /api/quizzes/:id` - 퀴즈 수정
- `DELETE /api/quizzes/:id` - 퀴즈 삭제
- `POST /api/quizzes/:id/questions` - 퀴즈 문제 생성
- `PUT /api/quizzes/questions/:id` - 문제 수정
- `DELETE /api/quizzes/questions/:id` - 문제 삭제
- `POST /api/audio/upload` - 오디오 파일 업로드

**사용자 관리**
- `GET /api/users` - 전체 사용자 목록 (검색, 필터, 페이지네이션)
- `GET /api/users/:id` - 사용자 상세 정보
- `PUT /api/users/:id/role` - 사용자 역할 변경

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

### ✅ Phase 1 완료 - Books & Reader Pages

**Backend API**
- [x] 데이터베이스 스키마 설계
- [x] Backend API 구조
- [x] 책/챕터 관리 API
  - [x] `GET /api/books` - 책 목록 조회
  - [x] `GET /api/books/:id` - 책 상세 조회
  - [x] `GET /api/books/:id/chapters` - 챕터 목록 조회
  - [x] `GET /api/chapters/:id` - 챕터 내용 조회 (공개)
- [x] 샘플 데이터 자동 로딩 (Docker)

**공유 패키지**
- [x] API 클라이언트 라이브러리
  - [x] TypeScript 타입 정의 (Book, Chapter 등)
  - [x] API 메서드 (getBooks, getBook, getBookChapters, getChapter)
- [x] 공통 유틸리티 및 타입 정의

**웹 앱 - Phase 1 Features**
- [x] React + Vite + TypeScript 프로젝트 구조
- [x] 라우팅 시스템 (React Router)
- [x] **책 목록 페이지** (`/books`)
  - [x] API 통합 (React Query)
  - [x] 카드 기반 레이아웃
  - [x] 난이도 배지, 독서 시간 표시
  - [x] 로딩 및 에러 상태 처리
- [x] **책 상세 페이지** (`/books/:id`)
  - [x] 책 정보 표시 (제목, 저자, 설명)
  - [x] 챕터 목록 표시
  - [x] "읽기 시작" 버튼
- [x] **챕터 읽기 페이지** (`/reader/:chapterId`)
  - [x] HTML 콘텐츠 렌더링
  - [x] Prose 스타일링 (Tailwind)
  - [x] 네비게이션 (뒤로 가기)
  - [x] 예상 독서 시간 표시

**배포**
- [x] Docker 컨테이너 설정
- [x] Docker Compose (프로덕션)
- [x] Nginx 웹 서버 설정
- [x] 멀티스테이지 빌드 최적화

### ✅ Phase 2-6 완료 - Core Features

**Backend**
- [x] 인증 시스템 (JWT 기반 회원가입/로그인)
- [x] 사용자 프로필 관리
- [x] 학습 진도 추적
- [x] 퀴즈 시스템 (자동 채점, 오답 노트)
- [x] 구독 관리 (플랜, 결제, 취소)
- [x] 북마크 & 노트 시스템
- [x] 단어장 시스템
- [x] 오디오 파일 관리
- [x] 학습 스트릭 & 통계
- [x] 성취 시스템

**웹 앱**
- [x] 로그인/회원가입 페이지
- [x] 사용자 대시보드 (학습 통계)
- [x] 프로필 관리 페이지
- [x] 퀴즈 응시 & 결과 페이지
- [x] 구독 관리 페이지
- [x] 단어장 & 플래시카드
- [x] 성능 최적화 (캐싱, 코드 스플리팅, 이미지 최적화)

### ✅ Phase 7.6 완료 - Admin Tools

**관리자 전용 도구 (웹 UI)**
- [x] 관리자 레이아웃 & 네비게이션
- [x] **대시보드**
  - [x] 실시간 플랫폼 통계 (사용자, 책, 챕터, 퀴즈, 구독)
  - [x] 최근 가입 사용자
  - [x] 인기 책 Top 5
  - [x] 최근 7일 활동 통계
  - [x] 빠른 작업 바로가기
- [x] **책 관리** (`/admin/books`)
  - [x] 책 목록 조회
  - [x] 책 추가/수정/삭제 (모달 폼)
  - [x] 자동 슬러그 생성
- [x] **챕터 관리** (`/admin/chapters`)
  - [x] 책 선택 드롭다운
  - [x] 챕터 목록 조회
  - [x] 챕터 추가/수정/삭제
  - [x] 콘텐츠 에디터 (HTML/Markdown 지원)
- [x] **오디오 관리** (`/admin/audio`)
  - [x] 드래그앤드롭 파일 업로드
  - [x] 파일 유효성 검사 (형식, 크기)
  - [x] 오디오 타입 선택 (Professional TTS / AI TTS)
  - [x] 오디오 목록 & 삭제
- [x] **퀴즈 관리** (`/admin/quizzes`)
  - [x] 책/챕터별 퀴즈 목록
  - [x] 퀴즈 추가/수정/삭제
  - [x] 문제 관리 (사이드 패널)
  - [x] 문제 CRUD (객관식, 참/거짓, 주관식, 빈칸 채우기)
  - [x] 동적 선택지 관리
- [x] **사용자 관리** (`/admin/users`)
  - [x] 전체 사용자 목록 (페이지네이션)
  - [x] 실시간 검색 (이름, 이메일, 사용자명)
  - [x] 역할 필터 (student, teacher, admin)
  - [x] 인라인 역할 변경
  - [x] 사용자 상세 정보 모달 (학습 통계, 최근 활동)
- [x] **분석 페이지** (`/admin/analytics`)
  - [x] 역할별 사용자 분포 (막대 그래프)
  - [x] 퀴즈 성과 분석 (합격률, 평균 점수)
  - [x] 월별 가입자 추이 (최근 6개월)

**관리자 API**
- [x] `GET /api/admin/stats` - 통합 통계
- [x] `GET /api/admin/stats/users-by-role` - 역할별 통계
- [x] `GET /api/admin/stats/quiz-performance` - 퀴즈 성과
- [x] `GET /api/admin/stats/monthly-signups` - 월별 가입자
- [x] 모든 콘텐츠 CRUD 엔드포인트
- [x] 사용자 관리 엔드포인트

**보안 & 권한**
- [x] 관리자 전용 미들웨어 (`authorizeRoles`)
- [x] 역할 기반 접근 제어 (admin, teacher)
- [x] API Rate Limiting (관리자 API는 낮은 제한)

### ✅ Phase 8 완료 - Production Ready (실제 서비스 준비)

**결제 시스템 통합 (Stripe)**
- [x] Stripe Checkout Session 생성 API
- [x] Stripe Webhook 처리 (결제 성공/실패/갱신)
- [x] 자동 구독 갱신 시스템
- [x] 결제 내역 조회 API
- [x] payments 라우트 추가 (`/api/payments/*`)

**이메일 시스템 (Nodemailer)**
- [x] 이메일 발송 라이브러리 구축 (`backend/lib/email.js`)
- [x] 환영 이메일 (회원가입 시 자동 발송)
- [x] 비밀번호 재설정 이메일
- [x] 구독 관련 이메일 (시작, 만료 알림, 결제 실패)
- [x] HTML 템플릿 기반 이메일 디자인

**비밀번호 재설정 기능**
- [x] 비밀번호 재설정 요청 API (`POST /api/auth/forgot-password`)
- [x] 비밀번호 재설정 API (`POST /api/auth/reset-password`)
- [x] 토큰 기반 보안 재설정 (SHA-256 해싱)
- [x] 토큰 만료 시간 관리 (1시간)
- [x] 데이터베이스 마이그레이션 (password_reset_token, password_reset_expires 컬럼)

**법적 문서 페이지**
- [x] 이용약관 페이지 (`/terms`)
- [x] 개인정보처리방침 페이지 (`/privacy`)
- [x] 법적 문서 내용 작성 (한국 법령 준수)

**고객 지원 시스템**
- [x] FAQ 페이지 (`/faq`)
  - [x] 카테고리별 필터링
  - [x] 아코디언 UI
  - [x] 13개 자주 묻는 질문 작성
- [x] 문의하기 페이지 (`/contact`)
  - [x] 문의 양식 (이름, 이메일, 유형, 내용)
  - [x] 연락처 정보 표시
  - [x] 운영 시간 안내

**UX 개선**
- [x] Footer 업데이트 (4열 레이아웃)
  - [x] 서비스 링크
  - [x] 고객 지원 링크
  - [x] 법적 문서 링크
  - [x] 회사 정보
- [x] 모든 페이지 라우팅 연결

**환경 변수 설정**
- [x] `.env.example` 업데이트
  - [x] Stripe 키 (SECRET_KEY, PUBLISHABLE_KEY, WEBHOOK_SECRET)
  - [x] 이메일 설정 (HOST, PORT, USER, PASSWORD)
  - [x] 프론트엔드 URL 설정

### 📝 향후 계획

**Phase 9: Mobile App**
- [ ] React Native + Expo 기반 모바일 앱 완성
- [ ] 크로스 플랫폼 API 클라이언트 활용
- [ ] 오프라인 읽기 모드
- [ ] 푸시 알림 시스템
- [ ] App Store / Play Store 배포

**Phase 10: Advanced Features**
- [ ] 소셜 로그인 (Google OAuth, Kakao)
- [ ] 오프라인 모드 (PWA)
- [ ] AI 튜터 통합
- [ ] 소셜 학습 (스터디 그룹)
- [ ] 성과 인증서 발급
- [ ] 실시간 채팅 지원
- [ ] 한국 PG사 통합 (토스페이먼츠, 카카오페이)
- [ ] 에러 페이지 개선 (404, 500 등)
- [ ] CSRF 토큰 구현
- [ ] XSS 방어 강화

**DevOps & Monitoring**
- [ ] CI/CD 파이프라인 구축
- [ ] 성능 모니터링 (Sentry, Datadog 등)
- [ ] 자동화된 테스트 커버리지 확대
- [ ] 로그 수집 및 분석 시스템
- [ ] 백업 및 재해 복구 계획

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

# 챕터 내용 조회
curl http://localhost:3001/api/chapters/4
```

### 데이터베이스 직접 접근

```bash
# PostgreSQL 컨테이너에 접속
docker exec -it education-postgres psql -U postgres -d education_platform

# 샘플 데이터 확인
SELECT id, title, author FROM books;
SELECT id, chapter_number, title FROM chapters WHERE book_id = 2;

# 종료
\q
```

## 🔧 트러블슈팅

### Docker 관련 이슈

#### 문제: 웹 페이지에 변경사항이 반영되지 않음

**증상**: 코드를 수정했지만 브라우저에서 변경사항이 보이지 않음

**해결방법**:
```bash
# 1. Docker 이미지 완전히 재빌드
docker-compose down
docker rmi education-platform-2025-web
docker-compose build --no-cache web
docker-compose up -d

# 2. 브라우저 캐시 강력 새로고침
# Chrome/Edge: Ctrl + Shift + R (Windows) / Cmd + Shift + R (Mac)
# Firefox: Ctrl + F5 (Windows) / Cmd + Shift + R (Mac)
```

#### 문제: 데이터베이스에 샘플 데이터가 없음

**증상**: `/books` 페이지에 책이 표시되지 않음

**해결방법**:
```bash
# 데이터베이스 볼륨 삭제 후 재생성
docker-compose down -v  # -v 옵션으로 볼륨도 삭제
docker-compose up -d --build

# 데이터 확인
docker exec -it education-postgres psql -U postgres -d education_platform -c "SELECT COUNT(*) FROM books;"
```

#### 문제: 포트 충돌

**증상**: `Error starting userland proxy: listen tcp4 0.0.0.0:80: bind: address already in use`

**해결방법**:
```bash
# 포트 사용 중인 프로세스 확인 (Windows)
netstat -ano | findstr :80

# 포트 사용 중인 프로세스 확인 (Mac/Linux)
lsof -i :80

# docker-compose.yml에서 포트 변경
# web 서비스의 ports를 "8080:80"으로 변경 후
docker-compose up -d
# 접속: http://localhost:8080
```

### API 관련 이슈

#### 문제: CORS 에러

**증상**: 브라우저 콘솔에 `CORS policy` 에러

**해결방법**:
- `backend/.env` 파일에서 `CORS_ORIGIN` 확인
- 웹 앱이 실행되는 포트와 일치하는지 확인
- Docker 사용 시: `CORS_ORIGIN=http://localhost` 또는 `http://localhost:80`
- 로컬 개발 시: `CORS_ORIGIN=http://localhost:3000`

#### 문제: 404 Not Found on API calls

**증상**: `/api/books` 요청이 404 반환

**해결방법**:
```bash
# 백엔드 컨테이너 로그 확인
docker-compose logs backend

# 백엔드 컨테이너가 실행 중인지 확인
docker-compose ps

# 백엔드 재시작
docker-compose restart backend
```

### TypeScript 빌드 에러

#### 문제: Type errors during build

**증상**: `error TS2339: Property does not exist on type`

**해결방법**:
```bash
# 1. packages/api-client 재빌드
cd packages/api-client
npm run build

# 2. 웹 앱 node_modules 재설치
cd apps/web
rm -rf node_modules
npm install

# 3. Docker 재빌드
docker-compose build --no-cache web
```

### 성능 이슈

#### 문제: Docker 빌드가 너무 느림

**해결방법**:
```bash
# Docker Desktop 설정에서 리소스 할당 증가
# Settings > Resources > Advanced
# - CPU: 4 cores 이상
# - Memory: 4GB 이상

# Docker 빌드 캐시 활용 (--no-cache 없이)
docker-compose build
docker-compose up -d
```

## 🤝 기여

이 프로젝트는 현재 개발 초기 단계입니다. 기여를 환영합니다!

## 📄 라이선스

MIT License

## 📧 문의

프로젝트 관련 문의사항은 Issue를 통해 등록해주세요.

---

**Made with ❤️ for English Learners**
