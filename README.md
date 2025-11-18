# 영어 학습 플랫폼 (English Education Platform)

구독형 영어 원서 읽기 플랫폼. Storytel 스타일의 이북 리더와 오디오북, 퀴즈로 영어 실력을 향상시킬 수 있는 웹 애플리케이션입니다.

## 🌟 주요 기능

### 사용자 기능
- ✅ **회원가입 & 로그인** (JWT 인증)
- ✅ **구독 시스템** (무료 체험, 월간, 연간 플랜)
- ✅ **실제 결제** (Stripe 통합)
- ✅ **영어책 읽기** (이북 리더)
- ✅ **오디오북** (음성 재생)
- ✅ **퀴즈** (이해도 테스트)
- ✅ **단어장** (북마크 기능)
- ✅ **플래시카드** (복습 시스템)
- ✅ **학습 진도 추적**
- ✅ **학습 통계 & 분석**

### 관리자 기능
- ✅ **사용자 관리**
- ✅ **콘텐츠 관리** (책, 챕터, 오디오, 퀴즈)
- ✅ **분석 대시보드**
- ✅ **구독 현황 모니터링**

### 보안 & 프로덕션 준비
- ✅ **SQL Injection 방지** (Parameterized queries)
- ✅ **XSS 방지** (HTML 살균화)
- ✅ **Rate Limiting** (DDoS 방지)
- ✅ **Error Boundary** (React 에러 복구)
- ✅ **API 자동 재시도** (네트워크 안정성)
- ✅ **오프라인 감지**
- ✅ **에러 로깅 시스템**
- ✅ **SEO 최적화**

## 🏗️ 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **React Router** (라우팅)
- **React Query** (서버 상태 관리)
- **Zustand** (클라이언트 상태 관리)
- **Tailwind CSS** (스타일링)
- **React Helmet Async** (SEO)
- **Framer Motion** (애니메이션)

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (데이터베이스)
- **JWT** (인증)
- **Stripe** (결제)
- **Nodemailer** (이메일)
- **Helmet** (보안 헤더)
- **Express Rate Limit** (Rate limiting)
- **bcrypt** (비밀번호 해싱)

### DevOps
- **Docker** + **Docker Compose** (컨테이너화)
- **PM2** (프로세스 관리)
- **Nginx** (웹 서버)

## 📁 프로젝트 구조

```
education-platform-2025/
├── apps/
│   └── web/                  # Frontend (React + Vite)
│       ├── src/
│       │   ├── components/   # 재사용 컴포넌트
│       │   ├── pages/        # 페이지 컴포넌트
│       │   ├── lib/          # 유틸리티
│       │   └── store/        # 상태 관리
│       └── public/           # 정적 파일
├── backend/                  # Backend (Node.js + Express)
│   ├── routes/              # API 라우트
│   ├── middleware/          # 미들웨어
│   ├── lib/                 # 유틸리티
│   └── uploads/             # 업로드 파일
├── packages/
│   ├── api-client/          # API 클라이언트 라이브러리
│   └── shared/              # 공유 타입/유틸
├── database/
│   └── migrations/          # DB 마이그레이션
├── scripts/                 # 유틸리티 스크립트
├── DEPLOYMENT.md            # 배포 가이드
└── README.md               # 이 파일
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 16 이상
- PostgreSQL 12 이상
- npm 또는 yarn

### 1. 저장소 클론
```bash
git clone <repository-url>
cd education-platform-2025
```

### 2. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성
createdb education_platform

# 마이그레이션 실행
cd database/migrations
psql -U postgres -d education_platform -f 001_init_schema.sql
psql -U postgres -d education_platform -f 002_performance_indexes.sql
psql -U postgres -d education_platform -f 003_add_password_reset_fields.sql
psql -U postgres -d education_platform -f 004_add_email_verification.sql
```

### 3. 환경 변수 설정
```bash
# Backend 환경 변수
cp backend/.env.example backend/.env
# backend/.env 파일을 편집하여 실제 값 입력

# Frontend 환경 변수
cp apps/web/.env.example apps/web/.env
# apps/web/.env 파일을 편집하여 실제 값 입력
```

### 4. 의존성 설치
```bash
# API Client 빌드
cd packages/api-client
npm install
npm run build

# Backend
cd ../../backend
npm install

# Frontend
cd ../apps/web
npm install
```

### 5. 개발 서버 실행
```bash
# Backend (터미널 1)
cd backend
npm run dev

# Frontend (터미널 2)
cd apps/web
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

### 🐳 Docker로 시작하기 (대안)

Docker Compose를 사용하면 간단하게 전체 스택을 실행할 수 있습니다.

#### 사전 요구사항
- Docker 20.10 이상
- Docker Compose 2.0 이상

#### 1. 환경 변수 설정
```bash
# Backend 환경 변수
cp backend/.env.example backend/.env
# backend/.env 파일을 편집하여 실제 값 입력

