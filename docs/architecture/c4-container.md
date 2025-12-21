# 시스템 아키텍처 (Container Diagram)

## 개요
영어 교육 플랫폼의 컨테이너 수준 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        Education Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Browser   │────▶│  Frontend   │────▶│   Backend   │       │
│  │   (User)    │     │ React+Vite  │     │   Express   │       │
│  └─────────────┘     └─────────────┘     └──────┬──────┘       │
│                             │                    │              │
│                             │                    ▼              │
│                             │            ┌─────────────┐        │
│                             │            │ PostgreSQL  │        │
│                             │            │  Database   │        │
│                             │            └─────────────┘        │
│                             │                                   │
│                             ▼                                   │
│                      ┌─────────────┐                            │
│                      │   Sentry    │                            │
│                      │  Tracking   │                            │
│                      └─────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 컴포넌트 설명

| 컨테이너 | 기술 | 역할 |
|---------|------|------|
| Frontend | React 18, TypeScript, Vite | 사용자 인터페이스, SPA |
| Backend | Node.js, Express | REST API, 비즈니스 로직 |
| Database | PostgreSQL | 데이터 저장 |
| Sentry | Sentry SDK | 오류 추적, 성능 모니터링 |

## 외부 서비스

| 서비스 | 용도 |
|--------|------|
| Google OAuth | 소셜 로그인 |
| Kakao OAuth | 소셜 로그인 |
| Vercel/Railway | 배포 플랫폼 |

## 통신 흐름
1. 사용자 → Frontend: HTTPS
2. Frontend → Backend: REST API (JWT 인증)
3. Backend → Database: PostgreSQL 프로토콜
4. Frontend/Backend → Sentry: HTTPS (오류 리포팅)
