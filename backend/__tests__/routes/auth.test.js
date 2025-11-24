/**
 * Authentication API Integration Tests
 *
 * 인증 관련 API 엔드포인트의 통합 테스트
 */

const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');
const authRouter = require('../../routes/auth');
const {
  createTestUser,
  hashPassword,
  cleanupTestDatabase,
  seedTestData,
  expectErrorResponse,
  expectSuccessResponse
} = require('../helpers/testHelpers');

// Express 앱 설정
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// 테스트 데이터베이스 연결
let pool;

beforeAll(async () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  // Mock query function
  const { query } = require('../../database');
  jest.spyOn(require('../../database'), 'query').mockImplementation((...args) => {
    return pool.query(...args);
  });

  await cleanupTestDatabase(pool);
  await seedTestData(pool);
});

afterAll(async () => {
  await pool.end();
  jest.restoreAllMocks();
});

beforeEach(async () => {
  // 각 테스트 전에 users 테이블만 정리
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const userData = createTestUser({
      email: 'newuser@example.com',
      password: 'Test1234!',
      username: 'New User'
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expectSuccessResponse(response, 201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.user.username).toBe(userData.username);
    expect(response.body.data.user).not.toHaveProperty('password_hash');
  });

  it('should fail with invalid email', async () => {
    const userData = createTestUser({
      email: 'invalid-email',
      password: 'Test1234!',
      username: 'Test User'
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expectErrorResponse(response, 400);
    expect(response.body.errors).toBeDefined();
  });

  it('should fail with short password', async () => {
    const userData = createTestUser({
      email: 'test@example.com',
      password: '123',
      username: 'Test User'
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expectErrorResponse(response, 400);
  });

  it('should fail with duplicate email', async () => {
    const userData = createTestUser({
      email: 'duplicate@example.com',
      password: 'Test1234!',
      username: 'First User'
    });

    // 첫 번째 사용자 등록
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // 같은 이메일로 다시 등록 시도
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...userData, username: 'Second User' })
      .expect(409);

    expectErrorResponse(response, 409);
    expect(response.body.message).toMatch(/이미 사용 중인 이메일/);
  });

  it('should fail with missing required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' })
      .expect(400);

    expectErrorResponse(response, 400);
  });
});

describe('POST /api/auth/login', () => {
  let testUser;
  const testPassword = 'Test1234!';

  beforeEach(async () => {
    // 테스트 사용자 생성
    const passwordHash = await hashPassword(testPassword);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username, role, email_verified)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email, username, role`,
      ['testlogin@example.com', passwordHash, 'Test User', 'student']
    );
    testUser = result.rows[0];

    // 프로필 생성
    await pool.query(
      `INSERT INTO user_profiles (user_id, full_name)
       VALUES ($1, $2)`,
      [testUser.id, testUser.username]
    );
  });

  it('should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testPassword
      })
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe(testUser.email);
  });

  it('should fail with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!'
      })
      .expect(401);

    expectErrorResponse(response, 401);
  });

  it('should fail with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: testPassword
      })
      .expect(401);

    expectErrorResponse(response, 401);
  });

  it('should fail with missing credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email
      })
      .expect(400);

    expectErrorResponse(response, 400);
  });

  it('should fail with invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: testPassword
      })
      .expect(400);

    expectErrorResponse(response, 400);
  });
});

describe('POST /api/auth/forgot-password', () => {
  let testUser;

  beforeEach(async () => {
    // 테스트 사용자 생성
    const passwordHash = await hashPassword('Test1234!');
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username, role, email_verified)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email`,
      ['forgot@example.com', passwordHash, 'Test User', 'student']
    );
    testUser = result.rows[0];
  });

  it('should send password reset email for valid user', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email })
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.message).toMatch(/비밀번호 재설정/);

    // 데이터베이스에 리셋 토큰이 저장되었는지 확인
    const user = await pool.query(
      'SELECT password_reset_token, password_reset_expires FROM users WHERE id = $1',
      [testUser.id]
    );
    expect(user.rows[0].password_reset_token).toBeTruthy();
    expect(user.rows[0].password_reset_expires).toBeTruthy();
  });

  it('should still return success for non-existent email (security)', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' })
      .expect(200);

    expectSuccessResponse(response);
    // 보안을 위해 사용자가 존재하지 않아도 성공 메시지 반환
  });

  it('should fail with invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'invalid-email' })
      .expect(400);

    expectErrorResponse(response, 400);
  });
});

describe('POST /api/auth/reset-password', () => {
  let testUser;
  let resetToken;

  beforeEach(async () => {
    // 테스트 사용자 생성
    const passwordHash = await hashPassword('OldPassword123!');
    resetToken = 'test-reset-token';
    const crypto = require('crypto');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1시간 후

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username, role, email_verified, password_reset_token, password_reset_expires)
       VALUES ($1, $2, $3, $4, true, $5, $6)
       RETURNING id, email`,
      ['reset@example.com', passwordHash, 'Test User', 'student', resetTokenHash, resetExpires]
    );
    testUser = result.rows[0];
  });

  it('should reset password with valid token', async () => {
    const newPassword = 'NewPassword123!';

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        password: newPassword
      })
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.message).toMatch(/비밀번호가 성공적으로 재설정/);

    // 비밀번호가 변경되었는지 확인
    const user = await pool.query(
      'SELECT password_reset_token FROM users WHERE id = $1',
      [testUser.id]
    );
    expect(user.rows[0].password_reset_token).toBeNull();
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalid-token',
        password: 'NewPassword123!'
      })
      .expect(400);

    expectErrorResponse(response, 400);
  });

  it('should fail with short password', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        password: '123'
      })
      .expect(400);

    expectErrorResponse(response, 400);
  });

  it('should fail with expired token', async () => {
    // 토큰을 만료시킴
    await pool.query(
      'UPDATE users SET password_reset_expires = $1 WHERE id = $2',
      [new Date(Date.now() - 3600000), testUser.id] // 1시간 전
    );

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        password: 'NewPassword123!'
      })
      .expect(400);

    expectErrorResponse(response, 400);
  });
});

describe('POST /api/auth/verify-email', () => {
  let testUser;
  let verificationToken;

  beforeEach(async () => {
    const passwordHash = await hashPassword('Test1234!');
    verificationToken = 'test-verification-token';
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 24 * 3600000); // 24시간 후

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username, role, email_verified, email_verification_token, email_verification_expires)
       VALUES ($1, $2, $3, $4, false, $5, $6)
       RETURNING id, email`,
      ['verify@example.com', passwordHash, 'Test User', 'student', tokenHash, tokenExpires]
    );
    testUser = result.rows[0];
  });

  it('should verify email with valid token', async () => {
    const response = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: verificationToken })
      .expect(200);

    expectSuccessResponse(response);
    expect(response.body.message).toMatch(/이메일 인증이 완료/);

    // 이메일이 인증되었는지 확인
    const user = await pool.query(
      'SELECT email_verified, email_verification_token FROM users WHERE id = $1',
      [testUser.id]
    );
    expect(user.rows[0].email_verified).toBe(true);
    expect(user.rows[0].email_verification_token).toBeNull();
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: 'invalid-token' })
      .expect(400);

    expectErrorResponse(response, 400);
  });

  it('should fail with expired token', async () => {
    await pool.query(
      'UPDATE users SET email_verification_expires = $1 WHERE id = $2',
      [new Date(Date.now() - 3600000), testUser.id]
    );

    const response = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: verificationToken })
      .expect(400);

    expectErrorResponse(response, 400);
  });
});
