# 배포 및 실행 가이드

Phase 2 완료 후 애플리케이션을 빌드하고 실행하는 가이드입니다.

## 목차
1. [사전 요구사항](#사전-요구사항)
2. [로컬 개발 환경 실행](#로컬-개발-환경-실행)
3. [Docker를 사용한 배포](#docker를-사용한-배포)
4. [프로덕션 빌드](#프로덕션-빌드)
5. [환경 변수 설정](#환경-변수-설정)
6. [문제 해결](#문제-해결)

## 사전 요구사항

### 필수 설치 항목
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14.0
- Docker & Docker Compose (Docker 배포 시)

### 의존성 설치

```bash
# 루트 디렉토리에서 모든 패키지 설치
npm install

# 각 패키지 개별 설치 (필요시)
cd packages/api-client && npm install
cd packages/shared && npm install
cd apps/web && npm install
cd backend && npm install
```

## 로컬 개발 환경 실행

### 1. 데이터베이스 설정

```bash
# PostgreSQL 시작 (로컬 설치된 경우)
sudo service postgresql start

# 데이터베이스 생성
createdb education_platform

# 스키마 및 샘플 데이터 로드
psql education_platform < database/schema.sql
psql education_platform < database/sample-data.sql
```

### 2. 환경 변수 설정

루트 디렉토리에 `.env` 파일 생성:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=education_platform

# Backend
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001
```

### 3. Backend 실행

```bash
cd backend
npm run dev
# Backend API가 http://localhost:3001 에서 실행됩니다
```

### 4. Frontend 실행

```bash
cd apps/web
npm run dev
# Frontend가 http://localhost:5173 에서 실행됩니다
```

### 5. 개발 서버 접속

브라우저에서 http://localhost:5173 접속

## Docker를 사용한 배포

### 1. 기존 컨테이너 정리 (선택사항)

```bash
# 실행 중인 컨테이너 중지 및 제거
docker compose down

# 볼륨까지 완전히 제거 (데이터 초기화)
docker compose down -v
```

### 2. Docker 이미지 빌드

```bash
# 모든 서비스 빌드 (캐시 사용 안 함)
docker compose build --no-cache

# 특정 서비스만 빌드
docker compose build backend
docker compose build web
```

### 3. 서비스 실행

```bash
# 모든 서비스 시작 (백그라운드)
docker compose up -d

# 로그 확인
docker compose logs -f

# 특정 서비스 로그만 확인
docker compose logs -f backend
docker compose logs -f web
```

### 4. 서비스 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker compose ps

# 서비스 헬스 체크
docker compose exec postgres pg_isready -U postgres
```

### 5. 접속

- Frontend: http://localhost:80 (또는 설정한 WEB_PORT)
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### 6. 서비스 중지

```bash
# 서비스 중지 (컨테이너는 유지)
docker compose stop

# 서비스 중지 및 컨테이너 제거
docker compose down
```

## 프로덕션 빌드

### Backend 빌드

```bash
cd backend
npm run build
# dist/ 디렉토리에 빌드 결과물 생성

# 프로덕션 실행
npm start
```

### Frontend 빌드

```bash
cd apps/web
npm run build
# dist/ 디렉토리에 빌드 결과물 생성

# 빌드 결과물 미리보기
npm run preview
```

### 빌드 산출물

빌드 완료 후 생성되는 파일들:

**Backend**
- `backend/dist/` - 컴파일된 TypeScript 코드
- 의존성: `backend/node_modules/`

**Frontend**
- `apps/web/dist/` - 정적 파일 (HTML, CSS, JS)
  - `index.html` - 진입점
  - `assets/` - CSS, JavaScript 번들

## 환경 변수 설정

### Backend 환경 변수

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `NODE_ENV` | 실행 환경 | `development` | ✓ |
| `PORT` | 서버 포트 | `3001` | ✓ |
| `DATABASE_URL` | PostgreSQL 연결 URL | - | ✓ |
| `JWT_SECRET` | JWT 서명 키 | - | ✓ |
| `JWT_EXPIRES_IN` | JWT 만료 시간 | `7d` | ✓ |
| `CORS_ORIGIN` | CORS 허용 origin | `http://localhost` | ✓ |

### Frontend 환경 변수

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` | ✓ |

### 프로덕션 환경 변수 예시

```bash
# .env.production
NODE_ENV=production
PORT=3001
DATABASE_URL=postgres://user:password@db-host:5432/education_platform
JWT_SECRET=very-secure-secret-key-please-change
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com

VITE_API_URL=https://api.yourdomain.com
```

## Docker Compose 환경 변수

루트 디렉토리에 `.env` 파일 생성:

```bash
# Database
DB_USER=postgres
DB_PASSWORD=secure-password
DB_NAME=education_platform
DB_PORT=5432

# Backend
NODE_ENV=production
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost

# Frontend
WEB_PORT=80
```

## 문제 해결

### 1. 데이터베이스 연결 실패

**증상**: Backend가 시작되지 않고 "ECONNREFUSED" 에러 발생

**해결방법**:
```bash
# PostgreSQL이 실행 중인지 확인
sudo service postgresql status

# Docker를 사용하는 경우
docker compose logs postgres

# 데이터베이스 연결 테스트
psql -h localhost -U postgres -d education_platform
```

### 2. 포트 충돌

**증상**: "Port already in use" 에러

**해결방법**:
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3001
lsof -i :5173

# 프로세스 종료
kill -9 <PID>

# Docker의 경우 포트 변경
# .env 파일에서 WEB_PORT 변경
```

### 3. 빌드 실패

**증상**: TypeScript 컴파일 에러

**해결방법**:
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 정리
npm cache clean --force

# TypeScript 버전 확인
npx tsc --version
```

### 4. API 요청 실패 (CORS 에러)

**증상**: 브라우저 콘솔에 CORS 에러 표시

**해결방법**:
```bash
# Backend .env에서 CORS_ORIGIN 확인
CORS_ORIGIN=http://localhost:5173

# 또는 개발 시 모든 origin 허용 (비권장)
CORS_ORIGIN=*
```

### 5. Docker 빌드 느림

**해결방법**:
```bash
# Docker 빌드 캐시 활용
docker compose build

# 캐시 없이 완전히 새로 빌드 (문제 해결 시)
docker compose build --no-cache

# 미사용 이미지 정리
docker image prune -a
```

### 6. 데이터베이스 마이그레이션 필요

**해결방법**:
```bash
# 스키마 재적용
psql education_platform < database/schema.sql

# Docker 볼륨 초기화 (데이터 손실 주의!)
docker compose down -v
docker compose up -d
```

## 성능 최적화

### 프로덕션 빌드 최적화

```bash
# Frontend 빌드 최적화 확인
cd apps/web
npm run build
# dist/ 크기 확인

# Backend 빌드 최적화
cd backend
npm run build
# dist/ 크기 확인
```

### Docker 이미지 크기 최적화

현재 Dockerfile은 multi-stage build를 사용하여 최적화되어 있습니다:
- Builder stage: 빌드 의존성 포함
- Production stage: 실행 파일만 포함

## CI/CD 파이프라인 (향후 계획)

```yaml
# .github/workflows/deploy.yml 예시
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker compose build
      - name: Run tests
        run: npm test
      - name: Deploy to production
        run: |
          # 배포 스크립트 실행
```

## 모니터링 및 로깅

### Docker 로그 확인

```bash
# 모든 서비스 로그
docker compose logs -f

# 마지막 100줄만 확인
docker compose logs --tail=100

# 특정 시간 이후 로그
docker compose logs --since 30m
```

### 애플리케이션 로그

- Backend: Console.log 출력 (stdout)
- Frontend: 브라우저 개발자 도구 콘솔

## 백업 및 복구

### 데이터베이스 백업

```bash
# 로컬 PostgreSQL 백업
pg_dump education_platform > backup.sql

# Docker PostgreSQL 백업
docker compose exec postgres pg_dump -U postgres education_platform > backup.sql
```

### 데이터베이스 복구

```bash
# 로컬 PostgreSQL 복구
psql education_platform < backup.sql

# Docker PostgreSQL 복구
docker compose exec -T postgres psql -U postgres education_platform < backup.sql
```

## 보안 고려사항

1. **JWT Secret**: 프로덕션에서는 강력한 랜덤 문자열 사용
2. **Database Password**: 기본 비밀번호 변경 필수
3. **CORS Origin**: 프로덕션에서는 특정 도메인만 허용
4. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용
5. **환경 변수**: `.env` 파일을 Git에 커밋하지 않기 (.gitignore 확인)

## 추가 리소스

- [Docker Compose 문서](https://docs.docker.com/compose/)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [Express.js 프로덕션 Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
