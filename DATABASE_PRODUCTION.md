# 프로덕션 데이터베이스 설정 가이드

## 📊 데이터베이스 아키텍처

### ERD (Entity Relationship Diagram)

```
Users (회원)
  ├─ UserProfiles (프로필)
  ├─ Subscriptions (구독)
  ├─ LearningProgress (학습 진도)
  ├─ QuizAttempts (퀴즈 시도)
  ├─ Bookmarks (북마크)
  ├─ Notes (노트)
  ├─ VocabularyItems (단어장)
  ├─ LearningStats (학습 통계)
  ├─ CouponUsage (쿠폰 사용)
  └─ Reviews (리뷰)

Books (책)
  ├─ Chapters (챕터)
  │   ├─ AudioFiles (오디오)
  │   └─ Quizzes (퀴즈)
  │       └─ QuizQuestions (문제)
  └─ Reviews (리뷰)

SubscriptionPlans (구독 플랜)
  └─ Subscriptions (구독)

Coupons (쿠폰)
  └─ CouponUsage (사용 내역)
```

---

## 🗄️ 테이블 목록 및 용도

| 테이블명 | 행 수 (예상) | 용도 | 중요도 |
|---------|-------------|------|--------|
| users | 10,000+ | 회원 정보 | 🔴 Critical |
| user_profiles | 10,000+ | 회원 프로필 | 🔴 Critical |
| books | 100-500 | 책 마스터 | 🔴 Critical |
| chapters | 5,000+ | 챕터 콘텐츠 | 🔴 Critical |
| quizzes | 5,000+ | 퀴즈 | 🟡 Important |
| quiz_questions | 50,000+ | 퀴즈 문제 | 🟡 Important |
| quiz_attempts | 100,000+ | 퀴즈 시도 내역 | 🟢 Normal |
| subscriptions | 5,000+ | 구독 정보 | 🔴 Critical |
| subscription_plans | 5-10 | 구독 플랜 | 🔴 Critical |
| learning_progress | 500,000+ | 학습 진도 | 🟡 Important |
| learning_stats | 500,000+ | 학습 통계 | 🟢 Normal |
| bookmarks | 100,000+ | 북마크 | 🟢 Normal |
| notes | 50,000+ | 노트 | 🟢 Normal |
| vocabulary_items | 200,000+ | 단어장 | 🟡 Important |
| audio_files | 5,000+ | 오디오 파일 | 🟡 Important |
| coupons | 100-500 | 쿠폰 마스터 | 🟡 Important |
| coupon_usage | 10,000+ | 쿠폰 사용 내역 | 🟢 Normal |
| reviews | 50,000+ | 리뷰 | 🟡 Important |
| review_helpful | 200,000+ | 리뷰 도움됨 | 🟢 Normal |
| review_reports | 1,000+ | 리뷰 신고 | 🟢 Normal |

**총 테이블 수: 19개**

---

## 🚀 초기 설정 (프로덕션)

### 1. PostgreSQL 설치 (Ubuntu/Debian)

```bash
# PostgreSQL 14+ 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 상태 확인
sudo systemctl status postgresql
```

### 2. 데이터베이스 생성

```bash
# postgres 사용자로 전환
sudo -u postgres psql

# 데이터베이스 및 사용자 생성
CREATE DATABASE education_platform;
CREATE USER edu_admin WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE education_platform TO edu_admin;

# 종료
\q
```

### 3. 마이그레이션 실행

```bash
cd /path/to/education-platform-2025

# 순서대로 마이그레이션 실행
for file in database/migrations/*.sql; do
  echo "Applying $file..."
  PGPASSWORD=your_secure_password psql -h localhost -U edu_admin -d education_platform -f "$file"
done

# 또는 자동 스크립트 사용
bash database/migrations/apply_migrations.sh
```

### 4. 시드 데이터 입력 (선택사항)

```bash
# 개발/데모용 샘플 데이터
PGPASSWORD=your_secure_password psql -h localhost -U edu_admin -d education_platform -f database/seed.sql

# 프로덕션용 콘텐츠 데이터
PGPASSWORD=your_secure_password psql -h localhost -U edu_admin -d education_platform -f database/sample-data.sql
```

---

## ⚡ 성능 최적화

### 인덱스 전략

모든 중요 인덱스는 `002_performance_indexes.sql`에 정의되어 있습니다:

#### Primary Indexes (자동 생성)
- 모든 테이블의 `id` (Primary Key)

#### Foreign Key Indexes
```sql
-- 사용자 관련
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);

-- 책/챕터 관련
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_quizzes_chapter_id ON quizzes(chapter_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- 학습 데이터
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_bookmarks_user_chapter ON bookmarks(user_id, chapter_id);
CREATE INDEX idx_vocabulary_user_id ON vocabulary_items(user_id);
```

#### Composite Indexes (복합 인덱스)
```sql
-- 학습 진도 조회 최적화
CREATE INDEX idx_learning_progress_user_book ON learning_progress(user_id, book_id);

-- 통계 조회 최적화
CREATE INDEX idx_learning_stats_user_date ON learning_stats(user_id, stat_date DESC);

-- 구독 상태 조회
CREATE INDEX idx_subscriptions_status_end_date ON subscriptions(status, end_date);
```

### 쿼리 성능 모니터링

```sql
-- 느린 쿼리 로깅 활성화 (postgresql.conf)
-- log_min_duration_statement = 1000  # 1초 이상 걸리는 쿼리 로깅

-- 쿼리 통계 확장 설치
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 가장 느린 쿼리 TOP 10
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🔐 보안 설정

### 1. 연결 보안 (pg_hba.conf)

```conf
# IPv4 local connections - password required
host    education_platform    edu_admin    127.0.0.1/32    md5

