module.exports = {
  // 테스트 환경
  testEnvironment: 'node',

  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],

  // 커버리지 수집 대상
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/uploads/**',
    '!**/logs/**',
    '!jest.config.js'
  ],

  // 커버리지 리포트 형식
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ],

  // 커버리지 디렉토리
  coverageDirectory: 'coverage',

  // 커버리지 임계값 (Elite Developer Methodology)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // 테스트 타임아웃 (10초)
  testTimeout: 10000,

  // 글로벌 설정
  globalSetup: './__tests__/setup.js',
  globalTeardown: './__tests__/teardown.js',

  // 테스트 전 환경 변수 로드
  setupFiles: ['<rootDir>/__tests__/setupEnv.js'],

  // 자동 모킹 비활성화
  automock: false,

  // 변환 무시 패턴
  transformIgnorePatterns: [
    '/node_modules/'
  ],

  // 상세한 출력
  verbose: true,

  // 실패 시 빠른 종료 비활성화
  bail: false,

  // 병렬 실행
  maxWorkers: '50%',

  // 테스트 결과 알림 비활성화
  notify: false,

  // 캐시 사용
  cache: true,
};
