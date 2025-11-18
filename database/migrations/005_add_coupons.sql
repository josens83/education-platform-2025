-- Coupon and Promo Code System
-- 마케팅 및 프로모션을 위한 쿠폰 시스템

-- ============================================
-- 쿠폰 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,  -- 쿠폰 코드 (예: SUMMER2025)
    description TEXT,  -- 쿠폰 설명
    discount_type VARCHAR(20) NOT NULL,  -- 'percentage' 또는 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,  -- 할인 값 (10 = 10% 또는 10,000원)
    max_discount_amount DECIMAL(10, 2),  -- 최대 할인 금액 (퍼센트 할인의 경우)
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,  -- 최소 구매 금액
    usage_limit INTEGER,  -- 전체 사용 제한 (NULL = 무제한)
    usage_per_user INTEGER DEFAULT 1,  -- 사용자당 사용 제한
    valid_from TIMESTAMP NOT NULL,  -- 유효 시작일
    valid_until TIMESTAMP NOT NULL,  -- 유효 종료일
    applicable_plans JSONB,  -- 적용 가능한 플랜 IDs (NULL = 모든 플랜)
    is_active BOOLEAN DEFAULT TRUE,  -- 활성화 여부
    created_by INTEGER REFERENCES users(id),  -- 생성자
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 제약 조건
    CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT valid_discount_value CHECK (
        (discount_type = 'percentage' AND discount_value > 0 AND discount_value <= 100) OR
        (discount_type = 'fixed' AND discount_value > 0)
    ),
    CONSTRAINT valid_dates CHECK (valid_from < valid_until)
);

-- ============================================
-- 쿠폰 사용 이력 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_usages (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,  -- 실제 할인된 금액
    original_amount DECIMAL(10, 2) NOT NULL,  -- 원래 금액
    final_amount DECIMAL(10, 2) NOT NULL,  -- 최종 결제 금액
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 사용자별 중복 사용 방지를 위한 인덱스
    UNIQUE(coupon_id, user_id, subscription_id)
);

-- ============================================
-- 인덱스 생성
-- ============================================
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_date ON coupon_usages(used_at DESC);

