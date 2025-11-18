-- AI 기능을 위한 데이터베이스 스키마
-- - AI 챗봇 대화 기록
-- - OAuth 연결 정보 (이미 구현되어 있을 수 있음)

-- ============================================
-- AI 챗봇 대화 기록 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  message TEXT NOT NULL,
  book_context JSONB, -- 책 컨텍스트 정보 (선택적)
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 인덱스
  INDEX idx_chat_history_user_id (user_id),
  INDEX idx_chat_history_created_at (created_at)
);

COMMENT ON TABLE chat_history IS 'AI 챗봇과의 대화 기록';
COMMENT ON COLUMN chat_history.role IS '메시지 역할: user(사용자), assistant(AI), system(시스템)';
COMMENT ON COLUMN chat_history.book_context IS '현재 읽고 있는 책 정보 (JSON)';

-- ============================================
-- OAuth 연결 테이블 (중복 방지)
-- ============================================

CREATE TABLE IF NOT EXISTS oauth_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'kakao', etc.
  provider_user_id VARCHAR(255) NOT NULL, -- OAuth 제공자의 사용자 ID
  provider_data JSONB, -- 프로필 정보 등
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 유니크 제약 (한 사용자는 동일 제공자에 하나의 연결만 가능)
  UNIQUE (user_id, provider),
  -- OAuth ID는 제공자별로 유니크
  UNIQUE (provider, provider_user_id),

  -- 인덱스
  INDEX idx_oauth_user_id (user_id),
  INDEX idx_oauth_provider (provider)
);

COMMENT ON TABLE oauth_connections IS 'OAuth 소셜 로그인 연결 정보';
COMMENT ON COLUMN oauth_connections.provider IS 'OAuth 제공자 (google, kakao, etc.)';
COMMENT ON COLUMN oauth_connections.provider_user_id IS 'OAuth 제공자의 사용자 고유 ID';
COMMENT ON COLUMN oauth_connections.provider_data IS 'OAuth 프로필 정보 (JSON)';

-- ============================================
-- AI 사용 통계 테이블 (선택적 - 사용량 추적)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_usage_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  feature_type VARCHAR(50) NOT NULL, -- 'recommendations', 'chat', 'grammar', 'word', etc.
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10, 6), -- 예상 비용 (USD)
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 인덱스
  INDEX idx_ai_usage_user_id (user_id),
  INDEX idx_ai_usage_created_at (created_at),
  INDEX idx_ai_usage_feature (feature_type)
);

COMMENT ON TABLE ai_usage_stats IS 'AI 기능 사용 통계 및 비용 추적';
COMMENT ON COLUMN ai_usage_stats.feature_type IS 'AI 기능 유형 (recommendations, chat, etc.)';
COMMENT ON COLUMN ai_usage_stats.cost_estimate IS 'OpenAI API 사용 예상 비용 (USD)';

-- ============================================
-- 업데이트 트리거 (oauth_connections)
-- ============================================

CREATE OR REPLACE FUNCTION update_oauth_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS oauth_update_timestamp ON oauth_connections;
CREATE TRIGGER oauth_update_timestamp
  BEFORE UPDATE ON oauth_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_oauth_timestamp();

-- ============================================
-- 완료 메시지
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ AI 기능 데이터베이스 스키마가 성공적으로 생성되었습니다.';
  RAISE NOTICE '   - chat_history: AI 챗봇 대화 기록';
  RAISE NOTICE '   - oauth_connections: OAuth 소셜 로그인 연결';
  RAISE NOTICE '   - ai_usage_stats: AI 사용 통계';
END $$;
