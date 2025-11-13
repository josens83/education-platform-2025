const { Pool } = require('pg');

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
  process.exit(-1);
});

// 쿼리 헬퍼 함수
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 쿼리 실행: ${duration}ms`, { text: text.substring(0, 100), rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ 쿼리 오류:', error.message);
    throw error;
  }
};

// 트랜잭션 헬퍼
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 데이터베이스 초기화 (스키마 생성)
const initializeDatabase = async () => {
  const fs = require('fs');
  const path = require('path');

  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');

    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️  스키마 파일이 없습니다. 수동으로 데이터베이스를 설정해주세요.');
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 데이터베이스 스키마 초기화 중...');
    await pool.query(schema);
    console.log('✅ 데이터베이스 스키마 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  initializeDatabase
};
