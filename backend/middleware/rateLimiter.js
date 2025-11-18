const rateLimit = require('express-rate-limit');

/**
 * 일반 API 요청에 대한 Rate Limiter
 * - 15분당 100개 요청
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 요청 수
  message: {
    status: 'error',
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '15분'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
});

/**
 * 인증 엔드포인트에 대한 Rate Limiter (더 엄격)
 * - 15분당 5개 요청
 * - 로그인, 회원가입 등 인증 관련 엔드포인트에 적용
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 요청 수
  message: {
    status: 'error',
    message: '너무 많은 로그인 시도가 감지되었습니다. 15분 후 다시 시도해주세요.',
    retryAfter: '15분'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 성공한 요청은 카운트하지 않음
});

/**
 * 비밀번호 재설정 엔드포인트에 대한 Rate Limiter (매우 엄격)
 * - 1시간당 3개 요청
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 요청 수
  message: {
    status: 'error',
    message: '비밀번호 재설정 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.',
    retryAfter: '1시간'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * 결제 엔드포인트에 대한 Rate Limiter
 * - 15분당 10개 요청
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 최대 요청 수
  message: {
    status: 'error',
    message: '결제 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '15분'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * 관리자 API에 대한 Rate Limiter
 * - 15분당 200개 요청 (관리자는 더 많은 작업 수행)
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 200, // 최대 요청 수
  message: {
    status: 'error',
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '15분'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * 파일 업로드 엔드포인트에 대한 Rate Limiter
 * - 1시간당 20개 요청
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 20, // 최대 요청 수
  message: {
    status: 'error',
    message: '파일 업로드 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.',
    retryAfter: '1시간'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Aliases for backward compatibility
const defaultLimiter = apiLimiter;
const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 쓰기 작업은 더 제한적
  message: {
    status: 'error',
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '15분'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // 읽기 작업은 더 관대하게
  message: {
    status: 'error',
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '15분'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  // Primary exports
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  paymentLimiter,
  adminLimiter,
  uploadLimiter,
  // Aliases for server.js
  defaultLimiter,
  mutationLimiter,
  readLimiter
};
