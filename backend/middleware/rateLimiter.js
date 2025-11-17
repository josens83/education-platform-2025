/**
 * Enhanced Rate Limiting Middleware
 * Different limits for different types of endpoints
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis');

// Redis client for distributed rate limiting (optional)
let redisClient = null;
let redisStore = null;

// Try to connect to Redis if available
if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    legacyMode: false,
  });

  redisClient.connect().then(() => {
    console.log('✅ Redis connected for rate limiting');
    redisStore = new RedisStore({
      client: redisClient,
      prefix: 'rl:', // Rate limit prefix
    });
  }).catch((err) => {
    console.warn('⚠️  Redis connection failed, using memory store:', err.message);
  });
}

/**
 * Default rate limiter - applies to all routes
 * 100 requests per 15 minutes
 */
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  store: redisStore, // Use Redis if available, otherwise memory store
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes to prevent brute force
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    status: 'error',
    message: '로그인 시도 횟수를 초과했습니다. 15분 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  skipSuccessfulRequests: false, // Count all requests
});

/**
 * Moderate rate limiter for mutation operations
 * 30 requests per 15 minutes
 */
const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    status: 'error',
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  skip: (req) => {
    // Skip for read operations
    return req.method === 'GET';
  },
});

/**
 * Generous rate limiter for read-only operations
 * 200 requests per 15 minutes
 */
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    status: 'error',
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  skip: (req) => {
    // Only apply to GET requests
    return req.method !== 'GET';
  },
});

/**
 * Strict limiter for file uploads
 * 10 uploads per hour
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    status: 'error',
    message: '파일 업로드 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

/**
 * Create custom rate limiter with specific options
 * @param {Object} options - Rate limiter options
 */
function createRateLimiter(options = {}) {
  return rateLimit({
    ...options,
    store: redisStore || options.store,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = {
  defaultLimiter,
  authLimiter,
  mutationLimiter,
  readLimiter,
  uploadLimiter,
  createRateLimiter,
  redisClient, // Export for cleanup
};
