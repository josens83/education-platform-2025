-- Email Verification System
-- 이메일 인증 시스템을 위한 컬럼 추가

-- users 테이블에 이메일 인증 관련 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;

-- 인덱스 추가 (인증 토큰 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token
ON users(email_verification_token)
WHERE email_verification_token IS NOT NULL;

-- 기존 사용자들은 이메일 인증 완료로 처리 (backwards compatibility)
UPDATE users
SET email_verified = true
WHERE email_verified IS NULL OR email_verified = false;

-- 코멘트 추가
COMMENT ON COLUMN users.email_verified IS '이메일 인증 완료 여부';
COMMENT ON COLUMN users.email_verification_token IS '이메일 인증 토큰 (SHA256 해시)';
COMMENT ON COLUMN users.email_verification_expires IS '인증 토큰 만료 시간';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Email verification system added successfully';
  RAISE NOTICE '   - email_verified column added';
  RAISE NOTICE '   - email_verification_token column added';
  RAISE NOTICE '   - email_verification_expires column added';
  RAISE NOTICE '   - Existing users marked as verified';
END $$;
