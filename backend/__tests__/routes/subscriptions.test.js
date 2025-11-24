/**
 * Subscriptions API Integration Tests
 *
 * 구독 관련 API 엔드포인트의 통합 테스트
 */

const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');
const subscriptionsRouter = require('../../routes/subscriptions');
const {
  generateTestToken,
  hashPassword,
  cleanupTestDatabase,
  seedTestData,
  expectErrorResponse,
  expectSuccessResponse
} = require('../helpers/testHelpers');

// Express 앱 설정
const app = express();
app.use(express.json());
app.use('/api/subscriptions', subscriptionsRouter);

// 테스트 데이터베이스 연결
let pool;
let testUser;
let testToken;
let testPlanId;

beforeAll(async () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  // Mock query function
  jest.spyOn(require('../../database'), 'query').mockImplementation((...args) => {
    return pool.query(...args);
  });

  await cleanupTestDatabase(pool);
  const seedData = await seedTestData(pool);
  testPlanId = seedData.planId;
});

afterAll(async () => {
  await pool.end();
  jest.restoreAllMocks();
});

beforeEach(async () => {
  // 테스트 사용자 생성
  const passwordHash = await hashPassword('Test1234!');
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, username, role, email_verified)
     VALUES ($1, $2, $3, $4, true)
     RETURNING id, email, username, role`,
    ['subuser@example.com', passwordHash, 'Sub User', 'student']
  );
  testUser = result.rows[0];
  testToken = generateTestToken(testUser.id, testUser.role);

  // 프로필 생성
  await pool.query(
    `INSERT INTO user_profiles (user_id, full_name)
     VALUES ($1, $2)`,
    [testUser.id, testUser.username]
  );
});

afterEach(async () => {
  await pool.query('TRUNCATE TABLE subscriptions RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
});

describe('GET /api/subscriptions/plans', () => {
  it('should return list of active subscription plans', async () => {
    const response = await request(app)
      .get('/api/subscriptions/plans')
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.body.data[0]).toHaveProperty('name');
    expect(response.body.data[0]).toHaveProperty('price');
  });

  it('should return plans ordered by price', async () => {
    const response = await request(app)
      .get('/api/subscriptions/plans')
      .expect(200);

    const prices = response.body.data.map(plan => plan.price);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);
  });
});

describe('GET /api/subscriptions/my', () => {
  it('should return user subscription if exists', async () => {
    // 구독 생성
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
       VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '30 days')`,
      [testUser.id, testPlanId, 'active']
    );

    const response = await request(app)
      .get('/api/subscriptions/my')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toBeTruthy();
    expect(response.body.data.status).toBe('active');
    expect(response.body.data).toHaveProperty('plan_name');
  });

  it('should return null if no subscription', async () => {
    const response = await request(app)
      .get('/api/subscriptions/my')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toBeNull();
  });

  it('should fail without authentication', async () => {
    const response = await request(app)
      .get('/api/subscriptions/my')
      .expect(401);

    expectErrorResponse(response, 401);
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/subscriptions/my')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expectErrorResponse(response, 401);
  });
});

describe('POST /api/subscriptions', () => {
  it('should create subscription for valid plan', async () => {
    const response = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        plan_id: testPlanId,
        payment_method: 'stripe'
      })
      .expect(201);

    expectSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.status).toBe('active');

    // 데이터베이스에 구독이 생성되었는지 확인
    const subscription = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [testUser.id]
    );
    expect(subscription.rows.length).toBe(1);
  });

  it('should fail without authentication', async () => {
    const response = await request(app)
      .post('/api/subscriptions')
      .send({
        plan_id: testPlanId,
        payment_method: 'stripe'
      })
      .expect(401);

    expectErrorResponse(response, 401);
  });

  it('should fail with invalid plan_id', async () => {
    const response = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        plan_id: 99999,
        payment_method: 'stripe'
      })
      .expect(404);

    expectErrorResponse(response, 404);
  });

  it('should prevent duplicate active subscriptions', async () => {
    // 첫 번째 구독 생성
    await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        plan_id: testPlanId,
        payment_method: 'stripe'
      })
      .expect(201);

    // 두 번째 구독 시도
    const response = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        plan_id: testPlanId,
        payment_method: 'stripe'
      })
      .expect(409);

    expectErrorResponse(response, 409);
  });
});

describe('PUT /api/subscriptions/cancel', () => {
  let subscriptionId;

  beforeEach(async () => {
    // 테스트용 활성 구독 생성
    const result = await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
       VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '30 days')
       RETURNING id`,
      [testUser.id, testPlanId, 'active']
    );
    subscriptionId = result.rows[0].id;
  });

  it('should cancel active subscription', async () => {
    const response = await request(app)
      .put('/api/subscriptions/cancel')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.message).toMatch(/취소/);

    // 구독 상태 확인
    const subscription = await pool.query(
      'SELECT status FROM subscriptions WHERE id = $1',
      [subscriptionId]
    );
    expect(subscription.rows[0].status).toBe('cancelled');
  });

  it('should fail without active subscription', async () => {
    // 구독 삭제
    await pool.query('DELETE FROM subscriptions WHERE id = $1', [subscriptionId]);

    const response = await request(app)
      .put('/api/subscriptions/cancel')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(404);

    expectErrorResponse(response, 404);
  });

  it('should fail without authentication', async () => {
    const response = await request(app)
      .put('/api/subscriptions/cancel')
      .expect(401);

    expectErrorResponse(response, 401);
  });
});

describe('GET /api/subscriptions/history', () => {
  beforeEach(async () => {
    // 여러 구독 이력 생성
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
       VALUES
         ($1, $2, 'expired', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days'),
         ($1, $2, 'active', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days')`,
      [testUser.id, testPlanId]
    );
  });

  it('should return subscription history', async () => {
    const response = await request(app)
      .get('/api/subscriptions/history')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0]).toHaveProperty('status');
    expect(response.body.data[0]).toHaveProperty('start_date');
  });

  it('should return empty array for user with no subscriptions', async () => {
    // 구독 삭제
    await pool.query('DELETE FROM subscriptions WHERE user_id = $1', [testUser.id]);

    const response = await request(app)
      .get('/api/subscriptions/history')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toEqual([]);
  });

  it('should fail without authentication', async () => {
    const response = await request(app)
      .get('/api/subscriptions/history')
      .expect(401);

    expectErrorResponse(response, 401);
  });
});
