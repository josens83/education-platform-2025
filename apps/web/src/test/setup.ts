import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// 각 테스트 후 자동으로 cleanup
afterEach(() => {
  cleanup();
});

// Custom matchers
expect.extend({
  // 필요한 경우 커스텀 매처 추가
});

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
vi.stubEnv('VITE_SITE_URL', 'http://localhost:3000');
