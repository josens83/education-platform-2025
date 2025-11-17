# 🚀 Education Platform - 배포 가이드

## 목차
1. [프로덕션 배포](#프로덕션-배포)
2. [환경 변수 설정](#환경-변수-설정)
3. [Docker로 실행](#docker로-실행)
4. [테스트 방법](#테스트-방법)
5. [오디오 파일 업로드](#오디오-파일-업로드)
6. [문제 해결](#문제-해결)

---

## 📦 프로덕션 배포

### 1. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 값을 설정합니다:

```bash
cp .env.example .env
```

필수 환경 변수:
```env
# 데이터베이스 (강력한 비밀번호 설정!)
DB_PASSWORD=your_strong_password_here

# JWT (최소 32자 랜덤 문자열)
JWT_SECRET=your_jwt_secret_minimum_32_characters_here

# CORS (실제 도메인으로 변경)
CORS_ORIGIN=https://yourdomain.com

# API URL (실제 도메인으로 변경)
VITE_API_URL=https://api.yourdomain.com
```

### 2. 프로덕션 Docker로 실행

```bash
# 프로덕션 모드로 빌드 및 실행
docker-compose -f docker-compose.prod.yml up -d --build

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 서비스 상태 확인
docker-compose -f docker-compose.prod.yml ps
```

### 3. SSL/HTTPS 설정 (Nginx 사용)

Nginx를 사용하여 SSL을 적용하려면:

```bash
# Nginx 프로파일과 함께 실행
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d
```

Let's Encrypt로 SSL 인증서 발급:
```bash
# Certbot 설치 및 인증서 발급
docker run -it --rm \
  -v ./nginx/ssl:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com
```

---

## 🧪 테스트 방법

### 로컬 개발 환경

```bash
# 개발 모드로 실행
docker-compose up -d

# 백엔드 헬스 체크
curl http://localhost:3001/api/health

# 프론트엔드 접속
open http://localhost
```

### API 테스트 시나리오

#### 1. 회원가입 & 로그인
```bash
# 회원가입
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'

# 로그인
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 2. 책 목록 조회
```bash
curl http://localhost:3001/api/books
```

#### 3. 오디오 파일 업로드 (관리자)
```bash
# JWT 토큰을 받은 후
curl -X POST http://localhost:3001/api/audio/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "audio=@./path/to/audio.mp3" \
  -F "chapter_id=1" \
  -F "audio_type=professional"
```

### 프론트엔드 테스트

웹 브라우저에서 다음 기능들을 확인:

**필수 테스트 항목:**
- [ ] 회원가입 (http://localhost/register)
- [ ] 로그인 (http://localhost/login)
- [ ] 프로필 수정 (http://localhost/profile)
- [ ] 책 목록 조회 (http://localhost/books)
- [ ] 챕터 읽기 (http://localhost/reader/:chapterId)
- [ ] 북마크/하이라이트 저장 및 표시
- [ ] 노트 작성
- [ ] 단어장 추가 (http://localhost/vocabulary)
- [ ] 플래시카드 학습 (http://localhost/flashcards)
- [ ] 오디오 플레이어
- [ ] 퀴즈 풀기
- [ ] 구독 관리

---

## 🎵 오디오 파일 업로드

### 지원 형식
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)
- AAC (.aac)

### 업로드 제한
- 최대 파일 크기: 10MB (기본값)
- 관리자/교사 권한 필요

### API 사용 예제

#### Postman 또는 Insomnia 사용
```
POST http://localhost:3001/api/audio/upload
Headers:
  Authorization: Bearer {your_jwt_token}
Body (form-data):
  audio: (file)
  chapter_id: 1
  audio_type: professional
  transcript: (optional) "Full transcript text..."
```

#### cURL 사용
```bash
curl -X POST http://localhost:3001/api/audio/upload \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "audio=@/path/to/chapter1.mp3" \
  -F "chapter_id=1" \
  -F "audio_type=professional" \
  -F "transcript=Once upon a time..."
```

#### JavaScript (프론트엔드)
```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('chapter_id', chapterId);
formData.append('audio_type', 'professional');

const response = await fetch('http://localhost:3001/api/audio/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## 🔍 문제 해결

### 데이터베이스 연결 오류
```bash
# 데이터베이스 로그 확인
docker-compose logs postgres

# 데이터베이스 재시작
docker-compose restart postgres
```

### 백엔드 오류
```bash
# 백엔드 로그 확인
docker-compose logs backend

# 컨테이너 재빌드
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### 프론트엔드 빌드 오류
```bash
# 웹 앱 로그 확인
docker-compose logs web

# 로컬에서 빌드 테스트
cd apps/web
npm install
npm run build
```

### bcrypt 오류 (Windows에서 Docker 사용 시)
```bash
# 모든 컨테이너 정지 및 삭제
docker-compose down -v

# node_modules 삭제
rm -rf backend/node_modules

# 완전히 새로 빌드
docker-compose build --no-cache
docker-compose up -d
```

### 오디오 파일이 재생되지 않음
1. 파일이 올바르게 업로드되었는지 확인
2. 브라우저 콘솔에서 CORS 오류 확인
3. `/uploads/audio` 경로 권한 확인

---

## 📊 성능 모니터링

### 로그 위치
- 백엔드 로그: `./logs/app.log`
- Nginx 로그: `./nginx/logs/`
- PostgreSQL 로그: Docker 로그

### 헬스 체크
```bash
# API 헬스 체크
curl http://localhost:3001/api/health

# 데이터베이스 연결 테스트
docker exec education-platform-db-prod psql -U postgres -c "SELECT version();"
```

### 백업

#### 데이터베이스 백업
```bash
# 백업 생성
docker exec education-platform-db-prod pg_dump -U postgres education_platform > backup_$(date +%Y%m%d).sql

# 백업 복원
docker exec -i education-platform-db-prod psql -U postgres education_platform < backup_20250101.sql
```

#### 업로드 파일 백업
```bash
# uploads 폴더 백업
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./uploads
```

---

## 🔒 보안 체크리스트

배포 전 반드시 확인:

- [ ] `.env` 파일에 강력한 비밀번호 설정
- [ ] JWT_SECRET을 랜덤 문자열로 변경
- [ ] CORS_ORIGIN을 실제 도메인으로 설정
- [ ] Rate Limiting 활성화 확인
- [ ] SSL/HTTPS 적용
- [ ] 데이터베이스 백업 자동화 설정
- [ ] 관리자 계정 비밀번호 변경
- [ ] `.env` 파일을 `.gitignore`에 추가
- [ ] 프로덕션 환경에서 샘플 데이터 제거

---

## 📞 지원

문제가 발생하면:
1. 로그 파일 확인
2. GitHub Issues에 보고
3. 문서 재검토

Happy Deploying! 🎉
