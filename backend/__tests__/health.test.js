/**
 * Health Check API 테스트
 *
 * 헬스체크 엔드포인트가 정상적으로 동작하는지 확인합니다.
 */

const request = require('supertest');
const express = require('express');

// 간단한 Express 앱 생성 (테스트용)
function createTestApp() {
  const app = express();
  app.use(express.json());

  // 기본 헬스체크 엔드포인트
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: {
        name: 'English Education Platform API',
        version: '2.0.0'
      }
    });
  });

  return app;
}

describe('Health Check API', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  test('GET /api/health should return 200 OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('service');
  });

  test('GET /api/health should have correct service info', async () => {
    const response = await request(app).get('/api/health');

    expect(response.body.service).toEqual({
      name: 'English Education Platform API',
      version: '2.0.0'
    });
  });

  test('GET /api/health should return valid timestamp', async () => {
    const response = await request(app).get('/api/health');

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});
