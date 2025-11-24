/**
 * Payments API Integration Tests
 *
 * 결제 관련 API 엔드포인트의 통합 테스트
 * Stripe 기능은 모킹하여 테스트합니다.
 */

const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');
const paymentsRouter = require('../../routes/payments');
const {
  generateTestToken,
  hashPassword,
  cleanupTestDatabase,
  seedTestData,
  expectErrorResponse,
  expectSuccessResponse
} = require('../helpers/testHelpers');

// Stripe 모킹
jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn(async (params) => {
          return {
            id: 'cs_test_mock_session_id',
            url: 'https://checkout.stripe.com/pay/cs_test_mock',
            payment_status: 'unpaid',
            customer_email: params.customer_email,
            metadata: params.metadata
          };
        }),
        retrieve: jest.fn(async (sessionId) => {
          return {
            id: sessionId,
            payment_status: 'paid',
            customer_email: 'test@example.com',
            metadata: {
              user_id: '1',
              plan_id: '1',
              plan_name: 'Test Plan'
            }
          };
        })
      }
    },
    webhookEndpoints: {
      create: jest.fn()
    }
  }));
});

// Express 앱 설정
const app = express();
app.use(express.json());
app.use('/api/payments', paymentsRouter);

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
    ['payuser@example.com', passwordHash, 'Pay User', 'student']
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
  await pool.query('TRUNCATE TABLE payments RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE subscriptions RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  jest.clearAllMocks();
});

describe('POST /api/payments/create-checkout-session', () => {
  it('should create Stripe checkout session for paid plan', async () => {
    const response = await request(app)
      .post('/api/payments/create-checkout-session')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ plan_id: testPlanId })
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toHaveProperty('sessionId');
    expect(response.body.data).toHaveProperty('url');
    expect(response.body.data.url).toMatch(/stripe\.com/);
  });

  it('should handle free trial without Stripe', async () => {
    // 무료 플랜 생성
    const freePlanResult = await pool.query(
      `INSERT INTO subscription_plans (name, description, price, duration_days, features, stripe_price_id, is_active)
       VALUES ('Free Trial', 'Free trial plan', 0, 7, '["basic"]', 'price_free', true)
       RETURNING id`,
      []
    );
    const freePlanId = freePlanResult.rows[0].id;

    const response = await request(app)
      .post('/api/payments/create-checkout-session')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ plan_id: freePlanId })
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.isFree).toBe(true);
    expect(response.body).not.toHaveProperty('sessionId');
  });

  it('should fail without authentication', async () => {
    const response = await request(app)
      .post('/api/payments/create-checkout-session')
      .send({ plan_id: testPlanId })
      .expect(401);

    expectErrorResponse(response, 401);
  });

  it('should fail with invalid plan_id', async () => {
    const response = await request(app)
      .post('/api/payments/create-checkout-session')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ plan_id: 99999 })
      .expect(404);

    expectErrorResponse(response, 404);
  });

  it('should fail without plan_id', async () => {
    const response = await request(app)
      .post('/api/payments/create-checkout-session')
      .set('Authorization', `Bearer ${testToken}`)
      .send({})
      .expect(400);

    expectErrorResponse(response, 400);
  });
});

