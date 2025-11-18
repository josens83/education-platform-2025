# Sentry Error Tracking 설정 가이드

Sentry를 사용하여 프로덕션 환경에서 에러를 실시간으로 추적하고 모니터링하는 방법입니다.

## 📋 목차
- [왜 Sentry를 사용해야 하나요?](#왜-sentry를-사용해야-하나요)
- [Sentry 계정 설정](#sentry-계정-설정)
- [Frontend 설정](#frontend-설정-react)
- [Backend 설정](#backend-설정-nodejs)
- [고급 설정](#고급-설정)
- [모범 사례](#모범-사례)

---

## 왜 Sentry를 사용해야 하나요?

### 장점
- ✅ **실시간 에러 모니터링**: 프로덕션에서 발생하는 모든 에러를 실시간으로 확인
- ✅ **상세한 에러 컨텍스트**: 스택 트레이스, 사용자 정보, 브라우저 정보 등
- ✅ **에러 그룹화**: 유사한 에러를 자동으로 그룹화하여 관리
- ✅ **알림**: 이메일, Slack 등으로 즉시 알림 받기
- ✅ **성능 모니터링**: 페이지 로드 시간, API 응답 시간 등
- ✅ **릴리스 추적**: 어떤 버전에서 에러가 발생했는지 추적

---

## Sentry 계정 설정

### 1. Sentry 가입
1. https://sentry.io 방문
2. 무료 계정 생성 (개인 프로젝트는 무료)
3. 조직(Organization) 생성

### 2. 프로젝트 생성
1. "Create Project" 클릭
2. 플랫폼 선택:
   - Frontend: **React**
   - Backend: **Node.js** (Express)
3. 프로젝트 이름 입력: `education-platform-frontend`, `education-platform-backend`
4. DSN (Data Source Name) 복사 - 이 값을 환경 변수로 사용

---

## Frontend 설정 (React)

### 1. 패키지 설치
```bash
cd apps/web
npm install --save @sentry/react
```

### 2. 환경 변수 설정
```bash
# apps/web/.env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

### 3. Sentry 초기화

**apps/web/src/lib/sentry.ts**
```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initializeSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';

  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release: `education-platform@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

    // 성능 모니터링
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // 트랜잭션 샘플링 비율 (100% = 모든 트랜잭션 추적)
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // 세션 재생 샘플링
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 에러 발생 시 100% 재생

    // 개인정보 보호
    beforeSend(event, hint) {
      // 민감한 데이터 필터링
      if (event.request) {
        // Authorization 헤더 제거
        delete event.request.headers?.['Authorization'];
        delete event.request.headers?.['authorization'];

        // 쿼리 파라미터에서 민감한 정보 제거
        if (event.request.query_string) {
          event.request.query_string = event.request.query_string
            .replace(/password=[^&]*/g, 'password=[FILTERED]')
            .replace(/token=[^&]*/g, 'token=[FILTERED]');
        }
      }

      return event;
    },

    // 무시할 에러
    ignoreErrors: [
      // 네트워크 에러 (사용자 인터넷 문제)
      'Network request failed',
      'NetworkError',
      'Failed to fetch',

      // 브라우저 확장 프로그램 에러
      'chrome-extension://',
      'moz-extension://',

      // ResizeObserver (일반적으로 무해한 에러)
      'ResizeObserver loop limit exceeded',
    ],
  });

  console.log('Sentry initialized');
}

// 사용자 정보 설정
export function setSentryUser(user: { id: number; email: string; username: string }) {
  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.username,
  });
}

// 사용자 정보 제거 (로그아웃 시)
export function clearSentryUser() {
  Sentry.setUser(null);
}

// 커스텀 에러 보고
export function reportError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// 커스텀 메시지 보고
export function reportMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

// 브레드크럼 추가 (에러 발생 전 사용자 행동 추적)
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
```

### 4. Main.tsx에서 초기화

**apps/web/src/main.tsx**
```typescript
import { initializeSentry } from './lib/sentry';

// Sentry 초기화 (다른 초기화보다 먼저!)
initializeSentry();

// ... 나머지 코드
```

### 5. ErrorBoundary 업데이트

**apps/web/src/components/ErrorBoundary.tsx**
```typescript
import * as Sentry from '@sentry/react';

// Sentry의 ErrorBoundary 사용
export default Sentry.withErrorBoundary(YourApp, {
  fallback: <ErrorFallbackComponent />,
  showDialog: true, // 에러 발생 시 사용자에게 피드백 요청 다이얼로그 표시
});
```

---

## Backend 설정 (Node.js)

### 1. 패키지 설치
```bash
cd backend
npm install --save @sentry/node @sentry/tracing
```

### 2. 환경 변수 설정
```bash
# backend/.env
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
APP_VERSION=1.0.0
```

### 3. Sentry 초기화

**backend/lib/sentry.js**
```javascript
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

function initializeSentry(app) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    release: `education-platform-backend@${process.env.APP_VERSION || '1.0.0'}`,

    // 성능 모니터링
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
      new Tracing.Integrations.Postgres(),
    ],

    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // 민감한 데이터 필터링
    beforeSend(event, hint) {
      // Authorization 헤더 제거
      if (event.request && event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // 요청 body에서 비밀번호 제거
      if (event.request && event.request.data) {
        const data = typeof event.request.data === 'string'
          ? JSON.parse(event.request.data)
          : event.request.data;

        if (data.password) data.password = '[FILTERED]';
        if (data.token) data.token = '[FILTERED]';

        event.request.data = data;
      }

      return event;
    },
  });

  console.log('Sentry initialized (Backend)');
}

// Express 미들웨어
function getSentryMiddleware() {
  return {
    requestHandler: Sentry.Handlers.requestHandler(),
    tracingHandler: Sentry.Handlers.tracingHandler(),
    errorHandler: Sentry.Handlers.errorHandler(),
  };
}

// 커스텀 에러 보고
function reportError(error, context = {}) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// 사용자 설정
function setSentryUser(user) {
  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.username,
  });
}

module.exports = {
  initializeSentry,
  getSentryMiddleware,
  reportError,
  setSentryUser,
  Sentry,
};
```

### 4. Server.js에 통합

**backend/server.js**
```javascript
const { initializeSentry, getSentryMiddleware } = require('./lib/sentry');

const app = express();

// Sentry 초기화 (다른 미들웨어보다 먼저!)
initializeSentry(app);

const sentryMiddleware = getSentryMiddleware();

// Sentry Request Handler (첫 번째 미들웨어)
app.use(sentryMiddleware.requestHandler);
app.use(sentryMiddleware.tracingHandler);

// ... 다른 미들웨어들 ...

// Routes
app.use('/api/auth', authRoutes);
// ...

// Sentry Error Handler (에러 핸들러 직전)
app.use(sentryMiddleware.errorHandler);

// 일반 에러 핸들러
app.use((err, req, res, next) => {
  // 에러는 이미 Sentry로 전송됨
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
  });
});
```

---

## 고급 설정

### 성능 모니터링 (Transactions)

**Frontend:**
```typescript
import * as Sentry from '@sentry/react';

// 커스텀 트랜잭션
const transaction = Sentry.startTransaction({
  name: 'Load Book Chapter',
  op: 'content.load',
});

try {
  await loadChapter(chapterId);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

**Backend:**
```javascript
const transaction = Sentry.startTransaction({
  op: 'db.query',
  name: 'Fetch user subscriptions',
});

try {
  const result = await query('SELECT * FROM subscriptions WHERE user_id = $1', [userId]);
  transaction.setStatus('ok');
  return result;
} catch (error) {
  transaction.setStatus('internal_error');
  Sentry.captureException(error);
  throw error;
} finally {
  transaction.finish();
}
```

### 소스맵 업로드 (프로덕션 디버깅)

**1. Sentry CLI 설치:**
```bash
npm install --save-dev @sentry/cli
```

**2. .sentryclirc 파일 생성:**
```ini
[auth]
token=your-auth-token

[defaults]
org=your-org
project=education-platform-frontend
```

**3. 빌드 스크립트 수정 (package.json):**
```json
{
  "scripts": {
    "build": "vite build && npm run sentry:sourcemaps",
    "sentry:sourcemaps": "sentry-cli sourcemaps upload --release=$npm_package_version ./dist"
  }
}
```

### 알림 설정

1. Sentry 대시보드 → Settings → Alerts
2. New Alert Rule 생성
3. 조건 설정:
   - 에러 발생 빈도
   - 특정 타입의 에러
   - 새로운 에러 발생
4. 알림 채널 설정:
   - Email
   - Slack
   - PagerDuty
   - Webhook

---

## 모범 사례

### 1. 의미 있는 에러 메시지
```typescript
// ❌ 나쁜 예
throw new Error('Error');

// ✅ 좋은 예
throw new Error('Failed to load chapter 123: Network timeout');
```

### 2. 컨텍스트 추가
```typescript
Sentry.captureException(error, {
  extra: {
    chapterId: 123,
    userId: 456,
    attemptCount: 3,
  },
  tags: {
    section: 'reader',
    feature: 'chapter-loading',
  },
});
```

### 3. 브레드크럼 활용
```typescript
import { addBreadcrumb } from './lib/sentry';

// 사용자 행동 추적
addBreadcrumb('User clicked subscribe button', 'user', { planId: 2 });
addBreadcrumb('Stripe checkout opened', 'payment', { amount: 9900 });
```

### 4. 환경별 설정
```typescript
// 개발 환경에서는 Sentry 비활성화 (선택적)
const enableSentry = import.meta.env.PROD;

if (enableSentry) {
  initializeSentry();
}
```

### 5. 에러 그룹화
```typescript
Sentry.captureException(error, {
  fingerprint: ['database', 'timeout', 'subscriptions'],
});
```

---

## 비용 관리

### 무료 플랜 제한
- **5,000 errors/month**
- **10,000 performance units/month**
- 무제한 프로젝트

### 비용 절감 팁
1. **샘플링 비율 조정**: `tracesSampleRate: 0.1` (10%만 추적)
2. **무시할 에러 설정**: `ignoreErrors` 옵션 활용
3. **환경별 설정**: 개발 환경에서는 비활성화
4. **필터링**: `beforeSend`로 불필요한 에러 제거

---

## 대시보드 활용

### 주요 메트릭
- **Issues**: 발생한 에러 목록
- **Performance**: 페이지 로드 시간, API 응답 시간
- **Releases**: 버전별 에러 추적
- **Discover**: 커스텀 쿼리로 데이터 분석

### 유용한 쿼리
```
# 가장 많이 발생한 에러
event.type:error LEVEL:error

# 특정 사용자의 에러
user.id:123

# 특정 페이지의 에러
url:"*/reader/*"

# 느린 트랜잭션
transaction.duration:>3000
```

---

## 문제 해결

### Q: Sentry가 에러를 캡처하지 않아요
A:
1. DSN이 올바르게 설정되었는지 확인
2. `initializeSentry()`가 다른 코드보다 먼저 실행되는지 확인
3. 브라우저 콘솔에서 네트워크 탭 확인 (sentry.io로 요청이 가는지)

### Q: 너무 많은 에러가 보고돼요
A:
1. `ignoreErrors` 옵션으로 불필요한 에러 필터링
2. `beforeSend`로 특정 조건의 에러 제외
3. 샘플링 비율 낮추기

### Q: 소스맵이 작동하지 않아요
A:
1. 빌드 시 소스맵 생성 확인: `vite build --sourcemap`
2. Sentry CLI로 소스맵 업로드 확인
3. Release 버전이 일치하는지 확인

---

## 참고 자료

- [Sentry React 문서](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Node.js 문서](https://docs.sentry.io/platforms/node/)
- [성능 모니터링](https://docs.sentry.io/product/performance/)
- [소스맵 가이드](https://docs.sentry.io/platforms/javascript/sourcemaps/)

---

**마지막 업데이트**: 2025-01-17
