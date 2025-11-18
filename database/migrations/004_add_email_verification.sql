-- 이메일 인증 기능 추가
-- 
-- 이 마이그레이션은 사용자 이메일 인증 기능을 위한 필드를 추가합니다.

-- users 테이블에 이메일 인증 필드 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token 
ON users(email_verification_token);

-- 기존 사용자들은 자동으로 인증된 것으로 처리 (선택사항)
UPDATE users 
SET email_verified = TRUE 
WHERE email_verified IS NULL OR email_verified = FALSE;

COMMENT ON COLUMN users.email_verified IS '이메일 인증 여부';
COMMENT ON COLUMN users.email_verification_token IS '이메일 인증 토큰 (SHA-256 해시)';
COMMENT ON COLUMN users.email_verification_expires IS '인증 토큰 만료 시간';
