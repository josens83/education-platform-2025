-- Push Notification Subscriptions Table
-- Web Push 구독 정보 저장

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 한 사용자는 여러 기기에서 구독 가능, 하지만 endpoint는 유니크
  UNIQUE (user_id, endpoint),

  -- 인덱스
  INDEX idx_push_subscriptions_user_id (user_id),
  INDEX idx_push_subscriptions_endpoint (endpoint)
);

COMMENT ON TABLE push_subscriptions IS 'Web Push 알림 구독 정보';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push 서비스 엔드포인트 URL';
COMMENT ON COLUMN push_subscriptions.p256dh IS '클라이언트 공개 키';
COMMENT ON COLUMN push_subscriptions.auth IS '인증 시크릿';

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_push_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS push_subscription_update_timestamp ON push_subscriptions;
CREATE TRIGGER push_subscription_update_timestamp
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_timestamp();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Push notification subscriptions table created successfully';
END $$;
