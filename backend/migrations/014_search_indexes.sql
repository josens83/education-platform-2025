-- Full-Text Search Indexes
-- PostgreSQL GIN indexes for fast text search

-- ============================================
-- Books Full-Text Search
-- ============================================

-- Create GIN index for books (title, author, description)
CREATE INDEX IF NOT EXISTS idx_books_fulltext_search
ON books
USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, '')));

COMMENT ON INDEX idx_books_fulltext_search IS 'Full-text search index for books (title, author, description)';

-- ============================================
-- Chapters Full-Text Search
-- ============================================

-- Create GIN index for chapters (title, content)
CREATE INDEX IF NOT EXISTS idx_chapters_fulltext_search
ON chapters
USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

COMMENT ON INDEX idx_chapters_fulltext_search IS 'Full-text search index for chapters (title, content)';

-- ============================================
-- Notes Full-Text Search
-- ============================================

-- Create GIN index for notes (content)
CREATE INDEX IF NOT EXISTS idx_notes_fulltext_search
ON notes
USING GIN (to_tsvector('english', coalesce(content, '')));

COMMENT ON INDEX idx_notes_fulltext_search IS 'Full-text search index for notes (content)';

-- ============================================
-- Additional Performance Indexes
-- ============================================

-- Index for autocomplete/suggestions (ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_books_title_trgm
ON books
USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_books_author_trgm
ON books
USING GIN (author gin_trgm_ops);

COMMENT ON INDEX idx_books_title_trgm IS 'Trigram index for books title (autocomplete)';
COMMENT ON INDEX idx_books_author_trgm IS 'Trigram index for books author (autocomplete)';

-- Enable pg_trgm extension if not already enabled (for ILIKE performance)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- Search History Table (Optional - for analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS search_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  query VARCHAR(255) NOT NULL,
  results_count INTEGER DEFAULT 0,
  clicked_result_id INTEGER,
  clicked_result_type VARCHAR(20) CHECK (clicked_result_type IN ('book', 'chapter', 'note')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_search_history_user_id (user_id),
  INDEX idx_search_history_query (query),
  INDEX idx_search_history_created_at (created_at)
);

COMMENT ON TABLE search_history IS '검색 이력 (분석용)';
COMMENT ON COLUMN search_history.query IS '검색어';
COMMENT ON COLUMN search_history.results_count IS '검색 결과 수';
COMMENT ON COLUMN search_history.clicked_result_id IS '클릭한 결과 ID';
COMMENT ON COLUMN search_history.clicked_result_type IS '클릭한 결과 타입 (book/chapter/note)';

-- ============================================
-- Popular Searches View (Materialized for performance)
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS popular_searches AS
SELECT
  query,
  COUNT(*) as search_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(results_count) as avg_results,
  MAX(created_at) as last_searched
FROM search_history
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY query
HAVING COUNT(*) > 1
ORDER BY search_count DESC
LIMIT 100;

CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_searches_query
ON popular_searches (query);

COMMENT ON MATERIALIZED VIEW popular_searches IS '인기 검색어 (지난 30일)';

-- Refresh popular searches view (run periodically via cron or scheduler)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY popular_searches;

-- ============================================
-- Performance Analysis
-- ============================================

-- Analyze tables to update statistics for query planner
ANALYZE books;
ANALYZE chapters;
ANALYZE notes;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Search indexes created successfully';
  RAISE NOTICE '📊 Full-text search (GIN) indexes: books, chapters, notes';
  RAISE NOTICE '🔍 Autocomplete (trigram) indexes: book titles & authors';
  RAISE NOTICE '📈 Search history tracking table created';
  RAISE NOTICE '⭐ Popular searches materialized view created';
END $$;
