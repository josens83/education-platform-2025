# 빠른 시작 가이드 🚀

이 가이드는 5분 안에 프로젝트를 로컬에서 실행하는 방법을 안내합니다.

## 전제 조건

- **Docker Desktop** 설치 (https://www.docker.com/products/docker-desktop)
- **Git** 설치

## 1단계: 프로젝트 클론

```bash
git clone <repository-url>
cd education-platform-2025
```

## 2단계: 환경 변수 설정

```bash
# 루트 디렉토리에서
cp .env.example .env

# 백엔드 환경 변수 복사
cp backend/.env.example backend/.env
```

기본 설정을 그대로 사용하면 됩니다. 프로덕션 환경에서는 반드시 비밀키를 변경하세요!

## 3단계: Docker로 전체 스택 실행

```bash
docker-compose up -d
```

이 명령어는 다음을 자동으로 실행합니다:
- PostgreSQL 데이터베이스 (포트 5432)
- Backend API (포트 3001)
- Web App (포트 80)

## 4단계: 서비스 확인

브라우저에서 다음 주소를 열어보세요:

- **웹 앱**: http://localhost
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## 5단계: 테스트 계정 생성

웹 앱에서 회원가입 버튼을 클릭하여 새 계정을 만들 수 있습니다.

## 로그 확인

```bash
# 모든 서비스 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f backend
docker-compose logs -f web
```

## 서비스 중지

```bash
# 서비스 중지
docker-compose stop

# 서비스 중지 및 컨테이너 삭제
docker-compose down

# 데이터베이스 볼륨까지 삭제 (주의!)
docker-compose down -v
```

## 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 포트 확인
sudo lsof -i :3001  # Backend
sudo lsof -i :80    # Web
sudo lsof -i :5432  # Database

# docker-compose.yml에서 포트 변경
```

### 데이터베이스 연결 실패

```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose ps

# PostgreSQL 로그 확인
docker-compose logs postgres

# 데이터베이스 재시작
docker-compose restart postgres
```

## 개발 모드로 실행

Docker 없이 로컬에서 개발하려면:

### 데이터베이스 실행 (Docker)

```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Backend 실행

```bash
cd backend
npm install
npm run dev
```

### Web App 실행

```bash
cd apps/web
npm install
npm run dev
```

### Mobile App 실행

```bash
cd apps/mobile
npm install
npx expo start
```

## 다음 단계

- [README.md](README.md) - 전체 프로젝트 문서
- [deployment/README.md](deployment/README.md) - 배포 가이드
- [API 문서](http://localhost:3001/api) - API 엔드포인트 목록

## 도움이 필요한가요?

문제가 발생하면 GitHub Issues에 등록해주세요.
