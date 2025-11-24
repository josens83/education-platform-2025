/**
 * Jest Setup File
 *
 * 각 테스트 파일 실행 전에 로드됩니다.
 */

// 테스트 환경 변수 로드
require('dotenv').config({ path: '.env.test' });

// 테스트 환경 설정
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   // error: jest.fn(), // Keep error for debugging
// };