describe('GET /api/payments/verify-session/:sessionId', () => {
  it('should verify successful payment session', async () => {
    const sessionId = 'cs_test_mock_session_id';

    const response = await request(app)
      .get(`/api/payments/verify-session/${sessionId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toHaveProperty('payment_status');
    expect(response.body.data.payment_status).toBe('paid');
  });

  it('should fail without authentication', async () => {
    const response = await request(app)
      .get('/api/payments/verify-session/cs_test_mock')
      .expect(401);

    expectErrorResponse(response, 401);
  });

  it('should fail with invalid session ID format', async () => {
    const response = await request(app)
      .get('/api/payments/verify-session/invalid')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(400);

    expectErrorResponse(response, 400);
  });
});

describe('GET /api/payments/history', () => {
  beforeEach(async () => {
    // 테스트용 결제 이력 생성
    await pool.query(
      `INSERT INTO payments (user_id, amount, currency, status, payment_method, stripe_payment_id)
       VALUES
         ($1, 9.99, 'USD', 'succeeded', 'stripe', 'pi_test_1'),
         ($1, 19.99, 'USD', 'succeeded', 'stripe', 'pi_test_2'),
         ($1, 29.99, 'USD', 'failed', 'stripe', 'pi_test_3')`,
      [testUser.id]
    );
  });

  it('should return payment history', async () => {
    const response = await request(app)
      .get('/api/payments/history')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(3);
    expect(response.body.data[0]).toHaveProperty('amount');
    expect(response.body.data[0]).toHaveProperty('status');
    expect(response.body.data[0]).toHaveProperty('created_at');
  });

  it('should return empty array for user with no payments', async () => {
    await pool.query('DELETE FROM payments WHERE user_id = $1', [testUser.id]);

    const response = await request(app)
      .get('/api/payments/history')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toEqual([]);
  });

  it('should support pagination', async () => {
    const response = await request(app)
      .get('/api/payments/history?limit=2&offset=0')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });

  it('should filter by status', async () => {
    const response = await request(app)
      .get('/api/payments/history?status=succeeded')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    response.body.data.forEach(payment => {
      expect(payment.status).toBe('succeeded');
    });
  });

  it('should fail without authentication', async () => {
    const response = await request(app)
      .get('/api/payments/history')
      .expect(401);

    expectErrorResponse(response, 401);
  });
});

describe('POST /api/payments/webhook', () => {
  it('should handle successful payment webhook', async () => {
    const webhookPayload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_webhook',
          payment_status: 'paid',
          customer_email: testUser.email,
          amount_total: 999,
          currency: 'usd',
          metadata: {
            user_id: testUser.id.toString(),
            plan_id: testPlanId.toString(),
            plan_name: 'Test Plan'
          }
        }
      }
    };

    const response = await request(app)
      .post('/api/payments/webhook')
      .send(webhookPayload)
      .expect(200);

    expectSuccessResponse(response);

    // 결제 기록이 생성되었는지 확인
    const payment = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1',
      [testUser.id]
    );
    expect(payment.rows.length).toBeGreaterThan(0);
  });

  it('should handle payment_intent.succeeded webhook', async () => {
    const webhookPayload = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_webhook',
          amount: 999,
          currency: 'usd',
          status: 'succeeded'
        }
      }
    };

    const response = await request(app)
      .post('/api/payments/webhook')
      .send(webhookPayload)
      .expect(200);

    expectSuccessResponse(response);
  });

  it('should handle unknown webhook types gracefully', async () => {
    const webhookPayload = {
      type: 'unknown.event.type',
      data: {
        object: {}
      }
    };

    const response = await request(app)
      .post('/api/payments/webhook')
      .send(webhookPayload)
      .expect(200);

    expectSuccessResponse(response);
  });
});

describe('GET /api/payments/stats', () => {
  beforeEach(async () => {
    // 테스트용 결제 데이터 생성
    await pool.query(
      `INSERT INTO payments (user_id, amount, currency, status, payment_method, created_at)
       VALUES
         ($1, 9.99, 'USD', 'succeeded', 'stripe', NOW()),
         ($1, 19.99, 'USD', 'succeeded', 'stripe', NOW() - INTERVAL '1 month'),
         ($1, 29.99, 'USD', 'failed', 'stripe', NOW())`,
      [testUser.id]
    );
  });

  it('should return payment statistics', async () => {
    const response = await request(app)
      .get('/api/payments/stats')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data).toHaveProperty('totalPaid');
    expect(response.body.data).toHaveProperty('totalPayments');
    expect(response.body.data).toHaveProperty('successRate');
    expect(response.body.data.totalPayments).toBeGreaterThan(0);
  });

  it('should return zero stats for user with no payments', async () => {
    await pool.query('DELETE FROM payments WHERE user_id = $1', [testUser.id]);

    const response = await request(app)
      .get('/api/payments/stats')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.data.totalPaid).toBe(0);
    expect(response.body.data.totalPayments).toBe(0);
  });

  it('should fail without authentication', async () => {
    const response = await request(app)
      .get('/api/payments/stats')
      .expect(401);

    expectErrorResponse(response, 401);
  });
});