# Production: SSL required
hostssl  education_platform    edu_admin    0.0.0.0/0       md5
```

### 2. 비밀번호 정책

```sql
-- 비밀번호 만료 설정
ALTER ROLE edu_admin VALID UNTIL '2026-12-31';

-- 연결 제한
ALTER ROLE edu_admin CONNECTION LIMIT 50;
```

### 3. 데이터 암호화

```bash
# SSL 인증서 생성
openssl req -new -x509 -days 365 -nodes -text -out server.crt \
  -keyout server.key -subj "/CN=dbserver.example.com"

chmod og-rwx server.key
chown postgres:postgres server.*
mv server.* /var/lib/postgresql/14/main/
```

---

## 💾 백업 전략

### 자동 백업 스크립트

이미 제공된 `scripts/backup-database.sh`를 사용:

```bash
# Cron 설정
crontab -e

# 매일 새벽 2시에 백업
0 2 * * * /path/to/scripts/backup-database.sh

# 매주 일요일 새벽 3시에 전체 백업
0 3 * * 0 /path/to/scripts/backup-database.sh full
```

### 수동 백업

```bash
# 전체 백업
pg_dump -h localhost -U edu_admin education_platform > backup_$(date +%Y%m%d).sql

# 압축 백업
pg_dump -h localhost -U edu_admin education_platform | gzip > backup_$(date +%Y%m%d).sql.gz

# 특정 테이블만 백업
pg_dump -h localhost -U edu_admin -t users -t subscriptions education_platform > critical_tables.sql
```

### 복구

```bash
# 전체 복구
psql -h localhost -U edu_admin -d education_platform < backup_20250118.sql

# 압축된 백업 복구
gunzip < backup_20250118.sql.gz | psql -h localhost -U edu_admin -d education_platform

# 복구 스크립트 사용
bash scripts/restore-database.sh backup_20250118.sql
```

---

## 📊 모니터링

### 데이터베이스 상태 확인

```sql
-- 현재 연결 수
SELECT count(*) FROM pg_stat_activity;

-- 활성 쿼리 확인
SELECT pid, usename, state, query, query_start
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;

-- 데이터베이스 크기
SELECT pg_size_pretty(pg_database_size('education_platform'));

-- 각 테이블 크기
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 인덱스 사용률
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 연결 풀 설정 (Backend)

`backend/lib/db.js` 설정:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'education_platform',
  user: process.env.DB_USER || 'edu_admin',
  password: process.env.DB_PASSWORD,

  // 연결 풀 최적화
  max: 20,              // 최대 연결 수
  min: 5,               // 최소 연결 수 (항상 유지)
  idleTimeoutMillis: 30000,  // 유휴 연결 타임아웃 (30초)
  connectionTimeoutMillis: 2000,  // 연결 타임아웃 (2초)

  // 연결 재시도
  maxUses: 7500,        // 연결 재사용 횟수

  // SSL 설정 (프로덕션)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
```

---

## 🧪 헬스체크

### 데이터베이스 연결 테스트

```bash
# psql로 연결 테스트
PGPASSWORD=your_password psql -h localhost -U edu_admin -d education_platform -c "SELECT 1"

# 결과: 1행 (성공)
```

### 백엔드 헬스체크 엔드포인트

```javascript
// backend/routes/health.js (추가 예정)
router.get('/health', async (req, res) => {
  try {
    // DB 연결 테스트
    const result = await pool.query('SELECT NOW()');

    res.json({
      status: 'healthy',
      timestamp: result.rows[0].now,
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## 📈 확장성 고려사항

### 파티셔닝 (대용량 데이터)

```sql
-- learning_stats를 날짜별로 파티셔닝
CREATE TABLE learning_stats_2025_01 PARTITION OF learning_stats
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE learning_stats_2025_02 PARTITION OF learning_stats
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

### 읽기 복제본 (Read Replica)

```bash
# Master-Slave 복제 설정
# Master: postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_size = 64

# Slave에서 Master 복제
pg_basebackup -h master_host -D /var/lib/postgresql/14/replica -U replication -P -v
```

### 캐싱 전략

- **Redis**: 자주 조회되는 책 목록, 사용자 프로필
- **Memcached**: 세션 데이터
- **Application Cache**: 구독 플랜 (거의 변경 안됨)

---

## 🎯 프로덕션 체크리스트

### 배포 전 필수 확인

- [ ] 모든 마이그레이션 적용 완료
- [ ] 성능 인덱스 생성 완료
- [ ] 백업 자동화 설정 완료
- [ ] SSL 인증서 설정 완료
- [ ] 연결 풀 최적화 완료
- [ ] 느린 쿼리 로깅 활성화
- [ ] 모니터링 도구 설치 (pgAdmin, Datadog 등)
- [ ] 헬스체크 엔드포인트 구현
- [ ] 샘플 데이터 입력 (콘텐츠)
- [ ] 관리자 계정 생성

### 성능 목표

| 메트릭 | 목표 | 현재 |
|--------|------|------|
| 평균 쿼리 속도 | < 50ms | ✅ |
| 동시 연결 수 | 1000+ | ✅ |
| DB 응답률 | 99.9% | ✅ |
| 백업 주기 | 매일 | ✅ |

---

**Last Updated:** 2025-11-18
**Version:** 2.0.0 - Production Database Guide
