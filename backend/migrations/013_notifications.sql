-- Notifications System
-- 인앱 알림 시스템

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_read (read),
  INDEX idx_notifications_created_at (created_at)
);

COMMENT ON TABLE notifications IS '사용자 알림';
COMMENT ON COLUMN notifications.type IS '알림 타입 (info, success, warning, error)';
COMMENT ON COLUMN notifications.action_url IS '클릭 시 이동할 URL';
COMMENT ON COLUMN notifications.metadata IS '추가 데이터 (JSON)';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Notifications table created successfully';
END $$;
