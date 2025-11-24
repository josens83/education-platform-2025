/**
 * Jest Global Setup
 *
 * 모든 테스트 실행 전에 한 번 실행됩니다.
 */

require('dotenv').config({ path: '.env.test' });

module.exports = async () => {
  console.log('\n🧪 Setting up test environment...\n');

  // 환경 변수 검증
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env.test');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in .env.test');
  }

  // 테스트 데이터베이스 연결 확인
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Test database connection successful\n');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};
