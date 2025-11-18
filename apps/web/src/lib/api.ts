import { createApiClient } from '@education-platform/api-client';
import axios, { AxiosError } from 'axios';

/**
 * API 클라이언트 인스턴스
 * 환경 변수에서 API URL을 가져오거나 기본값 사용
 */
export const api = createApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 30000,
});

/**
 * Axios retry configuration
 */
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Determine if request should be retried
 */
function shouldRetry(error: AxiosError): boolean {
  // Don't retry if no response (network error, timeout)
  if (!error.response) {
    return true;
  }

  const status = error.response.status;

  // Retry on 5xx server errors
  if (status >= 500 && status < 600) {
    return true;
  }

  // Retry on 429 (rate limit)
  if (status === 429) {
    return true;
  }

  // Don't retry on 4xx client errors (except 429)
  return false;
}

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(retryCount: number): number {
  return RETRY_DELAY * Math.pow(2, retryCount);
}

/**
 * Setup retry interceptor
 */
function setupRetryInterceptor() {
  api.client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;

      // Initialize retry count
      if (!config.__retryCount) {
        config.__retryCount = 0;
      }

      // Check if we should retry
      if (config.__retryCount >= MAX_RETRIES || !shouldRetry(error)) {
        return Promise.reject(error);
      }

      // Increment retry count
      config.__retryCount += 1;

      // Calculate delay
      const delay = getRetryDelay(config.__retryCount);

      console.log(
        `Retrying request (${config.__retryCount}/${MAX_RETRIES}) after ${delay}ms:`,
        config.url
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return api.client(config);
    }
  );
}

/**
 * API 클라이언트 초기화
 * - 로컬 스토리지에서 토큰을 읽어 설정
 * - Retry interceptor 설정
 */
export function initializeApi() {
  try {
    // Setup retry interceptor
    setupRetryInterceptor();

    // Load token from localStorage
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
