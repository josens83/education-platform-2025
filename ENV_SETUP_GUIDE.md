# 환경 변수 설정 가이드

영어 교육 플랫폼의 환경 변수 설정을 위한 완벽 가이드입니다.

## 📋 목차

- [개요](#개요)
- [백엔드 환경 변수](#백엔드-환경-변수)
- [프론트엔드 환경 변수](#프론트엔드-환경-변수)
- [외부 서비스 설정](#외부-서비스-설정)
- [환경별 설정](#환경별-설정)
- [검증 및 테스트](#검증-및-테스트)

---

## 개요

프로젝트는 다음 환경 변수 파일들을 사용합니다:

```
/
├── .env.example                    # 루트 환경 변수 예시
├── backend/.env                    # 백엔드 환경 변수 (생성 필요)
└── apps/web/.env                   # 프론트엔드 환경 변수 (생성 필요)
```

## 백엔드 환경 변수

### 1. 기본 설정 파일 생성

```bash
cd backend
cp ../.env.example .env
```

### 2. 필수 환경 변수 설정

#### 🔧 서버 설정

```env
NODE_ENV=development
PORT=3001
```

#### 💾 데이터베이스

PostgreSQL 연결 정보:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/education_platform
```

또는 개별 설정:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=education_platform
DB_MAX_POOL=20
DB_MIN_POOL=5
```

#### 🔐 인증 및 보안

**JWT 시크릿 생성:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```env
JWT_SECRET=생성된_64자_이상의_랜덤_문자열
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=또다른_64자_이상의_랜덤_문자열
JWT_REFRESH_EXPIRES_IN=30d
```

**세션 시크릿:**

```env
SESSION_SECRET=또다른_64자_이상의_랜덤_문자열
```

#### 🌐 CORS 및 URL

```env
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

프로덕션:

```env
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

### 3. 외부 서비스 설정

#### 💳 Stripe (결제)

1. [Stripe Dashboard](https://dashboard.stripe.com/) 접속
2. Developers → API keys에서 키 복사
3. 개발 환경에서는 테스트 키 사용:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

4. Webhook 설정:
   - Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_failed`

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

5. 프로덕션에서는 라이브 키로 변경:

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### 📧 이메일 (Nodemailer)

**Gmail 사용 시:**

1. Google 계정 → 보안 → 2단계 인증 활성화
2. 앱 비밀번호 생성
3. 환경 변수에 추가:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=생성한_앱_비밀번호
EMAIL_FROM_NAME=English Education Platform
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

**기타 SMTP 서비스:**

```env
# SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxx

# AWS SES
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=AKIAXXXXXXXXX
EMAIL_PASSWORD=xxxxxxxxxx
```

#### 🔑 소셜 로그인

**Google OAuth:**

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. APIs & Services → Credentials
4. Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

**Kakao OAuth:**

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 애플리케이션 추가
3. 앱 키 → REST API 키 복사
4. 플랫폼 설정 → Web → Redirect URI 등록

```env
KAKAO_CLIENT_ID=카카오_REST_API_키
KAKAO_CLIENT_SECRET=카카오_클라이언트_시크릿
KAKAO_CALLBACK_URL=http://localhost:3001/api/auth/kakao/callback
```

**Naver OAuth (선택적):**

1. [Naver Developers](https://developers.naver.com/) 접속
2. 애플리케이션 등록
3. 서비스 URL, Callback URL 설정

```env
NAVER_CLIENT_ID=네이버_클라이언트_ID
NAVER_CLIENT_SECRET=네이버_클라이언트_시크릿
NAVER_CALLBACK_URL=http://localhost:3001/api/auth/naver/callback
```

#### 🤖 OpenAI (AI 추천)

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. API Keys → Create new secret key

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
```

---

## 프론트엔드 환경 변수

### 1. 기본 설정 파일 생성

```bash
cd apps/web
cp .env.example .env
```

### 2. 필수 환경 변수

```env
# API URL
VITE_API_URL=http://localhost:3001
VITE_SITE_URL=http://localhost:3000

# Stripe Public Key (백엔드와 동일한 키 세트)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Google OAuth
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com

# Kakao OAuth
VITE_KAKAO_CLIENT_ID=카카오_JavaScript_키

# 기능 플래그
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_PWA=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### 3. 선택적 환경 변수

```env
# Google Analytics
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXX-Y

# Google Tag Manager
VITE_GTM_ID=GTM-XXXXXXX

# Facebook Pixel
VITE_FACEBOOK_PIXEL_ID=

# CDN
VITE_CDN_URL=https://cdn.yourdomain.com
```

---

## 외부 서비스 설정

### Stripe 결제 설정

#### 1. 제품 및 가격 생성

Stripe Dashboard에서:

1. Products → Add product
2. 이름: "월간 플랜" / "연간 플랜"
3. Recurring: Monthly / Yearly
4. Price ID 복사

```env
STRIPE_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_YEARLY=price_xxxxxxxxxxxxx
```

#### 2. Webhook 테스트 (로컬)

```bash
# Stripe CLI 설치
brew install stripe/stripe-cli/stripe

# Stripe 로그인
stripe login

# Webhook 포워딩
stripe listen --forward-to localhost:3001/api/payments/webhook
```

### Google OAuth 설정

#### 1. Consent Screen 설정

- User Type: External
- App name: English Education Platform
- User support email: your-email@example.com
- Developer contact: your-email@example.com

#### 2. Scopes 추가

- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`

#### 3. Test users 추가 (개발 중)

### Kakao OAuth 설정

#### 1. 플랫폼 설정

- Web: `http://localhost:3000`
- Redirect URI: `http://localhost:3001/api/auth/kakao/callback`

#### 2. 동의 항목 설정

- 필수: 닉네임, 이메일
- 선택: 프로필 사진

---

## 환경별 설정

### 개발 환경 (Development)

```env
NODE_ENV=development
DEBUG_MODE=true
VERBOSE_LOGGING=true
LOG_LEVEL=debug

# 로컬 데이터베이스
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/education_platform

# 로컬 URL
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Stripe 테스트 키
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### 스테이징 환경 (Staging)

```env
NODE_ENV=staging
DEBUG_MODE=false
LOG_LEVEL=info

# 스테이징 데이터베이스
DATABASE_URL=postgresql://user:pass@staging-db.com:5432/education_platform

# 스테이징 URL
FRONTEND_URL=https://staging.yourdomain.com
CORS_ORIGIN=https://staging.yourdomain.com

# Stripe 테스트 키 (스테이징에서도 테스트 키 사용)
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### 프로덕션 환경 (Production)

```env
NODE_ENV=production
DEBUG_MODE=false
LOG_LEVEL=warn

# 프로덕션 데이터베이스
DATABASE_URL=postgresql://user:pass@prod-db.com:5432/education_platform

# 프로덕션 URL
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Stripe 라이브 키
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# 보안 설정
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# 프로덕션 이메일
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxx
```

---

## 검증 및 테스트

### 1. 환경 변수 검증

백엔드 환경 변수 검증:

```bash
cd backend
npm run check:env
```

### 2. 데이터베이스 연결 테스트

```bash
psql $DATABASE_URL -c "SELECT version();"
```

### 3. Stripe 연결 테스트

```bash
curl https://api.stripe.com/v1/balance \
  -u $STRIPE_SECRET_KEY:
```

### 4. 이메일 전송 테스트

Node.js 스크립트 실행:

```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_FROM_ADDRESS,
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email',
}, (err, info) => {
  if (err) console.error('Error:', err);
  else console.log('Success:', info);
});
```

---

## 보안 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 모든 시크릿이 강력한 랜덤 값인지 확인
- [ ] 프로덕션에서 `NODE_ENV=production` 설정 확인
- [ ] CORS_ORIGIN이 실제 도메인으로 설정되어 있는지 확인
- [ ] Stripe 라이브 키 사용 시 테스트 모드가 아닌지 확인
- [ ] 데이터베이스 비밀번호가 16자 이상인지 확인
- [ ] 프로덕션에서 `DEBUG_MODE=false` 확인
- [ ] 프로덕션에서 `COOKIE_SECURE=true` 확인

---

## 문제 해결

### 데이터베이스 연결 실패

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**해결:**

1. PostgreSQL이 실행 중인지 확인
2. DATABASE_URL 포맷 확인
3. 데이터베이스 사용자 권한 확인

### Stripe Webhook 실패

```
Error: No signatures found matching the expected signature
```

**해결:**

1. STRIPE_WEBHOOK_SECRET이 올바른지 확인
2. Stripe CLI로 로컬 테스트
3. 프로덕션 webhook 엔드포인트 확인

### OAuth 리다이렉트 실패

```
Error: redirect_uri_mismatch
```

**해결:**

1. OAuth 제공업체 콘솔에서 Redirect URI 확인
2. 프로토콜 (http vs https) 확인
3. Trailing slash (/) 확인

---

## 추가 리소스

- [환경 변수 예시 파일](./.env.example)
- [Stripe 문서](https://stripe.com/docs)
- [Google OAuth 문서](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Developers 가이드](https://developers.kakao.com/docs)
- [Nodemailer 문서](https://nodemailer.com/)

---

**마지막 업데이트**: 2025-01-18
