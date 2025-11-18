-- Two-Factor Authentication (2FA) System
-- TOTP-based 2FA using Google Authenticator / Authy

-- ============================================
-- Add 2FA columns to users table
-- ============================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(32), -- Base32 encoded secret
ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[], -- Array of backup codes
ADD COLUMN IF NOT EXISTS two_factor_verified_at TIMESTAMP;

-- Indexes for 2FA queries
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled
ON users(two_factor_enabled)
WHERE two_factor_enabled = true;

-- ============================================
-- 2FA Setup Sessions Table
-- ============================================
-- Temporary storage for 2FA setup process (before verification)

CREATE TABLE IF NOT EXISTS two_factor_setup_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  secret VARCHAR(32) NOT NULL,
  backup_codes TEXT[] NOT NULL,
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Only one active setup session per user
  UNIQUE (user_id),

  -- Indexes
  INDEX idx_two_factor_setup_user_id (user_id),
  INDEX idx_two_factor_setup_expires_at (expires_at)
);

COMMENT ON TABLE two_factor_setup_sessions IS '2FA 설정 임시 세션 (15분 만료)';
COMMENT ON COLUMN two_factor_setup_sessions.secret IS 'TOTP secret (base32)';
COMMENT ON COLUMN two_factor_setup_sessions.backup_codes IS '백업 코드 (해시됨)';

-- ============================================
-- 2FA Login Attempts Table
-- ============================================
-- Track 2FA verification attempts for rate limiting

CREATE TABLE IF NOT EXISTS two_factor_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  success BOOLEAN DEFAULT false,
  code_type VARCHAR(20) CHECK (code_type IN ('totp', 'backup')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_two_factor_attempts_user_id (user_id),
  INDEX idx_two_factor_attempts_created_at (created_at)
);

COMMENT ON TABLE two_factor_attempts IS '2FA 인증 시도 기록 (보안 감사)';
COMMENT ON COLUMN two_factor_attempts.code_type IS 'TOTP 코드 또는 백업 코드';

-- ============================================
-- 2FA Recovery Sessions Table
-- ============================================
-- Track when users use backup codes

CREATE TABLE IF NOT EXISTS two_factor_recovery_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  backup_code_hash VARCHAR(255) NOT NULL,
  used_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Indexes
  INDEX idx_two_factor_recovery_user_id (user_id),
  INDEX idx_two_factor_recovery_used_at (used_at)
);

COMMENT ON TABLE two_factor_recovery_log IS '백업 코드 사용 이력';

-- ============================================
-- Cleanup function for expired setup sessions
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_2fa_setup_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_setup_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_2fa_setup_sessions IS '만료된 2FA 설정 세션 정리 (정기 실행 권장)';

-- ============================================
-- Security: Ensure secrets are encrypted at rest
-- ============================================

COMMENT ON COLUMN users.two_factor_secret IS 'TOTP secret (base32) - SHOULD BE ENCRYPTED IN PRODUCTION';
COMMENT ON COLUMN users.two_factor_backup_codes IS 'Backup codes - MUST BE HASHED with bcrypt/argon2';

-- ============================================
-- Sample cleanup job (run via cron/scheduler)
-- ============================================

-- Run this periodically to clean up expired sessions:
-- SELECT cleanup_expired_2fa_setup_sessions();

-- ============================================
-- Performance optimization
-- ============================================

ANALYZE users;
ANALYZE two_factor_setup_sessions;
ANALYZE two_factor_attempts;
ANALYZE two_factor_recovery_log;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Two-Factor Authentication (2FA) schema created successfully';
  RAISE NOTICE '🔐 Users table: 2FA columns added (enabled, secret, backup_codes)';
  RAISE NOTICE '⏱️  Setup sessions table: Temporary 2FA setup storage (15min TTL)';
  RAISE NOTICE '📊 Attempts table: 2FA verification audit log';
  RAISE NOTICE '🔑 Recovery log table: Backup code usage tracking';
  RAISE NOTICE '🧹 Cleanup function: cleanup_expired_2fa_setup_sessions()';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Encrypt two_factor_secret in production!';
  RAISE NOTICE '⚠️  IMPORTANT: Hash backup codes with bcrypt before storage!';
END $$;