-- ============================================
-- 샘플 쿠폰 데이터
-- ============================================
INSERT INTO coupons (code, description, discount_type, discount_value, max_discount_amount, min_purchase_amount, usage_limit, usage_per_user, valid_from, valid_until, is_active)
VALUES
    -- 신규 가입 환영 쿠폰 (20% 할인, 최대 5,000원)
    ('WELCOME2025', '신규 가입 환영 쿠폰 - 첫 구독 20% 할인', 'percentage', 20.00, 5000.00, 0, NULL, 1,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', TRUE),

    -- 여름 프로모션 (30% 할인, 최대 10,000원)
    ('SUMMER2025', '여름 특별 프로모션 - 30% 할인', 'percentage', 30.00, 10000.00, 9900.00, 1000, 1,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 months', TRUE),

    -- 정액 할인 쿠폰 (5,000원 할인)
    ('SAVE5000', '5,000원 즉시 할인', 'fixed', 5000.00, NULL, 9900.00, 500, 1,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '6 months', TRUE),

    -- VIP 고객용 (50% 할인)
    ('VIP50', 'VIP 고객 전용 - 50% 할인', 'percentage', 50.00, 50000.00, 0, 100, 1,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', TRUE),

    -- 친구 추천 쿠폰 (15% 할인)
    ('FRIEND15', '친구 추천 쿠폰 - 15% 할인', 'percentage', 15.00, 5000.00, 0, NULL, 1,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', TRUE);

-- ============================================
-- 쿠폰 통계 뷰
-- ============================================
CREATE OR REPLACE VIEW coupon_stats AS
SELECT
    c.id,
    c.code,
    c.description,
    c.discount_type,
    c.discount_value,
    COUNT(cu.id) AS usage_count,
    SUM(cu.discount_amount) AS total_discount_given,
    SUM(cu.final_amount) AS total_revenue,
    c.usage_limit,
    CASE
        WHEN c.usage_limit IS NULL THEN NULL
        WHEN c.usage_limit - COUNT(cu.id) <= 0 THEN 0
        ELSE c.usage_limit - COUNT(cu.id)
    END AS remaining_uses,
    c.valid_from,
    c.valid_until,
    CASE
        WHEN CURRENT_TIMESTAMP < c.valid_from THEN 'upcoming'
        WHEN CURRENT_TIMESTAMP > c.valid_until THEN 'expired'
        WHEN NOT c.is_active THEN 'inactive'
        WHEN c.usage_limit IS NOT NULL AND COUNT(cu.id) >= c.usage_limit THEN 'exhausted'
        ELSE 'active'
    END AS status
FROM coupons c
LEFT JOIN coupon_usages cu ON c.id = cu.coupon_id
GROUP BY c.id, c.code, c.description, c.discount_type, c.discount_value, c.usage_limit, c.valid_from, c.valid_until, c.is_active;

-- ============================================
-- 사용자별 쿠폰 사용 가능 여부 확인 함수
-- ============================================
CREATE OR REPLACE FUNCTION can_use_coupon(
    p_coupon_code VARCHAR(50),
    p_user_id INTEGER,
    p_plan_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    can_use BOOLEAN,
    reason TEXT,
    discount_amount DECIMAL(10, 2)
) AS $$
DECLARE
    v_coupon RECORD;
    v_usage_count INTEGER;
    v_plan_price DECIMAL(10, 2);
    v_discount DECIMAL(10, 2);
BEGIN
    -- 쿠폰 정보 조회
    SELECT * INTO v_coupon
    FROM coupons
    WHERE code = p_coupon_code AND is_active = TRUE;

    -- 쿠폰이 존재하지 않거나 비활성화됨
    IF v_coupon IS NULL THEN
        RETURN QUERY SELECT FALSE, '유효하지 않은 쿠폰입니다.'::TEXT, 0::DECIMAL(10, 2);
        RETURN;
    END IF;

    -- 유효 기간 확인
    IF CURRENT_TIMESTAMP < v_coupon.valid_from THEN
        RETURN QUERY SELECT FALSE, '쿠폰 사용 기간이 아직 시작되지 않았습니다.'::TEXT, 0::DECIMAL(10, 2);
        RETURN;
    END IF;

    IF CURRENT_TIMESTAMP > v_coupon.valid_until THEN
        RETURN QUERY SELECT FALSE, '쿠폰 사용 기간이 만료되었습니다.'::TEXT, 0::DECIMAL(10, 2);
        RETURN;
    END IF;

    -- 전체 사용 제한 확인
    IF v_coupon.usage_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO v_usage_count FROM coupon_usages WHERE coupon_id = v_coupon.id;
        IF v_usage_count >= v_coupon.usage_limit THEN
            RETURN QUERY SELECT FALSE, '쿠폰 사용 한도가 초과되었습니다.'::TEXT, 0::DECIMAL(10, 2);
            RETURN;
        END IF;
    END IF;

    -- 사용자별 사용 제한 확인
    SELECT COUNT(*) INTO v_usage_count
    FROM coupon_usages
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

    IF v_usage_count >= v_coupon.usage_per_user THEN
        RETURN QUERY SELECT FALSE, '이미 사용한 쿠폰입니다.'::TEXT, 0::DECIMAL(10, 2);
        RETURN;
    END IF;

    -- 플랜 가격 조회 (제공된 경우)
    IF p_plan_id IS NOT NULL THEN
        SELECT price INTO v_plan_price FROM subscription_plans WHERE id = p_plan_id;

        -- 최소 구매 금액 확인
        IF v_plan_price < v_coupon.min_purchase_amount THEN
            RETURN QUERY SELECT FALSE, format('최소 구매 금액(%s원)을 충족하지 못했습니다.', v_coupon.min_purchase_amount), 0::DECIMAL(10, 2);
            RETURN;
        END IF;

        -- 적용 가능한 플랜 확인
        IF v_coupon.applicable_plans IS NOT NULL AND NOT (v_coupon.applicable_plans @> to_jsonb(p_plan_id)) THEN
            RETURN QUERY SELECT FALSE, '이 플랜에는 적용할 수 없는 쿠폰입니다.'::TEXT, 0::DECIMAL(10, 2);
            RETURN;
        END IF;

        -- 할인 금액 계산
        IF v_coupon.discount_type = 'percentage' THEN
            v_discount := v_plan_price * (v_coupon.discount_value / 100);
            IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
                v_discount := v_coupon.max_discount_amount;
            END IF;
        ELSE
            v_discount := v_coupon.discount_value;
            IF v_discount > v_plan_price THEN
                v_discount := v_plan_price;
            END IF;
        END IF;
    ELSE
        v_discount := 0;
    END IF;

    -- 사용 가능
    RETURN QUERY SELECT TRUE, '쿠폰을 사용할 수 있습니다.'::TEXT, v_discount;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_use_coupon IS '사용자가 특정 쿠폰을 사용할 수 있는지 확인하고 할인 금액을 계산';
