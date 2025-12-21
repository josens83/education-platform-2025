-- ============================================
-- Database Optimization Script
-- ============================================

-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
SELECT pg_reload_conf();

-- Create indexes for frequently queried columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_difficulty ON books(difficulty);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_published ON books(published_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_user_book ON learning_progress(user_id, book_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_updated ON learning_progress(updated_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_book ON reviews(book_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_attempts_created ON quiz_attempts(created_at);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_category_difficulty
ON books(category_id, difficulty) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_status
ON subscriptions(user_id, status) WHERE status = 'active';

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_search
ON books USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search
ON users USING gin(to_tsvector('english', username || ' ' || email));

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE books;
ANALYZE chapters;
ANALYZE subscriptions;
ANALYZE learning_progress;
ANALYZE reviews;
ANALYZE quiz_attempts;

-- Vacuum tables to reclaim space
VACUUM ANALYZE users;
VACUUM ANALYZE books;
VACUUM ANALYZE subscriptions;

-- Create materialized view for dashboard statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as users_last_30_days,
  (SELECT COUNT(*) FROM books) as total_books,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE created_at > NOW() - INTERVAL '30 days') as revenue_last_30_days,
  (SELECT COUNT(*) FROM quiz_attempts WHERE created_at > NOW() - INTERVAL '24 hours') as quizzes_last_24h,
  NOW() as updated_at;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_stats_updated_at ON dashboard_stats(updated_at);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;

-- Database maintenance
-- Reindex tables (run during low traffic)
-- REINDEX TABLE CONCURRENTLY users;
-- REINDEX TABLE CONCURRENTLY books;

-- Check for missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC
LIMIT 20;

-- Show table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY bytes DESC;

-- Show index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC
LIMIT 20;

-- Find duplicate indexes
SELECT
  pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS size,
  (array_agg(idx))[1] AS idx1,
  (array_agg(idx))[2] AS idx2,
  (array_agg(idx))[3] AS idx3,
  (array_agg(idx))[4] AS idx4
FROM (
  SELECT
    indexrelid::regclass AS idx,
    (indrelid::text || E'\n' || indclass::text || E'\n' ||
     indkey::text || E'\n' || COALESCE(indexprs::text, '') || E'\n' ||
     COALESCE(indpred::text, '')) AS key
  FROM pg_index
) sub
GROUP BY key
HAVING COUNT(*) > 1
ORDER BY SUM(pg_relation_size(idx)) DESC;

-- Optimization complete
SELECT 'Database optimization completed at ' || NOW()::text as status;
