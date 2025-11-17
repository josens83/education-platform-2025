-- Performance Optimization - Additional Indexes
-- Phase 7: Database Query Optimization

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================

-- Learning progress: frequently queried by user+book or user+chapter
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_book ON learning_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_chapter ON learning_progress(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_completed ON learning_progress(user_id, is_completed);

-- Bookmarks: frequently queried by user+chapter
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_chapter ON bookmarks(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_chapter ON bookmarks(chapter_id);

-- Notes: frequently queried by user+chapter
CREATE INDEX IF NOT EXISTS idx_notes_user_chapter ON notes(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_notes_chapter ON notes(chapter_id);

-- Vocabulary: frequently queried by user and mastered status
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_mastered ON vocabulary(user_id, is_mastered);
CREATE INDEX IF NOT EXISTS idx_vocabulary_chapter ON vocabulary(chapter_id);

-- Quiz attempts: frequently queried by user+quiz and for statistics
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_passed ON quiz_attempts(user_id, is_passed);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_started ON quiz_attempts(started_at DESC);

-- Quiz answers: frequently queried by attempt
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);

-- Audio files: frequently queried by chapter
CREATE INDEX IF NOT EXISTS idx_audio_files_chapter ON audio_files(chapter_id);

-- ============================================
-- TIMESTAMP INDEXES FOR SORTING & FILTERING
-- ============================================

-- User profiles: for activity tracking
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated ON user_profiles(updated_at DESC);

-- Subscriptions: for expiration checking
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(status, end_date) WHERE status = 'active';

-- Payments: for transaction history
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);

-- Vocabulary: for recent additions and review scheduling
CREATE INDEX IF NOT EXISTS idx_vocabulary_last_reviewed ON vocabulary(user_id, last_reviewed_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_vocabulary_created ON vocabulary(user_id, created_at DESC);

-- ============================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- ============================================

-- Active books only (most common query)
CREATE INDEX IF NOT EXISTS idx_books_published_featured ON books(is_published, is_featured) WHERE is_published = true;

-- Active quizzes only
CREATE INDEX IF NOT EXISTS idx_quizzes_active ON quizzes(chapter_id, is_active) WHERE is_active = true;

-- Completed learning progress
CREATE INDEX IF NOT EXISTS idx_learning_progress_completed_at ON learning_progress(user_id, completed_at DESC) WHERE is_completed = true;

-- ============================================
-- TEXT SEARCH OPTIMIZATION (requires pg_trgm extension)
-- ============================================

-- Enable extension first: CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Books: for search functionality (OPTIONAL - requires pg_trgm extension)
-- Uncomment these if pg_trgm extension is available:
-- CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_books_description_trgm ON books USING gin(description gin_trgm_ops);

-- Vocabulary: for word search (works without pg_trgm)
CREATE INDEX IF NOT EXISTS idx_vocabulary_word_lower ON vocabulary(lower(word));

-- ============================================
-- COVERING INDEXES FOR COMMON QUERIES
-- ============================================

-- Learning progress: cover most common SELECT fields
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_access_cover ON learning_progress(user_id, last_accessed_at DESC)
  INCLUDE (book_id, chapter_id, progress_percentage, is_completed);

-- Quiz attempts: cover most common SELECT fields
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_cover ON quiz_attempts(user_id, started_at DESC)
  INCLUDE (quiz_id, percentage, is_passed, time_taken_seconds);

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

ANALYZE users;
ANALYZE user_profiles;
ANALYZE subscriptions;
ANALYZE books;
ANALYZE chapters;
ANALYZE learning_progress;
ANALYZE bookmarks;
ANALYZE notes;
ANALYZE vocabulary;
ANALYZE quizzes;
ANALYZE quiz_attempts;
ANALYZE audio_files;

-- ============================================
-- PERFORMANCE NOTES
-- ============================================

-- Notes for database administrators:
-- 1. Composite indexes help with multi-column WHERE/ORDER BY clauses
-- 2. Partial indexes reduce index size for filtered queries
-- 3. INCLUDE clause (covering indexes) can eliminate table lookups
-- 4. Text search indexes (gin_trgm_ops) require pg_trgm extension
-- 5. Regular ANALYZE keeps query planner statistics up to date
-- 6. Monitor index usage with pg_stat_user_indexes
-- 7. Remove unused indexes with: SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
