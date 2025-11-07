# Artify Platform 🎨

AI 기반 마케팅 콘텐츠 생성 플랫폼

Artify는 AI를 활용하여 마케팅 캠페인을 위한 비주얼 콘텐츠를 빠르고 쉽게 생성할 수 있는 통합 플랫폼입니다.

## 🌟 주요 기능

- **🎨 비주얼 에디터**: Fabric.js 기반의 강력한 캔버스 에디터
  - 도형, 텍스트, 이미지 추가 및 편집
  - Undo/Redo 기능
  - 레이어 관리
  - 템플릿 시스템 (소셜 미디어, 배너, 포스터)

- **✨ AI 콘텐츠 생성**: OpenAI API 통합
  - GPT-3.5-turbo로 텍스트 생성
  - DALL-E 3로 이미지 생성
  - 비용 추적 시스템

- **💾 자동 저장**: 5초 간격 자동 저장
  - 실시간 변경 감지
  - 시각적 저장 상태 표시

- **📤 다중 포맷 내보내기**
  - PNG (고해상도)
  - JPG (압축)
  - PDF (A4 자동 조정)
  - JSON (프로젝트 데이터)

- **🎯 세그먼트 관리**: 타겟 고객 세그먼트 생성
- **📊 분석 대시보드**: 캠페인 성과 분석
- **🔐 사용자 인증**: JWT 기반 인증 시스템
- **⚡ Rate Limiting**: API 남용 방지

## 🏗️ 프로젝트 구조

```
artify-platform/
├── frontend/              # Vanilla JavaScript SPA
│   ├── index.html
│   ├── editor.html
│   ├── css/
│   └── js/
│       ├── state.js      # 상태 관리
│       ├── api.js        # API 클라이언트
│       ├── router.js     # 라우팅
│       ├── home.js       # 홈 페이지
│       ├── editor.js     # 에디터 (1500+ lines)
│       └── panels/       # 패널 컴포넌트
│
├── backend/               # Node.js Express + PostgreSQL
│   ├── server.js         # Express 서버
│   ├── database.js       # PostgreSQL ORM
│   └── package.json
│
├── content-backend/       # FastAPI + PostgreSQL
│   ├── main.py           # FastAPI 앱
│   ├── database.py       # SQLAlchemy 모델
│   └── requirements.txt
│
└── README.md             # 이 파일
```

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 16+
- Python 3.8+
- PostgreSQL 12+
- OpenAI API Key (선택사항)

### 1. 저장소 클론

```bash
git clone <repository-url>
cd artify-platform
```

### 2. 환경 변수 설정

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

`.env` 파일 편집:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://username:password@localhost:5432/artify_db
```

#### Content Backend (.env)

```bash
cd ../content-backend
cp .env.example .env
```

`.env` 파일 편집:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/artify_content_db
OPENAI_API_KEY=sk-...
HOST=0.0.0.0
PORT=8000
```

### 3. 데이터베이스 설정

PostgreSQL에 데이터베이스 생성:

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE artify_db;
CREATE DATABASE artify_content_db;

# 사용자 생성 및 권한 부여 (선택사항)
CREATE USER artify_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE artify_db TO artify_user;
GRANT ALL PRIVILEGES ON DATABASE artify_content_db TO artify_user;
```

### 4. Backend 설치 및 실행

```bash
cd backend

# 의존성 설치
npm install

# 서버 실행
npm start
```

서버가 http://localhost:3001 에서 실행됩니다.

#### 주요 엔드포인트

- `GET /api/health` - 헬스 체크
- `POST /api/register` - 회원가입
- `POST /api/login` - 로그인
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/:id` - 프로젝트 조회
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제

### 5. Content Backend 설치 및 실행

```bash
cd ../content-backend

# 가상환경 생성 (권장)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

서버가 http://localhost:8000 에서 실행됩니다.

#### 주요 엔드포인트

- `GET /` - API 정보
- `POST /generate/text` - AI 텍스트 생성
- `POST /generate/image` - AI 이미지 생성
- `GET /segments` - 세그먼트 목록
- `POST /segments` - 세그먼트 생성
- `GET /analytics/overview` - 분석 개요
- `GET /costs/summary` - 비용 요약
- `GET /costs/history` - 비용 내역

**API 문서**: http://localhost:8000/docs (Swagger UI)

### 6. Frontend 실행

프론트엔드는 정적 파일이므로 간단한 HTTP 서버로 실행할 수 있습니다:

```bash
cd ../frontend

# Python 내장 서버 사용
python -m http.server 5173

