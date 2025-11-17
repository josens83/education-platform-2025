# 배포 가이드

이 문서는 영어 학습 플랫폼을 프로덕션 환경에 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

### 필수 서비스
- **PostgreSQL 데이터베이스** (v12 이상)
- **Node.js** (v16 이상)
- **Stripe 계정** (결제 처리)
- **이메일 서비스** (Gmail, SendGrid 등)
- **도메인 및 SSL 인증서**

## 🚀 배포 단계

### 1. 데이터베이스 설정

```bash
# PostgreSQL 데이터베이스 생성
createdb education_platform

# 마이그레이션 실행
cd database/migrations
psql -U postgres -d education_platform -f 001_init_schema.sql
psql -U postgres -d education_platform -f 002_add_features.sql
psql -U postgres -d education_platform -f 003_add_password_reset_fields.sql
psql -U postgres -d education_platform -f 004_add_email_verification.sql
```

### 2. 환경 변수 설정

```bash
# backend/.env 파일 생성
cp backend/.env.example backend/.env

# 필수 환경 변수 설정
vi backend/.env
```

**필수 환경 변수:**

```env
# 서버
NODE_ENV=production
PORT=3001

# 데이터베이스
DATABASE_URL=postgresql://user:password@host:5432/education_platform

# JWT (보안상 강력한 랜덤 문자열 사용)
JWT_SECRET=<최소-32자-이상의-강력한-랜덤-문자열>
JWT_EXPIRES_IN=7d

# CORS (프론트엔드 도메인)
CORS_ORIGIN=https://yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://yourdomain.com/subscription/success
STRIPE_CANCEL_URL=https://yourdomain.com/subscription/cancel

# 이메일
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=영어학습플랫폼 <no-reply@yourdomain.com>

# 프론트엔드 URL
FRONTEND_URL=https://yourdomain.com

# 로깅
ENABLE_FILE_LOGGING=true
```

### 3. 환경 설정 검증

```bash
# 환경 변수 검증 스크립트 실행
node scripts/check-env.js

# ✅ 모든 검사를 통과해야 배포 가능
```

### 4. 의존성 설치

```bash
# 루트에서 실행
npm install

# 백엔드
cd backend
npm install

# 프론트엔드
cd apps/web
npm install

# API 클라이언트 빌드
cd packages/api-client
npm install
npm run build
```

### 5. 프론트엔드 빌드

```bash
cd apps/web

# 프로덕션 빌드
npm run build

# dist/ 폴더가 생성됨
```

### 6. 백엔드 실행

```bash
cd backend

# PM2로 실행 (권장)
pm2 start server.js --name education-api

# 또는 직접 실행
NODE_ENV=production node server.js
```

### 7. 프론트엔드 배포

**옵션 A: Nginx로 정적 파일 서빙**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**옵션 B: Vercel/Netlify**

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

## 🔒 보안 체크리스트

- [ ] JWT_SECRET이 강력한 랜덤 문자열인지 확인
- [ ] 모든 API 키가 프로덕션 키인지 확인
- [ ] CORS_ORIGIN이 실제 도메인으로 설정되어 있는지 확인
- [ ] DATABASE_URL이 프로덕션 데이터베이스를 가리키는지 확인
- [ ] SSL/TLS 인증서가 설치되어 있는지 확인
- [ ] Stripe Webhook Secret이 올바르게 설정되어 있는지 확인
- [ ] Rate Limiting이 활성화되어 있는지 확인
- [ ] 로그 파일 권한이 적절한지 확인

## 📊 모니터링

### 로그 확인

```bash
# PM2 로그
pm2 logs education-api

# 파일 로그
tail -f backend/logs/all.log
tail -f backend/logs/error.log
```

### Health Check

```bash
# API 상태 확인
curl https://yourdomain.com/api/health

# 응답:
# {
#   "status": "ok",
#   "message": "서버가 정상 작동 중입니다",
#   "timestamp": "...",
#   "database": "connected"
# }
```

## 🔄 업데이트

```bash
# 코드 업데이트
git pull origin main

# 의존성 재설치
npm install

# 프론트엔드 재빌드
cd apps/web
npm run build

# 백엔드 재시작
pm2 restart education-api

# 또는
pm2 reload education-api  # 무중단 재시작
```

## ⚠️ 트러블슈팅

### 데이터베이스 연결 실패
```bash
# 연결 테스트
psql $DATABASE_URL

# 방화벽 확인
sudo ufw status
```

### Stripe Webhook 실패
```bash
# Webhook 이벤트 확인
# Stripe Dashboard > Developers > Webhooks

# 로컬에서 테스트
stripe listen --forward-to localhost:3001/api/payments/webhook
```

### 이메일 발송 실패
```bash
# SMTP 연결 테스트
telnet smtp.gmail.com 587

# Gmail App Password 재생성
# https://myaccount.google.com/apppasswords
```

## 📝 참고사항

- **로그 회전**: 30일 이상 된 로그는 자동 삭제됨
- **API Rate Limiting**: 15분당 100개 요청 제한
- **파일 업로드**: 최대 10MB
- **세션 만료**: JWT 토큰 7일

## 🆘 지원

문제가 발생하면 다음을 확인하세요:

1. `node scripts/check-env.js` 실행
2. `pm2 logs` 확인
3. `backend/logs/error.log` 확인
4. Health Check 엔드포인트 확인

---

**배포 체크리스트:**

- [ ] 데이터베이스 마이그레이션 완료
- [ ] 환경 변수 설정 완료
- [ ] 환경 설정 검증 통과
- [ ] 프론트엔드 빌드 완료
- [ ] 백엔드 실행 확인
- [ ] Health Check 통과
- [ ] Stripe Webhook 설정 완료
- [ ] 이메일 발송 테스트 완료
- [ ] SSL 인증서 설치 완료
- [ ] 도메인 DNS 설정 완료
