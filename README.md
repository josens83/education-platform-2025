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
│   ├── index.html         # 메인 페이지
│   ├── editor.html        # 에디터 페이지
│   ├── css/               # 스타일시트
│   └── js/
│       ├── state.js       # 상태 관리 (LocalStorage 동기화)
│       ├── api.js         # API 클라이언트
│       ├── router.js      # Hash 기반 라우팅
│       ├── ui-kit.js      # UI 컴포넌트
│       ├── home.js        # 홈 페이지 로직
│       ├── editor.js      # 에디터 핵심 로직 (1500+ lines)
│       └── panels/        # 패널 컴포넌트
│           ├── panel-generate.js    # AI 생성 패널
│           ├── panel-segments.js    # 세그먼트 관리
│           ├── panel-analytics.js   # 분석 대시보드
│           └── panel-history.js     # 히스토리 패널
│
├── backend/               # Node.js Express + PostgreSQL
│   ├── server.js          # Express 서버 (JWT, Rate Limiting, Swagger)
│   ├── database.js        # PostgreSQL 연결 및 ORM
│   ├── package.json       # 의존성 관리
│   └── README.md          # Backend API 문서
│
├── content-backend/       # FastAPI + Supabase + OpenAI
│   ├── main.py            # FastAPI 앱 (AI 생성, 분석)
│   ├── database.py        # SQLAlchemy 모델 (7 tables)
│   ├── requirements.txt   # Python 의존성
│   └── README.md          # Content Backend API 문서
│
├── content-vector/        # ChromaDB Vector Database (RAG)
│   ├── client.py          # ChromaDB 클라이언트 (351 lines)
│   ├── config.py          # 설정 관리
│   ├── requirements.txt   # ChromaDB, OpenAI
│   ├── .env.example       # 환경 변수 예제
│   └── Dockerfile         # Docker 컨테이너화
│
├── content-db/            # Database 스키마 및 마이그레이션
│   └── [DB 관련 파일]
│
└── README.md              # 메인 문서 (이 파일)
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

**로컬 PostgreSQL 사용 시:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/artify_content_db
OPENAI_API_KEY=sk-...
HOST=0.0.0.0
PORT=8000
```

**Supabase 사용 시 (권장):**
```env
# Supabase PostgreSQL 연결
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.joywrnyrvpsaevhiqokw.supabase.co:5432/postgres

# Supabase 프로젝트 정보
# 프로젝트명: artify-content
# Region: Singapore (Southeast Asia)
# 프로젝트 ID: joywrnyrvpsaevhiqokw
# API URL: https://joywrnyrvpsaevhiqokw.supabase.co

OPENAI_API_KEY=sk-...
HOST=0.0.0.0
PORT=8000
```

### 3. 데이터베이스 설정

#### 옵션 1: 로컬 PostgreSQL

로컬 PostgreSQL에 데이터베이스 생성:

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

#### 옵션 2: Supabase (권장)

**Content Backend는 Supabase를 사용합니다:**

1. Supabase 프로젝트: `artify-content`
2. Region: Singapore (Southeast Asia)
3. 프로젝트 ID: `joywrnyrvpsaevhiqokw`
4. Database URL: `postgresql://postgres:[PASSWORD]@db.joywrnyrvpsaevhiqokw.supabase.co:5432/postgres`

Supabase 대시보드에서:
- Database → Connection String 복사
- `.env` 파일의 `DATABASE_URL`에 붙여넣기

**Backend는 로컬 PostgreSQL 또는 별도 클라우드 DB 사용**

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

### 7. Vector Database 설치 및 실행 (선택사항)

ChromaDB 기반 RAG 시스템은 콘텐츠 추천에 사용됩니다:

```bash
cd content-vector

# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정
```

**환경 변수 (.env):**
```env
CHROMA_PERSIST_DIR=./chroma_data
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-ada-002
```

**Python에서 사용:**
```python
from client import get_chroma_client

# ChromaDB 클라이언트 초기화
chroma = get_chroma_client()

# 콘텐츠 추가
chroma.add_creative(
    creative_id=1,
    text="커피숍 마케팅 슬로건",
    metadata={"campaign_id": 1, "type": "text"}
)

# 유사 콘텐츠 검색
results = chroma.search_similar(
    query_text="커피 관련 광고",
    n_results=5
)
```

