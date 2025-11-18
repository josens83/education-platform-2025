/**
 * CSRF Token Management
 *
 * Handles CSRF token retrieval and automatic inclusion in API requests
 */

import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * CSRF Token Storage
 */
let csrfToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

/**
 * Fetch CSRF token from server
 */
async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await axios.get(`${apiUrl}/api/csrf-token`, {
      withCredentials: true, // Important for cookie-based CSRF
    });

    if (response.data.status === 'success' && response.data.token) {
      csrfToken = response.data.token;
      return csrfToken;
    }

    throw new Error('Failed to fetch CSRF token');
  } catch (error) {
    console.error('CSRF token fetch error:', error);
    throw error;
  }
}

/**
 * Get CSRF token (with caching)
 *
 * @param forceRefresh - Force fetch a new token
 * @returns Promise<string> - CSRF token
 */
export async function getCsrfToken(forceRefresh = false): Promise<string> {
  // Return cached token if available
  if (csrfToken && !forceRefresh) {
    return csrfToken;
  }

  // If a fetch is already in progress, reuse it
  if (tokenFetchPromise && !forceRefresh) {
    return tokenFetchPromise;
  }

  // Fetch new token
  tokenFetchPromise = fetchCsrfToken();

  try {
    const token = await tokenFetchPromise;
    tokenFetchPromise = null;
    return token;
  } catch (error) {
    tokenFetchPromise = null;
    throw error;
  }
}

/**
 * Clear cached CSRF token
 * Call this after logout or when token becomes invalid
 */
export function clearCsrfToken() {
  csrfToken = null;
  tokenFetchPromise = null;
}

/**
 * Setup axios interceptor to automatically include CSRF token
 */
export function setupCsrfInterceptor() {
  // Request interceptor - add CSRF token to headers
  axios.interceptors.request.use(
    async (config) => {
      // Only add CSRF token for mutation requests (POST, PUT, PATCH, DELETE)
      const mutationMethods = ['post', 'put', 'patch', 'delete'];
      const method = config.method?.toLowerCase();

      if (method && mutationMethods.includes(method)) {
        try {
          const token = await getCsrfToken();
          config.headers['X-CSRF-Token'] = token;
        } catch (error) {
          console.error('Failed to add CSRF token to request:', error);
          // Continue with request even if CSRF token fetch fails
        }
      }

      // Ensure credentials are included (for cookies)
      config.withCredentials = true;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle CSRF errors
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If CSRF validation failed and we haven't retried yet
      if (
        error.response?.status === 403 &&
        error.response?.data?.code === 'CSRF_VALIDATION_FAILED' &&
        !originalRequest._csrfRetry
      ) {
        originalRequest._csrfRetry = true;

        // Fetch new CSRF token
        try {
          const token = await getCsrfToken(true);
          originalRequest.headers['X-CSRF-Token'] = token;

          // Retry the original request
          return axios(originalRequest);
        } catch (retryError) {
          console.error('Failed to retry request with new CSRF token:', retryError);
        }
      }

      return Promise.reject(error);
    }
  );

  console.log('✅ CSRF interceptor configured');
}

/**
 * Manual CSRF token header for custom fetch requests
 *
 * @example
 * const headers = await getCsrfHeaders();
 * fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: { ...headers, 'Content-Type': 'application/json' },
 *   credentials: 'include',
 *   body: JSON.stringify(data),
 * });
 */
export async function getCsrfHeaders(): Promise<{ 'X-CSRF-Token': string }> {
  const token = await getCsrfToken();
  return {
    'X-CSRF-Token': token,
  };
}

/**
 * Check if CSRF protection is enabled
 */
export function isCsrfEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_CSRF !== 'false';
}

/**
 * Initialize CSRF protection on app startup
 */
export async function initCsrf() {
  if (!isCsrfEnabled()) {
    console.log('⚠️  CSRF protection is disabled');
    return;
  }

  try {
    // Setup interceptor
    setupCsrfInterceptor();

    // Pre-fetch CSRF token
    await getCsrfToken();

    console.log('✅ CSRF protection initialized');
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
  }
}
