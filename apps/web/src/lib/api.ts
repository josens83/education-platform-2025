import { createApiClient } from '@education-platform/api-client';

/**
 * API 클라이언트 인스턴스
 * 환경 변수에서 API URL을 가져오거나 기본값 사용
 */
export const api = createApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 30000,
});

/**
 * API 클라이언트 초기화
 * - 로컬 스토리지에서 토큰을 읽어 설정
 */
export function initializeApi() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed.state?.token) {
        api.setToken(parsed.state.token);
      }
    }
  } catch (error) {
    console.error('Failed to initialize API client:', error);
  }
}
