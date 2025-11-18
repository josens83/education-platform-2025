/**
 * CSRF Protection Middleware
 *
 * Protects against Cross-Site Request Forgery attacks
 * Uses double-submit cookie pattern with HMAC verification
 */

const { doubleCsrf } = require('csrf-csrf');
const cookieParser = require('cookie-parser');

// CSRF Configuration
const csrfProtection = doubleCsrf({
  // Secret for HMAC signature (should be from environment variable)
  getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET || 'default-csrf-secret-change-in-production',

  // Cookie options
  cookieName: '__Host-csrf.token', // Prefixed for security
  cookieOptions: {
    sameSite: 'strict', // Strict same-site policy
    path: '/',
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent JavaScript access
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Size of the generated token
  size: 64,

  // Ignore these methods (typically safe methods don't need CSRF protection)
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],

  // Custom token retrieval from request
  getTokenFromRequest: (req) => {
    // Check multiple sources for the token
    return (
      req.headers['x-csrf-token'] || // Custom header (most common)
      req.headers['x-xsrf-token'] || // Alternative header name
      req.body?._csrf || // Form body
      req.query?._csrf // Query parameter (least preferred)
    );
  },
});

/**
 * Middleware to generate and set CSRF token
 */
const generateToken = csrfProtection.generateToken;

/**
 * Middleware to validate CSRF token
 */
const validateToken = csrfProtection.doubleCsrfProtection;

/**
 * Error handler for CSRF validation failures
 */
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN' || err.message?.includes('csrf')) {
    // Log CSRF failure attempt
    const logger = require('../lib/logger');
    logger.security('CSRF Token Validation Failed', 'high', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    });

    return res.status(403).json({
      status: 'error',
      code: 'CSRF_VALIDATION_FAILED',
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    });
  }

  next(err);
};

/**
 * Conditional CSRF protection
 * Skip CSRF for certain routes (e.g., webhooks, public API)
 */
const conditionalCsrfProtection = (req, res, next) => {
  // Skip CSRF for webhooks and public routes
  const skipRoutes = [
    '/api/payments/webhook', // Stripe webhook
    '/api/webhooks/', // All webhook routes
    '/api/health', // Health check
    '/api/public/', // Public API routes
  ];

  const shouldSkip = skipRoutes.some(route => req.path.startsWith(route));

  if (shouldSkip) {
    return next();
  }

  // Skip CSRF if Authorization header is present (API token authentication)
  // CSRF is primarily for cookie-based sessions
  const hasAuthHeader = req.headers.authorization;
  if (hasAuthHeader && !req.headers.cookie) {
    return next();
  }

  // Apply CSRF protection
  validateToken(req, res, next);
};

/**
 * Helper to get CSRF token from request
 */
const getToken = (req) => {
  return req.csrfToken ? req.csrfToken() : null;
};

module.exports = {
  cookieParser,
  generateToken,
  validateToken,
  csrfErrorHandler,
  conditionalCsrfProtection,
  getToken,
};
