# 배포 가이드

영어 교육 플랫폼의 배포 방법을 설명합니다.

## 목차

1. [Docker를 사용한 배포](#docker를-사용한-배포)
2. [개발 환경 설정](#개발-환경-설정)
3. [프로덕션 배포](#프로덕션-배포)
4. [모바일 앱 배포](#모바일-앱-배포)

## Docker를 사용한 배포

### 사전 요구사항

- Docker 20.10+
- Docker Compose 2.0+

### 빠른 시작

1. **환경 변수 설정**

```bash
cp .env.example .env
# .env 파일을 편집하여 환경 변수 설정
```

2. **Docker Compose로 전체 스택 실행**

```bash
# 프로덕션 환경
docker-compose up -d

# 개발 환경
docker-compose -f docker-compose.dev.yml up -d
```

3. **데이터베이스 초기화**

```bash
# 스키마 자동 적용 (초기 실행 시)
docker-compose exec postgres psql -U postgres -d education_platform -f /docker-entrypoint-initdb.d/schema.sql
```

4. **서비스 확인**

- Backend API: http://localhost:3001
- Web App: http://localhost:80
- pgAdmin (개발 환경): http://localhost:5050

### 개별 서비스 실행

```bash
# 백엔드만 실행
docker-compose up -d backend

# 웹 앱만 실행
docker-compose up -d web

# 데이터베이스만 실행
docker-compose up -d postgres
```

## 개발 환경 설정

### 로컬 개발

1. **백엔드 개발**

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

2. **웹 앱 개발**

```bash
cd apps/web
npm install
npm run dev
```

3. **모바일 앱 개발**

```bash
cd apps/mobile
npm install
npx expo start
```

### 개발 데이터베이스

```bash
# 개발용 PostgreSQL + pgAdmin 실행
docker-compose -f docker-compose.dev.yml up -d

# pgAdmin 접속
# URL: http://localhost:5050
# Email: admin@example.com
# Password: admin
```

## 프로덕션 배포

### 클라우드 배포 (AWS, GCP, Azure)

#### 1. Docker 이미지 빌드

```bash
# 백엔드 이미지 빌드
docker build -t education-platform-backend:latest ./backend

# 웹 앱 이미지 빌드
docker build -t education-platform-web:latest ./apps/web
```

#### 2. Docker Registry에 푸시

```bash
# Docker Hub 예시
docker tag education-platform-backend:latest your-username/education-platform-backend:latest
docker push your-username/education-platform-backend:latest

docker tag education-platform-web:latest your-username/education-platform-web:latest
docker push your-username/education-platform-web:latest
```

#### 3. 서버에서 실행

```bash
# 서버에 SSH 접속 후
git clone your-repo
cd education-platform
cp .env.example .env
# .env 파일 수정

docker-compose up -d
```

### 환경 변수 설정

프로덕션 환경에서는 다음 환경 변수를 반드시 변경하세요:

```bash
DB_PASSWORD=secure_password_here
JWT_SECRET=secure_jwt_secret_key
SESSION_SECRET=secure_session_secret
```

### HTTPS 설정 (Nginx + Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### 데이터베이스 백업

```bash
# 백업 생성
docker-compose exec postgres pg_dump -U postgres education_platform > backup.sql

# 백업 복원
docker-compose exec -T postgres psql -U postgres education_platform < backup.sql
```

## 모바일 앱 배포

### iOS 배포 (App Store)

1. **EAS Build 설정**

```bash
cd apps/mobile
npm install -g eas-cli
eas build:configure
```

2. **iOS 빌드**

```bash
eas build --platform ios
```

3. **TestFlight에 업로드**

```bash
eas submit --platform ios
```

### Android 배포 (Google Play)

1. **Android 빌드**

```bash
eas build --platform android
```

2. **Play Console에 업로드**

```bash
eas submit --platform android
```

### Over-The-Air (OTA) 업데이트

```bash
# 업데이트 게시
eas update --branch production --message "버그 수정"
```

## CI/CD

GitHub Actions를 사용한 자동 배포가 설정되어 있습니다.

### Secrets 설정

GitHub 저장소 Settings > Secrets에 다음을 추가:

- `DOCKER_USERNAME`: Docker Hub 사용자명
- `DOCKER_PASSWORD`: Docker Hub 비밀번호
- `DEPLOY_HOST`: 배포 서버 주소
- `DEPLOY_USER`: SSH 사용자명
- `DEPLOY_KEY`: SSH 개인키

### 배포 흐름

1. `main` 브랜치에 푸시
2. 자동으로 테스트 실행
3. Docker 이미지 빌드 및 푸시
4. 프로덕션 서버에 자동 배포

## 모니터링 및 로깅

### 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f web
```

### 상태 확인

```bash
# 컨테이너 상태
docker-compose ps

# 리소스 사용량
docker stats
```

## 문제 해결

### 포트 충돌

```bash
# 기존 프로세스 확인
sudo lsof -i :3001
sudo lsof -i :5432

# 포트 변경은 docker-compose.yml에서
```

### 데이터베이스 연결 실패

```bash
# 데이터베이스 상태 확인
docker-compose exec postgres pg_isready

# 연결 테스트
docker-compose exec postgres psql -U postgres -d education_platform
```

### 컨테이너 재시작

```bash
# 모든 컨테이너 재시작
docker-compose restart

# 특정 컨테이너 재시작
docker-compose restart backend
```

## 보안 체크리스트

- [ ] 환경 변수의 모든 비밀키 변경
- [ ] HTTPS 활성화
- [ ] 방화벽 설정 (필요한 포트만 오픈)
- [ ] 정기적인 데이터베이스 백업
- [ ] 로그 모니터링 설정
- [ ] Rate limiting 설정 확인
- [ ] CORS 설정 확인

## 성능 최적화

### 데이터베이스 최적화

```sql
-- 인덱스 확인
SELECT * FROM pg_indexes WHERE tablename = 'books';

-- 쿼리 성능 분석
EXPLAIN ANALYZE SELECT * FROM books WHERE category_id = 1;
```

### Nginx 캐싱

Nginx 설정에서 정적 파일 캐싱이 활성화되어 있습니다.
추가 최적화는 `deployment/nginx.conf`에서 설정할 수 있습니다.

## 지원

문제가 발생하면 GitHub Issues에 등록해주세요.
