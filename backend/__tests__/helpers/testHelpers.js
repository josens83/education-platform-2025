/**
 * Test Helper Utilities
 *
 * 테스트에서 공통으로 사용되는 헬퍼 함수들을 제공합니다.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * JWT 토큰 생성 (테스트용)
 */
function generateTestToken(userId, role = 'student') {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: '1h' }
  );
}

/**
 * 비밀번호 해시 생성 (테스트용)
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * 비밀번호 검증
 */
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * 테스트 사용자 데이터 생성
 */
function createTestUser(overrides = {}) {
  const defaultUser = {
    email: 'test@example.com',
    password: 'Test1234!',
    name: 'Test User',
    role: 'student'
  };
  return { ...defaultUser, ...overrides };
}

/**
 * 테스트 책 데이터 생성
 */
function createTestBook(overrides = {}) {
  const defaultBook = {
    title: 'Test Book',
    description: 'A test book for testing',
    author: 'Test Author',
    difficulty: 'beginner',
    category_id: 1,
    cover_image_url: 'https://example.com/cover.jpg',
    is_published: true
  };
  return { ...defaultBook, ...overrides };
}

/**
 * 테스트 구독 플랜 데이터 생성
 */
function createTestSubscriptionPlan(overrides = {}) {
  const defaultPlan = {
    name: 'Test Plan',
    description: 'A test subscription plan',
    price: 9.99,
    duration_days: 30,
    features: ['feature1', 'feature2']
  };
  return { ...defaultPlan, ...overrides };
}

/**
 * 테스트 쿠폰 데이터 생성
 */
function createTestCoupon(overrides = {}) {
  const defaultCoupon = {
    code: 'TEST2025',
    discount_type: 'percentage',
    discount_value: 10,
    valid_from: new Date(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    max_uses: 100,
    min_purchase_amount: 0
  };
  return { ...defaultCoupon, ...overrides };
}

/**
 * 테스트 퀴즈 데이터 생성
 */
function createTestQuiz(overrides = {}) {
  const defaultQuiz = {
    chapter_id: 1,
    title: 'Test Quiz',
    description: 'A test quiz',
    passing_score: 70,
    time_limit_minutes: 30
  };
  return { ...defaultQuiz, ...overrides };
}

/**
 * Mock database pool
 */
function createMockPool() {
  const mockResults = new Map();

  const pool = {
    query: jest.fn(async (sql, params) => {
      const key = JSON.stringify({ sql, params });
      if (mockResults.has(key)) {
        return mockResults.get(key);
      }
      return { rows: [], rowCount: 0 };
    }),

    // Mock 결과 설정
    setMockResult: (sql, params, result) => {
      const key = JSON.stringify({ sql, params });
      mockResults.set(key, result);
    },

    // Mock 초기화
    clearMocks: () => {
      mockResults.clear();
      pool.query.mockClear();
    }
  };

  return pool;
}

/**
 * API 요청 헬퍼
 */
function createApiHelper(request, baseUrl = '/api') {
  return {
    // GET 요청
    get: (url, token = null) => {
      const req = request.get(`${baseUrl}${url}`);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },

    // POST 요청
    post: (url, data, token = null) => {
      const req = request.post(`${baseUrl}${url}`).send(data);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },

    // PUT 요청
    put: (url, data, token = null) => {
      const req = request.put(`${baseUrl}${url}`).send(data);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },

    // PATCH 요청
    patch: (url, data, token = null) => {
      const req = request.patch(`${baseUrl}${url}`).send(data);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },

    // DELETE 요청
    delete: (url, token = null) => {
      const req = request.delete(`${baseUrl}${url}`);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    }
  };
}

/**
 * 테스트 데이터베이스 정리
 */
async function cleanupTestDatabase(pool) {
  const tables = [
    'quiz_answers',
    'quiz_attempts',
    'quiz_questions',
    'quizzes',
    'learning_stats',
    'vocabulary',
    'notes',
    'bookmarks',
    'learning_progress',
    'audio_files',
    'chapters',
    'reviews',
    'books',
    'coupon_usages',
    'coupons',
    'payments',
    'subscriptions',
    'oauth_connections',
    'user_sessions',
    'two_factor_attempts',
    'two_factor_recovery_log',
    'two_factor_setup_sessions',
    'push_subscriptions',
    'notifications',
    'ai_chat_history',
    'ai_recommendations',
    'search_analytics',
    'users',
    'categories',
    'subscription_plans'
  ];

  try {
    await pool.query('BEGIN');
    for (const table of tables) {
      await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    }
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

/**
 * 테스트 데이터 시드
 */
async function seedTestData(pool) {
  // 카테고리 생성
  const categoryResult = await pool.query(
    `INSERT INTO categories (name, description)
     VALUES ('Test Category', 'A test category')
     RETURNING id`
  );
  const categoryId = categoryResult.rows[0].id;

  // 구독 플랜 생성
  const planResult = await pool.query(
    `INSERT INTO subscription_plans (name, description, price, duration_days, features, stripe_price_id)
     VALUES ('Test Plan', 'Test plan description', 9.99, 30, '["feature1"]', 'price_test')
     RETURNING id`
  );
  const planId = planResult.rows[0].id;

  return {
    categoryId,
    planId
  };
}

/**
 * 날짜 비교 헬퍼
 */
function areDatesClose(date1, date2, thresholdMs = 5000) {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.abs(d1 - d2) < thresholdMs;
}

/**
 * 에러 메시지 검증
 */
function expectErrorResponse(response, statusCode, messagePattern) {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty('error');
  if (messagePattern) {
    expect(response.body.error).toMatch(messagePattern);
  }
}

/**
 * 성공 응답 검증
 */
function expectSuccessResponse(response, statusCode = 200) {
  expect(response.status).toBe(statusCode);
  expect(response.body).not.toHaveProperty('error');
}

module.exports = {
  generateTestToken,
  hashPassword,
  verifyPassword,
  createTestUser,
  createTestBook,
  createTestSubscriptionPlan,
  createTestCoupon,
  createTestQuiz,
  createMockPool,
  createApiHelper,
  cleanupTestDatabase,
  seedTestData,
  areDatesClose,
  expectErrorResponse,
  expectSuccessResponse
};