### 8. 전체 시스템 실행

각각의 터미널에서:

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Content Backend
cd content-backend && uvicorn main:app --reload

# Terminal 3: Frontend
cd frontend && python -m http.server 5173

# Terminal 4 (선택): Vector DB (Python 스크립트로 사용)
# ChromaDB는 content-backend와 연동되어 사용됨
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
- OpenAI API (GPT-3.5-turbo, DALL-E 3)
- Supabase PostgreSQL

**Vector Database (RAG System)**
- ChromaDB 0.5+ (Vector Database)
- OpenAI Embeddings (text-embedding-ada-002)
- DuckDB + Parquet (Storage Backend)
- Pydantic 2.7+ (설정 관리)

## 🎯 상세 시스템 아키텍처

### 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                         사용자 (브라우저)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Frontend SPA   │
                    │  (Vanilla JS)    │
                    │  Port: 5173      │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼───────┐ ┌─────▼──────┐ ┌──────▼──────┐
    │   Backend     │ │  Content   │ │   Vector    │
    │   (Node.js)   │ │  Backend   │ │  Database   │
    │ Port: 3001    │ │  (FastAPI) │ │ (ChromaDB)  │
    └───────┬───────┘ │ Port: 8000 │ └──────┬──────┘
            │         └─────┬──────┘        │
            │               │               │
    ┌───────▼────────┐ ┌───▼────────┐ ┌───▼────────┐
    │  PostgreSQL    │ │  Supabase  │ │  OpenAI    │
    │   (artify_db)  │ │  (7 tables)│ │  Embedding │
    │ Users,Projects │ │ Campaigns  │ │    API     │
    └────────────────┘ │ Creatives  │ └────────────┘
                       │ Gen Jobs   │
                       │ Metrics    │
                       └────┬───────┘
                            │
                    ┌───────▼────────┐
                    │   OpenAI API   │
                    │  GPT-3.5-turbo │
                    │   DALL-E 3     │
                    └────────────────┘
```

### 데이터 흐름 (Data Flow)

#### 1. 사용자 인증 흐름
```
User → Frontend → Backend (JWT) → PostgreSQL
                     ↓
                 Access Token
                     ↓
                 Frontend (저장)
```

#### 2. AI 콘텐츠 생성 흐름
```
User → Frontend → Content Backend → OpenAI API
                        ↓              ↓
                   Supabase DB    (생성 결과)
                  (gen_jobs)           ↓
                        ↓         Vector DB
                   Cost Tracking  (임베딩 저장)
                        ↓              ↓
                   Frontend ←──────────┘
                  (결과 표시)
```

#### 3. 프로젝트 저장 흐름 (Auto-save)
```
Canvas Editor → EditorPage.markAsChanged()
       ↓
  5초 간격 체크
       ↓
  변경사항 감지 → EditorPage.performAutoSave()
       ↓
  Backend API → PostgreSQL (projects.data JSONB)
       ↓
  저장 완료 표시
```

#### 4. 유사 콘텐츠 추천 흐름 (RAG)
```
User Query → Content Backend → Vector DB
                ↓                 ↓
          OpenAI Embedding  → 유사도 검색
                ↓                 ↓
          Top-K 결과 ←────────────┘
                ↓
           Frontend
```

### 주요 컴포넌트 상세

#### Frontend (Vanilla JavaScript SPA)

**핵심 모듈:**
- **state.js** (상태 관리)
  - Observer 패턴 구현
  - LocalStorage 동기화
  - 전역 상태 관리

- **editor.js** (1,500+ lines)
  - Fabric.js 캔버스 제어
  - Undo/Redo (50-state 히스토리)
  - Auto-save (5초 간격)
  - Layer 관리
  - Template 시스템

- **api.js** (API 클라이언트)
  - Fetch API 래퍼
  - JWT 토큰 관리
  - 에러 핸들링

**주요 기능:**
```javascript
// Auto-save 구현
EditorPage = {
  autoSaveTimer: null,
  autoSaveInterval: 5000,
  hasUnsavedChanges: false,

  startAutoSave() {
    setInterval(() => this.performAutoSave(), 5000);
  },

  performAutoSave() {
    if (this.hasUnsavedChanges) {
      // Backend API 호출
    }
  }
}
```

#### Backend (Node.js Express)

**아키텍처:**
```
server.js
  ├── Middleware
  │   ├── CORS (Vercel 도메인 화이트리스트)
  │   ├── Rate Limiter (3 tiers)
  │   └── JWT Auth
  ├── Routes
  │   ├── /api/health
  │   ├── /api/register
  │   ├── /api/login
  │   └── /api/projects (CRUD)
  └── Database Layer (database.js)
      └── PostgreSQL Pool