# 또는 Node.js http-server 사용
npx http-server -p 5173
```

브라우저에서 http://localhost:5173 접속

### 7. 전체 시스템 실행

각각의 터미널에서:

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Content Backend
cd content-backend && uvicorn main:app --reload

# Terminal 3: Frontend
cd frontend && python -m http.server 5173
```

## 📚 API 문서

### Node.js Backend

API 문서: [backend/README.md](./backend/README.md)

Swagger UI는 추가 예정입니다.

### FastAPI Content Backend

**자동 생성 API 문서**가 제공됩니다:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔧 개발

### 기술 스택

**Frontend**
- Vanilla JavaScript (ES6+)
- Fabric.js 5.3.0 (캔버스 에디터)
- jsPDF 2.5.1 (PDF 내보내기)
- Chart.js 4.4.0 (차트)

**Backend**
- Node.js
- Express 4.18
- PostgreSQL (pg 8.11)
- JWT 인증 (jsonwebtoken 9.0)
- bcrypt 5.1 (비밀번호 해싱)
- express-rate-limit 7.1 (Rate Limiting)

**Content Backend**
- Python 3.8+
- FastAPI
- SQLAlchemy (ORM)
- OpenAI API
- PostgreSQL

### 데이터베이스 스키마

#### Backend Database (artify_db)

**users**
- id (SERIAL PRIMARY KEY)
- username (VARCHAR UNIQUE)
- email (VARCHAR UNIQUE)
- password (VARCHAR - hashed)
- created_at (TIMESTAMP)

**projects**
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK)
- name (VARCHAR)
- data (JSONB) - 캔버스 데이터
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### Content Backend Database (artify_content_db)

**segments**
- id (INTEGER PRIMARY KEY)
- name (VARCHAR)
- description (TEXT)
- criteria (TEXT - JSON)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**generated_content**
- id (INTEGER PRIMARY KEY)
- content_type (VARCHAR) - 'text' or 'image'
- prompt (TEXT)
- result (TEXT)
- model (VARCHAR)
- created_at (TIMESTAMP)

**gen_jobs** (비용 추적)
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- job_type (VARCHAR)
- model (VARCHAR)
- prompt (TEXT)
- prompt_tokens (INTEGER)
- completion_tokens (INTEGER)
- total_tokens (INTEGER)
- estimated_cost (FLOAT)
- status (VARCHAR)
- error_message (TEXT)
- created_at (TIMESTAMP)
- completed_at (TIMESTAMP)

**metrics**
- id (INTEGER PRIMARY KEY)
- project_id (INTEGER)
- metric_name (VARCHAR)
- metric_value (FLOAT)
- timestamp (TIMESTAMP)

## 🔐 보안

- JWT 기반 인증
- bcrypt 비밀번호 해싱 (10 rounds)
- Rate Limiting:
  - General: 100 req/15분
  - Auth: 5 req/15분
  - Project: 30 req/1분
- CORS 설정 (Vercel 도메인 화이트리스트)
- 환경변수로 민감 정보 관리

## 🧪 테스트

### Backend 헬스 체크

```bash
curl http://localhost:3001/api/health
```

### Content Backend 헬스 체크

```bash
curl http://localhost:8000/
```

### 텍스트 생성 테스트

```bash
curl -X POST http://localhost:8000/generate/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a marketing slogan for a coffee shop", "max_tokens": 50}'
```

## 🚢 배포

### Frontend 배포 (Vercel)

```bash
cd frontend
vercel
```

### Backend 배포 (Render/Railway)

1. PostgreSQL 데이터베이스 생성
2. 환경 변수 설정
3. Git 연결 및 자동 배포

### Content Backend 배포 (Render)

1. PostgreSQL 데이터베이스 생성
2. 환경 변수 설정 (특히 OPENAI_API_KEY)
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📝 주요 기능 구현 상태

✅ **완료된 기능**
- Fabric.js 캔버스 에디터
- PostgreSQL 데이터 지속성
- Undo/Redo (50 히스토리)
- 템플릿 시스템 (3개)
- 다양한 도형 (사각형, 원, 삼각형, 별, 다각형, 선)
- 텍스트 스타일링 (폰트, 크기, 굵기, 기울임, 밑줄, 정렬)
- 레이어 관리 패널
- 이미지 업로드 (Base64)
- 자동 저장 (5초 간격)
- 다중 포맷 내보내기 (PNG, JPG, PDF, JSON)
- 검색 기능
- OpenAI API 통합
- Rate Limiting
- 비용 추적 시스템

## 🐛 알려진 이슈

없음

## 📄 라이선스

MIT License

## 👥 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

## 📧 문의

프로젝트 관련 문의사항이 있으시면 Issue를 등록해주세요.

---

**Made with ❤️ by Artify Team**
