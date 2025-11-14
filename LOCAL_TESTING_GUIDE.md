# 🚀 로컬 검증 빠른 시작 가이드 (Cursor)

Phase 2 기능을 로컬 환경에서 검증하기 위한 단계별 가이드입니다.

## ✅ 사전 요구사항 확인

다음이 설치되어 있는지 확인하세요:

```bash
# Node.js 버전 확인 (18 이상 필요)
node --version

# PostgreSQL 설치 확인
psql --version
```

설치되지 않았다면:
- **Node.js**: https://nodejs.org/ (LTS 버전)
- **PostgreSQL**: https://www.postgresql.org/download/

---

## 📋 빠른 시작 (5분)

### 1단계: 의존성 설치

```bash
# 루트 디렉토리에서
cd /path/to/education-platform-2025

# API Client 패키지
cd packages/api-client
npm install

# Backend
cd ../../backend
npm install

# Frontend
cd ../apps/web
npm install
```

### 2단계: PostgreSQL 준비

#### Option A: 로컬 PostgreSQL 사용 (권장)

```bash
# PostgreSQL 서비스 시작
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# Services에서 PostgreSQL 서비스 시작

# 데이터베이스 생성
createdb education_platform

# 또는 psql로
psql -U postgres
CREATE DATABASE education_platform;
\q

# 스키마 및 샘플 데이터 로드
cd /path/to/education-platform-2025
psql education_platform < database/schema.sql
psql education_platform < database/sample-data.sql
```

#### Option B: Docker PostgreSQL 사용

```bash
# PostgreSQL 컨테이너 실행
docker run --name education-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=education_platform \
  -p 5432:5432 \
  -v $(pwd)/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql \
  -v $(pwd)/database/sample-data.sql:/docker-entrypoint-initdb.d/02-sample-data.sql \
  -d postgres:16-alpine
```

### 3단계: 환경 변수 설정

Backend 디렉토리에 `.env` 파일 생성:

```bash
cd backend

# .env 파일 생성
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/education_platform
JWT_SECRET=your-secret-key-for-development
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
EOF
```

Frontend 디렉토리에도 `.env` 파일 생성 (선택사항):

```bash
cd ../apps/web

# .env 파일 생성
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001
EOF
```

### 4단계: Backend 실행

```bash
# backend 디렉토리에서
cd backend
npm run dev

# 성공 메시지 확인:
# "Server is running on port 3001"
# "Database connected successfully"
```

### 5단계: Frontend 실행 (새 터미널)

```bash
# apps/web 디렉토리에서
cd apps/web
npm run dev

# 브라우저가 자동으로 열리거나
# http://localhost:5173 접속
```

---

## 🧪 Phase 2 기능 테스트

브라우저에서 http://localhost:5173 접속 후:

### 1. 회원가입 & 로그인 ✅
```
1. 회원가입 버튼 클릭
2. 이메일, 비밀번호, 사용자명 입력
3. 회원가입 성공 → 대시보드로 자동 이동
4. 로그아웃 후 다시 로그인 테스트
```

### 2. 프로필 관리 ✅
```
1. 우측 상단 사용자명(👤) 클릭
2. "프로필 수정" 버튼 클릭
3. 이름, 학습 목표 등 입력
4. "저장하기" 클릭
5. 성공 메시지 확인
```

### 3. 책 읽기 & 진도 추적 ✅
```
1. 상단 "책 목록" 클릭
2. 아무 책 선택
3. "읽기 시작" 또는 "이어서 읽기" 클릭
4. 챕터 내용 확인
5. "✓ 챕터 완료" 버튼 클릭
6. 책 상세로 돌아가서 진행률 확인
```

### 4. 대시보드 통계 ✅
```
1. 좌측 상단 로고 또는 "대시보드" 클릭
2. 통계 카드 확인:
   - 읽고 있는 책 (파란색)
   - 완료한 챕터 (초록색)
   - 총 학습 시간 (보라색)
3. "최근 읽은 책" 섹션 확인
```

### 5. 퀴즈 시스템 ✅
```
1. 챕터 읽기 페이지 하단 "퀴즈" 섹션 확인
2. "퀴즈 풀기" 버튼 클릭
3. 문제 풀기:
   - 객관식: 선택지 클릭
   - O/X: 참/거짓 선택
   - 단답형: 답 입력
4. "퀴즈 제출하기" 클릭
5. 결과 페이지에서 점수 확인
6. 오답 해설 확인
```