```

**Rate Limiting 전략:**
1. **General**: 100 req/15분 (전체 API)
2. **Auth**: 5 req/15분 (로그인/회원가입)
3. **Projects**: 30 req/1분 (프로젝트 CRUD)

**Swagger 통합:**
- OpenAPI 3.0 스펙
- URL: http://localhost:3001/api-docs

#### Content Backend (FastAPI)

**아키텍처:**
```
main.py
  ├── CORS Middleware
  ├── Routes
  │   ├── /generate/text (GPT-3.5-turbo)
  │   ├── /generate/image (DALL-E 3)
  │   ├── /segments (CRUD)
  │   ├── /analytics/*
  │   └── /costs/* (비용 추적)
  └── Database Layer (database.py)
      ├── SQLAlchemy ORM
      └── Supabase PostgreSQL
```

**비용 추적 시스템:**
```python
# gen_jobs 테이블에 모든 AI 작업 로깅
job = GenerationJob(
  job_type="text",
  model="gpt-3.5-turbo",
  prompt_tokens=45,
  completion_tokens=32,
  estimated_cost=0.0001065  # USD
)
db.add(job)
db.commit()
```

**자동 문서화:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### Vector Database (ChromaDB)

**아키텍처:**
```
client.py (351 lines)
  ├── ChromaDBClient
  │   ├── Collections
  │   │   ├── copy_texts (텍스트 콘텐츠)
  │   │   ├── images (이미지 메타데이터)
  │   │   └── templates (템플릿)
  │   ├── Methods
  │   │   ├── add_creative()
  │   │   ├── search_similar()
  │   │   ├── delete_creative()
  │   │   ├── batch_add_creatives()
  │   │   └── get_collection_info()
  │   └── Embedding
  │       └── OpenAI text-embedding-ada-002
  └── Storage: DuckDB + Parquet
```

**사용 예시:**
```python
# 콘텐츠 추가 및 임베딩 생성
chroma.add_creative(
  creative_id=1,
  text="여름 세일 광고 문구",
  metadata={
    "campaign_id": 1,
    "type": "text",
    "tone": "친근한"
  }
)

# RAG 기반 유사 콘텐츠 검색
results = chroma.search_similar(
  query_text="여름 프로모션",
  n_results=5
)
# → Top 5 유사 콘텐츠 반환
```

**현재 상태:**
- ✅ 코드 완성 (351 lines)
- ✅ ChromaDB 연결 로직 구현
- ✅ OpenAI 임베딩 통합
- ⏳ Content Backend 연동 대기 중
- ⏳ RAG 기반 추천 시스템 구현 예정

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

#### Content Backend Database (Supabase - artify_content)

**총 7개 테이블 + 6개 인덱스**

##### 정적 데이터

**users** (사용자)
- id (INTEGER PRIMARY KEY)
- username (VARCHAR UNIQUE)
- email (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- created_at (TIMESTAMP DEFAULT NOW())
- updated_at (TIMESTAMP DEFAULT NOW())

**campaigns** (캠페인)
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER FK → users.id)
- name (VARCHAR NOT NULL)
- description (TEXT)
- status (VARCHAR) - 'draft', 'active', 'paused', 'completed'
- budget (FLOAT)
- start_date (TIMESTAMP)
- end_date (TIMESTAMP)
- created_at (TIMESTAMP DEFAULT NOW())
- updated_at (TIMESTAMP DEFAULT NOW())

**segments** (타겟 세그먼트)
- id (INTEGER PRIMARY KEY)
- name (VARCHAR NOT NULL)
- description (TEXT)
- criteria (TEXT) - JSON 형식 기준
- created_at (TIMESTAMP DEFAULT NOW())
- updated_at (TIMESTAMP DEFAULT NOW())

##### 동적 데이터

**creatives** (생성된 콘텐츠)
- id (INTEGER PRIMARY KEY)
- campaign_id (INTEGER FK → campaigns.id)
- content_type (VARCHAR) - 'text', 'image', 'video'
- prompt (TEXT NOT NULL)
- result (TEXT NOT NULL)
- model (VARCHAR) - 'gpt-3.5-turbo', 'dall-e-3'
- status (VARCHAR) - 'pending', 'completed', 'failed'
- created_at (TIMESTAMP DEFAULT NOW())

**gen_jobs** (AI 생성 작업 로그 - 비용 추적)
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER FK → users.id)
- job_type (VARCHAR NOT NULL) - 'text', 'image'
- model (VARCHAR NOT NULL)
- prompt (TEXT NOT NULL)
- prompt_tokens (INTEGER)
- completion_tokens (INTEGER)
- total_tokens (INTEGER)
- estimated_cost (FLOAT DEFAULT 0.0) - USD
- status (VARCHAR DEFAULT 'completed') - 'pending', 'completed', 'failed'
- error_message (TEXT)
- created_at (TIMESTAMP DEFAULT NOW())
- completed_at (TIMESTAMP)

**metrics** (성과 데이터)
- id (INTEGER PRIMARY KEY)
- campaign_id (INTEGER FK → campaigns.id)
- metric_name (VARCHAR NOT NULL) - 'impressions', 'clicks', 'conversions'
- metric_value (FLOAT NOT NULL)
- timestamp (TIMESTAMP DEFAULT NOW())

**feedbacks** (피드백)
- id (INTEGER PRIMARY KEY)
- creative_id (INTEGER FK → creatives.id)
- user_id (INTEGER FK → users.id)
- rating (INTEGER) - 1-5
- comment (TEXT)
- created_at (TIMESTAMP DEFAULT NOW())

##### 인덱스 (6개)

1. `idx_campaigns_user_id` ON campaigns(user_id)
2. `idx_creatives_campaign_id` ON creatives(campaign_id)
3. `idx_gen_jobs_user_id` ON gen_jobs(user_id)
4. `idx_gen_jobs_created_at` ON gen_jobs(created_at)
5. `idx_metrics_campaign_id` ON metrics(campaign_id)
6. `idx_feedbacks_creative_id` ON feedbacks(creative_id)

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

### ✅ 완료된 기능

#### 1. 데이터 영속화 (PostgreSQL)
- **Backend**: PostgreSQL 완전 통합 ✅
  - Connection Pool 사용
  - users, projects 테이블 자동 생성
  - JSONB로 캔버스 데이터 저장
  - 인덱스 최적화 (user_id)
  - 인메모리 데이터 없음 (완전한 영속성)

- **Content Backend**: Supabase PostgreSQL 통합 ✅
  - SQLAlchemy ORM
  - 7개 테이블 (users, campaigns, segments, creatives, gen_jobs, metrics, feedbacks)
  - 6개 인덱스로 성능 최적화

#### 2. 캔버스 에디터 (Fabric.js 5.3.0) - **완전 구현 ✅**
- **기본 기능**
  - ✅ 선택/이동/크기조정/회전
  - ✅ 텍스트 추가 및 편집
  - ✅ 이미지 업로드 (Base64, 자동 스케일링)
  - ✅ 도형: 사각형, 원, 삼각형, 별, 다각형, 선

- **고급 기능**
  - ✅ Undo/Redo (50-state 히스토리)
  - ✅ 레이어 관리 패널 (순서 변경, 선택, 삭제)
  - ✅ 자동 저장 (5초 간격, 변경 감지)
  - ✅ 템플릿 시스템 (소셜 미디어, 배너, 포스터)
  - ✅ 텍스트 스타일링 (폰트, 크기, 굵기, 기울임, 밑줄, 정렬)
  - ✅ 속성 패널 (실시간 업데이트)

- **내보내기**
  - ✅ PNG (고해상도 2x)
  - ✅ JPG (90% 품질)
  - ✅ PDF (A4 자동 조정)
  - ✅ JSON (프로젝트 데이터)

- **AI 통합**
  - ✅ 우측 패널에 AI 생성 패널 내장
  - ✅ Content Backend와 연동
  - ✅ 생성된 콘텐츠 캔버스에 직접 추가

#### 3. AI 콘텐츠 생성
- ✅ OpenAI GPT-3.5-turbo (텍스트)
- ✅ OpenAI DALL-E 3 (이미지)
- ✅ 비용 추적 시스템 (gen_jobs 테이블)
- ✅ 토큰 카운팅 및 실시간 비용 계산

#### 4. Vector Database (ChromaDB)
- ✅ 코드 완성 (351 lines)
- ✅ 3개 컬렉션 (copy_texts, images, templates)
- ✅ OpenAI 임베딩 통합
- ⏳ Content Backend 연동 대기

#### 5. 보안 및 성능
- ✅ JWT 인증
- ✅ bcrypt 비밀번호 해싱
- ✅ Rate Limiting (3단계)
- ✅ CORS 설정
- ✅ Swagger API 문서

### 🔄 진행 중

#### Vector DB ↔ Content Backend 연동
- ChromaDB 클라이언트 준비 완료
- Content Backend에 RAG 엔드포인트 추가 필요
- 유사 콘텐츠 추천 시스템 구현 예정

### ⚠️ 개선 필요 사항 (Must-Have)

#### 1. 데이터베이스 마이그레이션 관리

**현재 상태:**
- Backend: CREATE TABLE IF NOT EXISTS 사용 (수동)
- Content Backend: SQLAlchemy ORM 자동 생성

**개선 필요:**
- ❌ Alembic 마이그레이션 도구 미사용
- ❌ 스키마 버전 관리 없음
- ❌ 롤백 전략 없음

**권장 조치:**
```bash
# Content Backend에 Alembic 추가
cd content-backend
pip install alembic
alembic init migrations

# 첫 마이그레이션 생성
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

#### 2. 데이터베이스 통합 전략

**현재 상태:**
- Backend DB: PostgreSQL (users, projects)
- Content Backend DB: Supabase (campaigns, creatives, gen_jobs, metrics, feedbacks, segments)
- **단일 소스 오브 트루스 미확정**

**권장 전략 (2가지 옵션):**

**옵션 A: Supabase로 완전 통합 (권장)**
```
모든 데이터 → Supabase PostgreSQL
- users, projects, campaigns, creatives, segments, gen_jobs, metrics, feedbacks
- Backend와 Content Backend 모두 Supabase 연결
- 단일 데이터베이스로 조인 쿼리 가능
- 통합 백업 및 복제
```

**옵션 B: 도메인 분리 (현재 유지)**
```
Backend DB (PostgreSQL)
- users, projects (프로젝트 관리 도메인)

Content Backend DB (Supabase)
- campaigns, creatives, segments, gen_jobs, metrics, feedbacks (콘텐츠 도메인)

장점: 도메인 분리, 독립적 확장
단점: 데이터 동기화 필요, 복잡도 증가
```

#### 3. 백업 및 재해 복구 전략

**현재 상태:**
- ❌ 자동 백업 설정 없음
- ❌ 백업 복원 절차 없음
- ❌ 재해 복구 계획 없음

**권장 조치:**

**Supabase 자동 백업:**
```
1. Supabase Dashboard → Database → Backups
2. Point-in-Time Recovery (PITR) 활성화
3. 일일 자동 백업 설정
4. 백업 보관 기간: 7-30일
```

**로컬 PostgreSQL 백업:**
```bash
# 일일 백업 스크립트
pg_dump -U postgres artify_db > backup_$(date +%Y%m%d).sql

# Cron 작업으로 자동화
0 2 * * * /path/to/backup.sh
```

**백업 복원 테스트:**
```bash
# 테스트 복원 (월 1회)
psql -U postgres artify_test < backup.sql
```

#### 4. 정적 vs 동적 데이터 분리

**현재 상태:**
- 모든 데이터가 PostgreSQL/Supabase에 저장
- 캐시 계층 없음
- 정적 데이터와 동적 데이터 구분 없음

**권장 아키텍처:**

```
┌─────────────────────────────────────────────┐
│          Application Layer                   │
└───────┬─────────────────────────┬───────────┘
        │                         │
┌───────▼─────────┐     ┌────────▼──────────┐
│  정적 데이터     │     │   동적 데이터      │
│  (Redis Cache)  │     │  (PostgreSQL)     │
└─────────────────┘     └───────────────────┘
        │
┌───────▼─────────┐
│  PostgreSQL     │
│  (Source of     │
│   Truth)        │
└─────────────────┘
```

**정적 데이터 (캐시 우선):**
- 템플릿 메타데이터
- 브랜드 가이드라인
- 색상 팔레트
- 폰트 목록
- 세그먼트 기준
- 캠페인 설정

**동적 데이터 (실시간 처리):**
- 사용자 생성 콘텐츠
- AI 생성 요청/결과
- gen_jobs 로그
- 실시간 메트릭
- 사용자 피드백

**Redis 통합 예시:**
```javascript
// Backend에 Redis 추가
const redis = require('redis');
const client = redis.createClient();

// 템플릿 조회 (캐시 우선)
async function getTemplate(id) {
  // 1. Redis 캐시 확인
  const cached = await client.get(`template:${id}`);
  if (cached) return JSON.parse(cached);

  // 2. PostgreSQL에서 조회
  const template = await db.query('SELECT * FROM templates WHERE id = $1', [id]);

  // 3. Redis에 캐싱 (TTL: 1시간)
  await client.setex(`template:${id}`, 3600, JSON.stringify(template));

  return template;
}
```

**Content Backend에 Redis 추가:**
```python
# requirements.txt에 추가
redis>=5.0.0

# main.py
from redis import Redis

redis_client = Redis(host='localhost', port=6379, decode_responses=True)

@app.get("/segments")
async def get_segments(db: Session = Depends(get_db)):
    # 캐시 확인
    cached = redis_client.get("segments:all")
    if cached:
        return json.loads(cached)

    # DB 조회
    segments = db.query(Segment).all()

    # 캐싱 (5분)
    redis_client.setex("segments:all", 300, json.dumps(segments))

    return segments
```

#### 5. 조회 우선순위 및 TTL 전략

**계층별 우선순위:**
```
1. 메모리 캐시 (In-Memory) - 초 단위 TTL
2. Redis 캐시 - 분~시간 단위 TTL
3. PostgreSQL - Source of Truth
```

**TTL 가이드라인:**
```
템플릿:     24시간 (거의 변하지 않음)
세그먼트:   1시간 (가끔 업데이트)
캠페인 설정: 10분 (자주 변경 가능)
실시간 메트릭: 캐시 안 함 (항상 최신 데이터)
```

## 🐛 알려진 이슈

### 중요도: 높음
- **Alembic 마이그레이션 부재**: 스키마 변경 추적 불가
- **백업 전략 미구축**: 데이터 손실 위험
- **캐시 계층 없음**: 정적 데이터 매번 DB 조회

### 중요도: 중간
- **Vector DB 미연동**: RAG 추천 시스템 사용 불가
- **데이터베이스 통합 미결정**: 2개 DB 운영 중

## 🚀 향후 로드맵

### Phase 1: 데이터 아키텍처 개선 (우선순위: 높음)
1. Alembic 마이그레이션 도구 도입
2. 자동 백업 설정 (Supabase PITR + 로컬 백업)
3. Redis 캐시 계층 추가
4. 정적/동적 데이터 분리 구현

### Phase 2: Vector DB 통합 (우선순위: 중간)
1. Content Backend에 RAG 엔드포인트 추가
2. ChromaDB 연동
3. 유사 콘텐츠 추천 시스템 구현

### Phase 3: 성능 최적화 (우선순위: 낮음)
1. CDN 통합 (이미지 캐싱)
2. 쿼리 최적화
3. 연결 풀 튜닝

## 📄 라이선스

MIT License

## 👥 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

## 📧 문의

프로젝트 관련 문의사항이 있으시면 Issue를 등록해주세요.

---

**Made with ❤️ by Artify Team**
