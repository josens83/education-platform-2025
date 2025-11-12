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

## 🏗️ 프로젝트 구조

```
education-platform-2025/
├── backend/              # Node.js + Express + PostgreSQL
│   ├── routes/           # API 라우트
│   │   ├── auth.js       # 인증 (회원가입/로그인)
│   │   ├── users.js      # 사용자 관리
│   │   ├── books.js      # 책/코스 관리
│   │   ├── chapters.js   # 챕터 관리
│   │   ├── progress.js   # 학습 진도
│   │   ├── quizzes.js    # 퀴즈 시스템
│   │   └── subscriptions.js  # 구독 관리
│   ├── middleware/       # 미들웨어 (인증, 권한)
│   ├── database.js       # DB 연결 및 헬퍼
│   └── server.js         # 메인 서버
│
├── frontend/             # React + TypeScript (예정)
│   └── (구현 예정)
│
├── database/             # 데이터베이스
│   ├── schema.sql        # 전체 스키마
│   └── migrations/       # 마이그레이션 파일
│
└── docs/                 # 문서
    └── (기획서 등)
```

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

- Node.js 16+
- PostgreSQL 12+
- npm 또는 yarn

### 1. 저장소 클론

```bash
git clone <repository-url>
cd education-platform-2025
```

### 2. Backend 설정

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 입력
```

#### .env 파일 예시

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/education_platform
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL 데이터베이스 생성
psql -U postgres
CREATE DATABASE education_platform;
\q

# 스키마 적용
psql -U postgres -d education_platform -f ../database/schema.sql
```

### 4. 서버 실행

```bash
npm start

# 또는 개발 모드 (nodemon)
npm run dev
```

서버가 http://localhost:3001 에서 실행됩니다.

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

- [x] 데이터베이스 스키마 설계
- [x] Backend API 구조
- [x] 인증 시스템 (회원가입/로그인)
- [x] 사용자 프로필 관리
- [x] 책/챕터 관리
- [x] 학습 진도 추적
- [x] 퀴즈 시스템 (자동 채점)
- [x] 구독 관리

### 🚧 진행 중

- [ ] Frontend React 앱
- [ ] 전자책 리더 UI
- [ ] 오디오 플레이어 (텍스트-오디오 싱크)
- [ ] 대시보드 및 통계 UI
- [ ] 결제 시스템 통합
- [ ] 콘텐츠 관리 시스템 (CMS)

### 📝 향후 계획

- [ ] 오프라인 모드 (PWA)
- [ ] AI 튜터 통합
- [ ] 소셜 학습 (스터디 그룹)
- [ ] 모바일 앱 (React Native)
- [ ] 성과 인증서 발급

## 🛠️ 기술 스택

### Backend
- **Node.js** - JavaScript 런타임
- **Express** - 웹 프레임워크
- **PostgreSQL** - 관계형 데이터베이스
- **JWT** - 인증
- **bcrypt** - 비밀번호 해싱

### Frontend (예정)
- **React** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **Zustand/Redux** - 상태 관리

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
