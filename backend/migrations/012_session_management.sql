-- Session Management & Login History
-- 세션 관리 및 로그인 기록 시스템

-- ============================================
-- Login History Table
-- ============================================
CREATE TABLE IF NOT EXISTS login_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45), -- IPv6 support
  user_agent TEXT,
  device_type VARCHAR(50), -- mobile, tablet, desktop
  browser VARCHAR(50),
  os VARCHAR(50),
  location VARCHAR(255), -- City, Country (from IP geolocation)
  success BOOLEAN DEFAULT true,
  failure_reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_login_history_user_id (user_id),
  INDEX idx_login_history_created_at (created_at),
  INDEX idx_login_history_ip (ip_address)
);

COMMENT ON TABLE login_history IS '로그인 기록 및 보안 감사';
COMMENT ON COLUMN login_history.success IS '로그인 성공 여부';
COMMENT ON COLUMN login_history.failure_reason IS '로그인 실패 사유';

-- ============================================
-- Active Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS active_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50),
  device_name VARCHAR(100), -- "MacBook Pro", "iPhone 13" 등
  browser VARCHAR(50),
  os VARCHAR(50),
  last_activity TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,

  -- Indexes
  INDEX idx_active_sessions_user_id (user_id),
  INDEX idx_active_sessions_token (session_token),
  INDEX idx_active_sessions_expires (expires_at)
);

COMMENT ON TABLE active_sessions IS '활성 세션 관리';
COMMENT ON COLUMN active_sessions.session_token IS 'JWT 토큰 해시';
COMMENT ON COLUMN active_sessions.last_activity IS '마지막 활동 시간';

-- ============================================
-- Suspicious Activity Log
-- ============================================
CREATE TABLE IF NOT EXISTS suspicious_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'failed_login', 'password_change', 'unusual_location', etc.
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB, -- Additional context
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_suspicious_user_id (user_id),
  INDEX idx_suspicious_created_at (created_at),
  INDEX idx_suspicious_severity (severity),
  INDEX idx_suspicious_resolved (resolved)
);

COMMENT ON TABLE suspicious_activity IS '의심스러운 활동 로그';
COMMENT ON COLUMN suspicious_activity.severity IS '심각도 (low, medium, high, critical)';

-- ============================================
-- Login Attempts Tracking (Rate Limiting)
-- ============================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- email or IP address
  attempts INTEGER DEFAULT 1,
  locked_until TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (identifier),
  INDEX idx_login_attempts_identifier (identifier),
  INDEX idx_login_attempts_locked_until (locked_until)
);

COMMENT ON TABLE login_attempts IS '로그인 시도 추적 (brute force 방지)';
COMMENT ON COLUMN login_attempts.locked_until IS '계정 잠금 해제 시간';

-- ============================================
-- Triggers
-- ============================================

-- Update last_activity on active_sessions
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS session_activity_update ON active_sessions;
CREATE TRIGGER session_activity_update
  BEFORE UPDATE ON active_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- ============================================
-- Cleanup Old Sessions (Function)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM active_sessions
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions IS '만료된 세션 정리 (CRON으로 실행)';

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Session management system created successfully';
  RAISE NOTICE '   - login_history: Login audit trail';
  RAISE NOTICE '   - active_sessions: Active session tracking';
  RAISE NOTICE '   - suspicious_activity: Security monitoring';
  RAISE NOTICE '   - login_attempts: Brute force protection';
END $$;
