# 🚀 플랫폼 런칭 가이드

영어 학습 플랫폼을 실제 서비스로 런칭하기 위한 완벽한 가이드입니다.

## 📋 목차
1. [런칭 전 체크리스트](#런칭-전-체크리스트)
2. [데이터베이스 설정](#데이터베이스-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [Stripe 결제 설정](#stripe-결제-설정)
5. [이메일 설정](#이메일-설정)
6. [Analytics 설정](#analytics-설정)
7. [배포 방법](#배포-방법)
8. [런칭 후 모니터링](#런칭-후-모니터링)
9. [마케팅 및 운영](#마케팅-및-운영)

---

## ✅ 런칭 전 체크리스트

### 필수 작업
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Stripe 라이브 키 설정
- [ ] 이메일 SMTP 설정 및 테스트
- [ ] Google Analytics 설정
- [ ] 도메인 구매 및 연결
- [ ] SSL 인증서 설정 (Let's Encrypt)
- [ ] 환경 변수 모두 설정
- [ ] 프로덕션 빌드 테스트
- [ ] 백업 시스템 설정
- [ ] 모니터링 설정 (Sentry, Uptime Robot)

### 콘텐츠 준비
- [ ] 최소 10권 이상의 책 업로드
- [ ] 각 책당 최소 5챕터 이상
- [ ] 각 챕터당 퀴즈 1개 이상
- [ ] 오디오 파일 준비 (가능한 경우)
- [ ] 책 커버 이미지 최적화
- [ ] 법적 문서 준비 (ToS, Privacy Policy)

### 마케팅 준비
- [ ] 쿠폰 코드 생성 (LAUNCH2025, WELCOME 등)
- [ ] 소셜 미디어 계정 생성
- [ ] 랜딩 페이지 최적화
- [ ] SEO 메타 태그 확인
- [ ] OG 이미지 준비
- [ ] 고객 지원 이메일 설정

---

## 💾 데이터베이스 설정

### 1. PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL 접속
sudo -u postgres psql

# 데이터베이스 및 사용자 생성
CREATE DATABASE education_platform;
CREATE USER platform_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE education_platform TO platform_user;

# 연결 테스트
psql -U platform_user -d education_platform -h localhost
```

### 2. 마이그레이션 실행

```bash
cd /path/to/education-platform-2025/database/migrations

# 순서대로 실행
psql -U platform_user -d education_platform -f 001_init_schema.sql
psql -U platform_user -d education_platform -f 002_performance_indexes.sql
psql -U platform_user -d education_platform -f 003_add_password_reset_fields.sql
psql -U platform_user -d education_platform -f 004_add_email_verification.sql
psql -U platform_user -d education_platform -f 005_add_coupons.sql
psql -U platform_user -d education_platform -f 006_add_reviews.sql

# 또는 한 번에 실행
for file in *.sql; do
  psql -U platform_user -d education_platform -f "$file"
  echo "✓ $file completed"
done
```

### 3. 샘플 데이터 입력 (선택적)

```bash
# 개발/테스트용
psql -U platform_user -d education_platform -f ../seed.sql
```

### 4. 데이터베이스 백업 설정

```bash
# Crontab 설정
crontab -e

# 매일 새벽 2시 백업
0 2 * * * DB_HOST=localhost DB_PORT=5432 DB_NAME=education_platform DB_USER=platform_user DB_PASSWORD=your_password BACKUP_DIR=/var/backups/education-platform /path/to/scripts/backup-database.sh
```

---

## ⚙️ 환경 변수 설정

### Backend (.env)

```env
# 서버 설정
NODE_ENV=production
PORT=3001

# 데이터베이스
DATABASE_URL=postgresql://platform_user:your_strong_password@localhost:5432/education_platform

# JWT (랜덤 시크릿 생성)
JWT_SECRET=<64자 이상의 랜덤 문자열>
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Stripe (라이브 키로 변경!)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://yourdomain.com/subscription/success
STRIPE_CANCEL_URL=https://yourdomain.com/subscription/cancel

# 이메일 (Gmail 또는 SendGrid)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=영어학습플랫폼 <noreply@yourdomain.com>

# 관리자 이메일
ADMIN_EMAILS=admin@yourdomain.com,tech@yourdomain.com

# 프론트엔드 URL
FRONTEND_URL=https://yourdomain.com

# 로깅
ENABLE_FILE_LOGGING=true

# Sentry (선택적)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
APP_VERSION=1.0.0
```

### Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_SITE_URL=https://yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry (선택적)
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

### 시크릿 생성 명령어

```bash
# JWT Secret 생성 (64바이트)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 또는 OpenSSL 사용
openssl rand -hex 64
```

---

## 💳 Stripe 결제 설정

### 1. Stripe 계정 설정

1. https://dashboard.stripe.com 가입
2. 비즈니스 정보 입력
3. 은행 계좌 연결

### 2. 라이브 모드 활성화

1. Dashboard → Settings → Account
2. "Activate your account" 클릭
3. 필요한 정보 입력 (사업자 정보, 세금 정보 등)

### 3. API 키 확인

1. Dashboard → Developers → API keys
2. **Live** 키 복사:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

### 4. Webhook 설정

1. Dashboard → Developers → Webhooks
2. "Add endpoint" 클릭
3. URL: `https://yourdomain.com/api/payments/webhook`
4. Events to send 선택:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Webhook signing secret 복사: `whsec_...`

### 5. 구독 플랜 생성 (선택적)

Stripe에서 직접 Product 및 Price를 생성할 수도 있지만, 현재는 동적으로 생성하므로 불필요합니다.

---

## 📧 이메일 설정

### 옵션 1: Gmail 사용

1. **앱 비밀번호 생성**
   - https://myaccount.google.com
   - 보안 → 2단계 인증 활성화
   - 앱 비밀번호 생성
   - "메일" 선택 후 16자리 비밀번호 복사

2. **환경 변수 설정**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=<16자리 앱 비밀번호>
   ```

3. **제한사항**
   - 일일 발송 제한: 500통
   - 무료

### 옵션 2: SendGrid 사용 (권장)

1. **SendGrid 가입**
   - https://sendgrid.com
   - 무료 플랜: 월 100통

2. **API Key 생성**
   - Settings → API Keys → Create API Key

3. **환경 변수 설정**
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=<SendGrid API Key>
   ```

4. **SPF/DKIM 설정**
   - Settings → Sender Authentication
   - 도메인 인증 완료

### 옵션 3: AWS SES (대량 발송)

- 가장 저렴 ($0.10 per 1,000 emails)
- 설정이 복잡
- 프로덕션 권장

---

## 📊 Analytics 설정

### Google Analytics 4

1. **GA4 속성 생성**
   - https://analytics.google.com
   - 관리 → 속성 만들기
   - 측정 ID 복사: `G-XXXXXXXXXX`

2. **환경 변수 설정**
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **데이터 스트림 설정**
   - 웹 스트림 추가
   - 도메인: `yourdomain.com`
   - 향상된 측정 활성화

4. **전환 이벤트 설정**
   - 관리 → 이벤트
   - 전환으로 표시:
     - `purchase` (구독 구매)
     - `sign_up` (회원가입)
     - `chapter_complete` (챕터 완료)

---

## 🚀 배포 방법

### 옵션 1: Docker Compose (권장)

```bash
# 1. 저장소 클론
git clone <your-repo-url>
cd education-platform-2025

# 2. 환경 변수 설정
cp backend/.env.example backend/.env
cp apps/web/.env.example apps/web/.env
# .env 파일들을 실제 값으로 수정

# 3. Docker Compose 실행
docker-compose up -d

# 4. 데이터베이스 마이그레이션
for file in database/migrations/*.sql; do
  docker-compose exec -T db psql -U postgres -d education_platform < "$file"
done

# 5. 서비스 확인
docker-compose ps
curl http://localhost:3001/api/health
```

### 옵션 2: PM2 (Node.js)

```bash
# 1. Node.js 및 PostgreSQL 설치
# 2. 저장소 클론 및 의존성 설치

cd packages/api-client && npm install && npm run build && cd ../..
cd backend && npm install
cd ../apps/web && npm install && npm run build

# 3. PM2로 Backend 실행
cd backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 4. Nginx 설정
sudo cp deployment/nginx.conf /etc/nginx/sites-available/education-platform
sudo ln -s /etc/nginx/sites-available/education-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. SSL 설정
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 옵션 3: Vercel + Railway (PaaS)

**Frontend (Vercel):**
1. Vercel에 연결
2. 환경 변수 설정
3. 자동 배포

**Backend (Railway):**
1. Railway에 연결
2. PostgreSQL addon 추가
3. 환경 변수 설정
4. 자동 배포

---

## 📈 런칭 후 모니터링

### 1. Uptime 모니터링

**UptimeRobot (무료)**
- https://uptimerobot.com
- 5분마다 Health Check
- 다운타임 시 이메일 알림

### 2. Error Tracking

**Sentry 설정**
- [SENTRY_SETUP.md](./SENTRY_SETUP.md) 참고
- 실시간 에러 추적
- 성능 모니터링

### 3. 로그 모니터링

```bash
# Backend 로그 확인
tail -f backend/logs/app.log

# Docker 로그 확인
docker-compose logs -f backend
```

### 4. 데이터베이스 모니터링

```sql
-- 활성 연결 수
SELECT count(*) FROM pg_stat_activity;

-- 느린 쿼리 확인
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 데이터베이스 크기
SELECT pg_size_pretty(pg_database_size('education_platform'));
```

---

## 🎯 마케팅 및 운영

### 런칭 Day 1-7

1. **쿠폰 코드 활성화**
   ```sql
   -- Admin 페이지에서 또는 SQL로 직접
   -- LAUNCH2025: 50% 할인 (1주일)
   -- WELCOME: 20% 할인 (신규 가입자)
   ```

2. **소셜 미디어 캠페인**
   - 블로그 포스트: "영어 학습 플랫폼 런칭!"
   - Instagram/Facebook: 런칭 이벤트
   - 네이버 블로그/카페: 홍보

3. **이메일 마케팅**
   - 베타 테스터에게 런칭 알림
   - 조기 가입 혜택 안내

### 첫 달 목표

- [ ] 100명 가입
- [ ] 20명 유료 구독
- [ ] 평균 평점 4.0 이상
- [ ] 일일 활성 사용자 50명

### KPI 추적

```sql
-- 일일 신규 가입
SELECT DATE(created_at), COUNT(*)
FROM users
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- 구독 전환율
SELECT
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT s.user_id) as subscribed_users,
  ROUND(COUNT(DISTINCT s.user_id)::numeric / COUNT(DISTINCT u.id) * 100, 2) as conversion_rate
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active';

-- 일일 매출
SELECT DATE(created_at), SUM(amount) as daily_revenue
FROM payments
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;
```

---

## 🔧 문제 해결

### 결제가 안 될 때

1. Stripe Webhook이 제대로 설정되었는지 확인
2. Stripe 로그 확인: https://dashboard.stripe.com/logs
3. Backend 로그 확인: `/api/payments/webhook` 엔드포인트

### 이메일이 안 갈 때

1. SMTP 설정 확인
2. 스팸 폴더 확인
3. SPF/DKIM 레코드 확인
4. Gmail: 앱 비밀번호 재생성

### 성능이 느릴 때

1. Database 인덱스 확인
2. API 응답 시간 측정
3. CDN 사용 (Cloudflare)
4. 이미지 최적화

---

## 📚 추가 리소스

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 상세 배포 가이드
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - 100+ 체크리스트
- [SENTRY_SETUP.md](./SENTRY_SETUP.md) - 에러 추적 설정
- [README.md](./README.md) - 프로젝트 개요

---

## 🎉 런칭을 축하합니다!

모든 설정이 완료되면 런칭하세요! 🚀

**마지막 체크:**
```bash
# Health Check
curl https://yourdomain.com/api/health

# Frontend 접속
curl https://yourdomain.com

# 실제 결제 테스트 (Stripe Test Mode)
# Stripe Dashboard에서 테스트 결제 확인
```

**성공적인 런칭을 기원합니다!** 💪

---

**문의사항:**
- Technical Support: tech@yourdomain.com
- Business Inquiries: business@yourdomain.com

**마지막 업데이트**: 2025-01-17
