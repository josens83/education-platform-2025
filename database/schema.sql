-- Education Content Platform Database Schema
-- 구독형 영어 교육 콘텐츠 플랫폼

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

-- 사용자 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student', -- student, teacher, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 프로필 (어린이/성인 모드 설정)
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200),
    birth_date DATE,
    grade_level VARCHAR(50), -- elementary_5, middle_2, high_3, adult 등
    target_exam VARCHAR(50), -- toeic, toefl, teps, sat, etc
    is_kids_mode BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(500),
    preferences JSONB, -- UI 설정, 학습 선호도 등
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. SUBSCRIPTION MANAGEMENT
-- ============================================

-- 구독 플랜
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Free Trial, Monthly, Annual, Family
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL, -- monthly, annual, lifetime
    features JSONB, -- 제공 기능 목록
    max_users INTEGER DEFAULT 1, -- 가족 플랜용
    trial_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 구독
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL, -- active, cancelled, expired, trial
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50), -- card, paypal, etc
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 결제 내역
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id),
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    status VARCHAR(20) NOT NULL, -- completed, pending, failed, refunded
    payment_gateway VARCHAR(50), -- stripe, toss, etc
    transaction_id VARCHAR(200),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. CONTENT STRUCTURE
-- ============================================

-- 카테고리
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    icon_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 책/코스
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    cover_image_url VARCHAR(500),
    author VARCHAR(200),
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    target_grade VARCHAR(50), -- elementary_5, middle_2, high_3, adult
    target_exam VARCHAR(50), -- toeic, toefl, sat, teps, etc
    estimated_hours INTEGER, -- 예상 학습 시간
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    metadata JSONB, -- 태그, 키워드 등
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 챕터
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL,
    content TEXT, -- HTML 또는 Markdown
    content_type VARCHAR(20) DEFAULT 'html', -- html, markdown, epub
    estimated_minutes INTEGER, -- 예상 학습 시간
    is_published BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, chapter_number)
);

-- 오디오 파일 (챕터별)
CREATE TABLE audio_files (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    audio_type VARCHAR(20) DEFAULT 'professional', -- professional, ai_tts
    transcript TEXT, -- 텍스트-오디오 싱크용
    sync_data JSONB, -- 문장별 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. LEARNING PROGRESS
-- ============================================

-- 학습 진도
CREATE TABLE learning_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_position TEXT, -- 마지막 읽은 위치 (문단 ID 등)
    time_spent_seconds INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, chapter_id)
);

-- 북마크
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    position TEXT NOT NULL, -- 북마크 위치 (문단 ID, 문장 번호 등)
    highlighted_text TEXT,
    color VARCHAR(20) DEFAULT 'yellow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 노트
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    position TEXT, -- 노트 위치
    content TEXT NOT NULL,
    tags VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 단어장
CREATE TABLE vocabulary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    word VARCHAR(200) NOT NULL,
    definition TEXT,
    example_sentence TEXT,
    chapter_id INTEGER REFERENCES chapters(id),
    is_mastered BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. QUIZ SYSTEM
-- ============================================

-- 퀴즈
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    quiz_type VARCHAR(20) DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer, fill_blank
    passing_score INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 퀴즈 질문
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL, -- multiple_choice, true_false, short_answer, fill_blank
    options JSONB, -- 선택지 (객관식의 경우)
    correct_answer TEXT NOT NULL,
    explanation TEXT, -- 해설
    points INTEGER DEFAULT 1,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 퀴즈 시도 기록
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    percentage INTEGER,
    time_taken_seconds INTEGER,
    is_passed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 퀴즈 답안 (오답 노트용)
CREATE TABLE quiz_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
    user_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. ANALYTICS & REPORTING
-- ============================================

-- 학습 통계 (일일/주간/월간)
CREATE TABLE learning_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    study_time_seconds INTEGER DEFAULT 0,
    chapters_completed INTEGER DEFAULT 0,
    quizzes_taken INTEGER DEFAULT 0,
    quizzes_passed INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stat_date)
);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- Books & Chapters
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_is_published ON books(is_published);
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_chapters_slug ON chapters(slug);

-- Learning Progress
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_book_id ON learning_progress(book_id);
CREATE INDEX idx_learning_progress_chapter_id ON learning_progress(chapter_id);
CREATE INDEX idx_learning_progress_last_accessed ON learning_progress(last_accessed_at);

-- Bookmarks & Notes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_vocabulary_user_id ON vocabulary(user_id);

-- Quizzes
CREATE INDEX idx_quizzes_chapter_id ON quizzes(chapter_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- Stats
CREATE INDEX idx_learning_stats_user_date ON learning_stats(user_id, stat_date);

-- ============================================
-- 8. INITIAL DATA
-- ============================================

-- 기본 구독 플랜
INSERT INTO subscription_plans (name, description, price, billing_cycle, trial_days, features) VALUES
('Free Trial', '7일 무료 체험', 0.00, 'trial', 7, '{"all_content": true, "offline_mode": false, "ai_tutor": false}'),
('Monthly', '월 구독', 11900.00, 'monthly', 0, '{"all_content": true, "offline_mode": true, "ai_tutor": false}'),
('Annual', '연간 구독 (2개월 할인)', 119000.00, 'annual', 0, '{"all_content": true, "offline_mode": true, "ai_tutor": true}'),
('Family', '가족 플랜 (3인)', 19900.00, 'monthly', 0, '{"all_content": true, "offline_mode": true, "ai_tutor": true, "max_users": 3}');

-- 기본 카테고리
INSERT INTO categories (name, slug, description, display_order) VALUES
('초등 영어', 'elementary', '초등학생을 위한 영어 학습', 1),
('중등 영어', 'middle-school', '중학생을 위한 영어 학습', 2),
('고등 영어', 'high-school', '고등학생을 위한 영어 학습', 3),
('수능 영어', 'sat', '대학수학능력시험 영어 영역', 4),
('TOEIC', 'toeic', 'TOEIC 시험 대비', 5),
('TOEFL', 'toefl', 'TOEFL 시험 대비', 6),
('TEPS', 'teps', 'TEPS 시험 대비', 7),
('비즈니스 영어', 'business', '직장인을 위한 비즈니스 영어', 8);
