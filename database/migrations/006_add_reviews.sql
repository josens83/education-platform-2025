-- User Reviews and Ratings System
-- 사용자 리뷰 및 평점 시스템

-- ============================================
-- 리뷰 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,  -- 실제 구독한 사용자인지
    helpful_count INTEGER DEFAULT 0,  -- 도움이 됨 카운트
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 한 사용자가 한 책에 하나의 리뷰만 작성
    UNIQUE(user_id, book_id)
);

-- ============================================
-- 리뷰 도움됨 테이블 (좋아요)
-- ============================================
CREATE TABLE IF NOT EXISTS review_helpful (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 한 사용자가 한 리뷰에 한 번만 투표
    UNIQUE(review_id, user_id)
);

-- ============================================
-- 리뷰 신고 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS review_reports (
    id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    reported_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL,  -- 'spam', 'inappropriate', 'offensive', 'misleading'
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'reviewed', 'action_taken', 'dismissed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id),

    -- 한 사용자가 같은 리뷰를 여러 번 신고할 수 없음
    UNIQUE(review_id, reported_by)
);

-- ============================================
-- 인덱스 생성
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_helpful_count ON reviews(helpful_count DESC);

CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user ON review_helpful(user_id);

CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_review_reports_review ON review_reports(review_id);

-- ============================================
-- 책 평점 통계 뷰
-- ============================================
CREATE OR REPLACE VIEW book_ratings AS
SELECT
    b.id AS book_id,
    b.title,
    COUNT(r.id) AS review_count,
    ROUND(AVG(r.rating), 2) AS average_rating,
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) AS rating_5_count,
    COUNT(CASE WHEN r.rating = 4 THEN 1 END) AS rating_4_count,
    COUNT(CASE WHEN r.rating = 3 THEN 1 END) AS rating_3_count,
    COUNT(CASE WHEN r.rating = 2 THEN 1 END) AS rating_2_count,
    COUNT(CASE WHEN r.rating = 1 THEN 1 END) AS rating_1_count,
    COUNT(CASE WHEN r.is_verified_purchase THEN 1 END) AS verified_review_count
FROM books b
LEFT JOIN reviews r ON b.id = r.book_id
GROUP BY b.id, b.title;

-- ============================================
-- 트리거: review_helpful 카운트 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_helpful_count
AFTER INSERT OR DELETE ON review_helpful
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

-- ============================================
-- 트리거: updated_at 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_reviews_updated_at();

-- ============================================
-- 검증된 구매 여부 확인 함수
-- ============================================
CREATE OR REPLACE FUNCTION is_verified_purchase(p_user_id INTEGER, p_book_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_subscription BOOLEAN;
BEGIN
    -- 활성 구독이 있거나 과거에 구독한 적이 있는지 확인
    SELECT EXISTS(
        SELECT 1
        FROM subscriptions s
        WHERE s.user_id = p_user_id
          AND (s.status = 'active' OR s.end_date >= NOW() - INTERVAL '30 days')
    ) INTO v_has_subscription;

    RETURN v_has_subscription;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_verified_purchase IS '사용자가 구독을 통해 책을 읽을 수 있는 권한이 있는지 확인';

-- ============================================
-- 샘플 리뷰 데이터 (개발/테스트용)
-- ============================================
-- 실제 프로덕션에서는 사용자가 작성한 리뷰만 사용

COMMENT ON TABLE reviews IS '사용자 책 리뷰 및 평점';
COMMENT ON TABLE review_helpful IS '리뷰 도움됨 (좋아요)';
COMMENT ON TABLE review_reports IS '부적절한 리뷰 신고';
COMMENT ON VIEW book_ratings IS '책별 평점 통계 (평균 평점, 리뷰 수 등)';
