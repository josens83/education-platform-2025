/**
 * Sentry Configuration
 *
 * Production-grade error tracking and monitoring
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry for Node.js backend
 */
function initSentry(app) {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  // Only enable Sentry if DSN is configured
  if (!dsn) {
    console.log('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in production

    // Profiling
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,

    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),

      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),

      // Enable profiling
      new ProfilingIntegration(),
    ],

    // Release tracking
    release: process.env.npm_package_version,

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Network errors that are expected
      'NetworkError',
      'Network request failed',
      // User cancellations
      'AbortError',
    ],

    // Before sending events, modify or filter them
    beforeSend(event, hint) {
      // Don't send events in development (unless explicitly enabled)
      if (environment === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }

      // Filter out sensitive data from request headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Add custom fingerprinting for better grouping
      if (event.exception?.values?.[0]) {
        const error = event.exception.values[0];
        event.fingerprint = [
          error.type || 'Error',
          error.value || 'Unknown',
          event.transaction || 'unknown',
        ];
      }

      return event;
    },
  });

  console.log(`✅ Sentry initialized (${environment})`);
}

/**
 * Get Sentry request handler (must be first middleware)
 */
function requestHandler() {
  return Sentry.Handlers.requestHandler();
}

/**
 * Get Sentry tracing handler (must be after request handler)
 */
function tracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

/**
 * Get Sentry error handler (must be before other error handlers)
 */
function errorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors with status code >= 500
      if (error.status && error.status >= 500) {
        return true;
      }
      // Capture specific error types
      return true;
    },
  });
}

/**
 * Capture exception manually
 */
function captureException(error, context = {}) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message manually
 */
function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context
 */
function setUser(user) {
  Sentry.setUser(user ? {
    id: user.id,
    email: user.email,
    username: user.username,
  } : null);
}

/**
 * Add breadcrumb
 */
function addBreadcrumb(breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

module.exports = {
  initSentry,
  requestHandler,
  tracingHandler,
  errorHandler,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  Sentry,
};