# Frontend 환경 변수 (선택적)
cp apps/web/.env.example apps/web/.env
```

#### 2. Docker Compose 실행
```bash
# 백그라운드에서 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### 3. 데이터베이스 마이그레이션
```bash
# DB 컨테이너에 접속하여 마이그레이션 실행
docker-compose exec db psql -U postgres -d education_platform -f /docker-entrypoint-initdb.d/001_init_schema.sql
docker-compose exec db psql -U postgres -d education_platform -f /docker-entrypoint-initdb.d/002_performance_indexes.sql
docker-compose exec db psql -U postgres -d education_platform -f /docker-entrypoint-initdb.d/003_add_password_reset_fields.sql
docker-compose exec db psql -U postgres -d education_platform -f /docker-entrypoint-initdb.d/004_add_email_verification.sql

# 또는 한번에 실행
for file in database/migrations/*.sql; do
  docker-compose exec -T db psql -U postgres -d education_platform < "$file"
done
```

#### 4. 데모 데이터 추가 (선택적)
```bash
docker-compose exec -T db psql -U postgres -d education_platform < database/seed.sql
```

#### 5. 서비스 접속
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

#### Docker 유용한 명령어
```bash
# 모든 서비스 중지
docker-compose down

# 볼륨까지 삭제 (데이터베이스 초기화)
docker-compose down -v

# 서비스 재시작
docker-compose restart backend

# 컨테이너 내부 접속
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db psql -U postgres -d education_platform

# 이미지 다시 빌드
docker-compose build --no-cache

# 특정 서비스만 시작
docker-compose up -d db backend
```

#### Docker 구조
- **db**: PostgreSQL 15 (Alpine)
- **backend**: Node.js 20 (Alpine) + Express
- **frontend**: Nginx (Alpine) + 빌드된 React 앱
- **네트워크**: app-network (bridge)
- **볼륨**: postgres_data (데이터 영속성)

## 🔧 환경 변수

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/education_platform
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
# ... 더 많은 설정은 backend/.env.example 참조
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_SITE_URL=http://localhost:3000
```

## 📝 사용 가능한 스크립트

### Backend
```bash
npm run dev          # 개발 서버 (nodemon)
npm start           # 프로덕션 서버
npm run db:migrate  # DB 마이그레이션
npm run check:env   # 환경 변수 검증
```

### Frontend
```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
npm run lint     # ESLint 실행
```

## 🎨 주요 페이지

- `/` - 홈페이지
- `/books` - 책 목록
- `/books/:id` - 책 상세
- `/reader/:chapterId` - 챕터 읽기
- `/dashboard` - 대시보드
- `/subscription` - 구독 관리
- `/admin` - 관리자 대시보드

## 🔐 인증 & 권한

### 역할 (Roles)
- **student** - 일반 사용자 (기본)
- **teacher** - 교사 (콘텐츠 생성 권한)
- **admin** - 관리자 (전체 권한)

### 보호된 라우트
- 대부분의 학습 기능은 로그인 필요
- 관리자 기능은 admin 역할 필요
- 일부 콘텐츠는 구독 필요

## 💳 결제 시스템

### Stripe 통합
- Checkout Session (카드 결제)
- Webhook 처리 (자동 구독 업데이트)
- 결제 내역 조회

### 구독 플랜
1. **무료 체험** (0원) - 제한된 콘텐츠
2. **월간 플랜** (9,900원/월)
3. **연간 플랜** (99,000원/년)

## 📧 이메일 시스템

- 회원가입 환영 이메일
- 비밀번호 재설정
- 이메일 인증 (선택적)
- 구독 시작/만료 알림
- 결제 실패 알림

## 🔒 보안

- **SQL Injection 방지**: Parameterized queries
- **XSS 방지**: HTML 살균화
- **CSRF 방지**: JWT 토큰
- **Rate Limiting**: 엔드포인트별 요청 제한
- **Password Hashing**: bcrypt
- **Helmet**: 보안 헤더
- **CORS**: Origin 제한

## 📊 모니터링 & 로깅

### 로그 시스템
- Console + File 로깅
- 로그 레벨: ERROR, WARN, INFO, DEBUG
- 자동 로그 회전 (30일)
- 로그 위치: `backend/logs/`

### Health Check
```bash
curl http://localhost:3001/api/health
```

## 🚀 배포

상세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

### 빠른 배포 체크리스트
- [ ] 데이터베이스 마이그레이션
- [ ] 환경 변수 설정
- [ ] `npm run check:env` 실행
- [ ] Frontend 빌드
- [ ] Backend PM2로 실행
- [ ] Nginx 설정
- [ ] SSL 인증서 설치
- [ ] Stripe Webhook 설정

## 🧪 테스트

```bash
# Backend 테스트 (추후 추가 예정)
cd backend
npm test

# Frontend 테스트 (추후 추가 예정)
cd apps/web
npm test
```

## 📖 API 문서

API 엔드포인트 목록:
- `GET /api/health` - Health check
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/books` - 책 목록
- `GET /api/users/me` - 내 정보
- ... (더 많은 엔드포인트는 코드 참조)

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📞 연락처

- 프로젝트 링크: [GitHub Repository]
- 이슈 제보: [GitHub Issues]

## 🙏 감사의 말

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for English learners**