### 6. 구독 관리 ✅
```
1. 상단 "구독" 메뉴 클릭
2. 구독 플랜 비교
3. "구독하기" 버튼 클릭
4. 확인 다이얼로그에서 "확인"
5. 프로필 페이지에서 구독 상태 확인
6. "구독 취소" 테스트
```

---

## 🐛 문제 해결

### Backend가 시작되지 않음

**증상**: "ECONNREFUSED" 또는 "Database connection failed"

**해결**:
```bash
# PostgreSQL이 실행 중인지 확인
pg_isready

# 데이터베이스가 존재하는지 확인
psql -U postgres -l | grep education_platform

# 데이터베이스 재생성
dropdb education_platform
createdb education_platform
psql education_platform < database/schema.sql
psql education_platform < database/sample-data.sql
```

### Frontend가 Backend에 연결되지 않음

**증상**: API 요청이 실패하거나 CORS 에러

**해결**:
```bash
# Backend가 3001 포트에서 실행 중인지 확인
curl http://localhost:3001/api/health

# Frontend .env 파일 확인
cat apps/web/.env
# VITE_API_URL=http://localhost:3001

# 브라우저 개발자 도구 → Network 탭에서 요청 확인
```

### 포트 충돌

**증상**: "Port 3001 is already in use" 또는 "Port 5173 is already in use"

**해결**:
```bash
# 포트 사용 중인 프로세스 확인 및 종료
# macOS/Linux
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

### 샘플 데이터가 없음

**증상**: 책 목록이 비어있음

**해결**:
```bash
# 샘플 데이터 다시 로드
psql education_platform < database/sample-data.sql

# 또는 psql로 직접 확인
psql education_platform
SELECT * FROM books;
SELECT * FROM chapters LIMIT 5;
\q
```

---

## 📊 테스트 체크리스트

완료된 항목에 체크하세요:

### 기본 기능
- [ ] Backend 서버 실행 성공
- [ ] Frontend 서버 실행 성공
- [ ] 브라우저에서 접속 가능
- [ ] 샘플 데이터 로드 확인

### Step 1: Authentication
- [ ] 회원가입 성공
- [ ] 로그인 성공
- [ ] 로그아웃 성공
- [ ] 비로그인 상태에서 책 목록 접근 가능
- [ ] 챕터 읽기 시도 시 로그인 페이지로 리다이렉트

### Step 2: Profile
- [ ] 프로필 페이지 접근
- [ ] 프로필 정보 수정
- [ ] 학습 목표 설정
- [ ] 저장 성공 메시지

### Step 3: Progress Tracking
- [ ] 챕터 읽기 시 자동 진도 저장
- [ ] 챕터 완료 버튼 동작
- [ ] 책 상세에서 진행률 표시
- [ ] "이어서 읽기" 버튼 동작

### Step 4: Dashboard
- [ ] 통계 카드 표시 (읽는 책, 완료 챕터, 학습 시간)
- [ ] 최근 읽은 책 표시
- [ ] Empty state 표시 (신규 사용자)
- [ ] 빠른 액션 버튼 동작

### Step 5: Quiz System
- [ ] 챕터에서 퀴즈 섹션 표시
- [ ] 퀴즈 페이지 접근
- [ ] 객관식 문제 풀기
- [ ] O/X 문제 풀기
- [ ] 단답형 문제 풀기
- [ ] 퀴즈 제출
- [ ] 결과 페이지 표시
- [ ] 오답 해설 표시

### Step 6: Subscription
- [ ] 구독 페이지 접근
- [ ] 구독 플랜 목록 표시
- [ ] 구독 생성
- [ ] 프로필에서 구독 상태 확인
- [ ] 구독 취소

---

## 🎯 다음 단계

모든 테스트가 완료되면:

1. **버그 리스트 작성** - 발견된 문제들 정리
2. **개선 사항 메모** - UI/UX 개선 아이디어
3. **Phase 3 계획** - 다음 기능 우선순위 결정

---

## 💡 유용한 명령어

```bash
# Backend 로그 확인
cd backend && npm run dev

# Frontend 빌드 테스트
cd apps/web && npm run build

# TypeScript 타입 체크
cd apps/web && npx tsc --noEmit

# 데이터베이스 초기화
psql education_platform < database/schema.sql
psql education_platform < database/sample-data.sql

# 프로세스 모두 종료
# macOS/Linux
pkill -f "node.*backend"
pkill -f "vite"
```

---

## 📞 도움이 필요하면

문제가 발생하면:
1. 브라우저 개발자 도구 콘솔 확인
2. Backend 터미널 로그 확인
3. PostgreSQL 연결 상태 확인
4. 환경 변수 설정 재확인

**행운을 빕니다! 🚀**
