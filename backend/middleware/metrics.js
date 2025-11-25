/**
 * Prometheus Metrics Middleware
 * Elite Developer Methodology - Observability & Monitoring
 *
 * Collects and exposes application metrics for Prometheus scraping
 */

const promClient = require('prom-client');

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'education_platform_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Custom metrics

// HTTP Request Duration
const httpRequestDuration = new promClient.Histogram({
  name: 'education_platform_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// HTTP Request Total
const httpRequestTotal = new promClient.Counter({
  name: 'education_platform_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active Connections
const activeConnections = new promClient.Gauge({
  name: 'education_platform_active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Database Query Duration
const dbQueryDuration = new promClient.Histogram({
  name: 'education_platform_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

// Database Query Total
const dbQueryTotal = new promClient.Counter({
  name: 'education_platform_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
  registers: [register],
});

// Redis Operations
const redisOperationDuration = new promClient.Histogram({
  name: 'education_platform_redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1],
  registers: [register],
});

// API Errors
const apiErrors = new promClient.Counter({
  name: 'education_platform_api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['route', 'error_type', 'status_code'],
  registers: [register],
});

// Business Metrics

// User Registrations
const userRegistrations = new promClient.Counter({
  name: 'education_platform_user_registrations_total',
  help: 'Total number of user registrations',
  registers: [register],
});

// User Logins
const userLogins = new promClient.Counter({
  name: 'education_platform_user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['method'], // password, google, kakao
  registers: [register],
});

// Active Users
const activeUsers = new promClient.Gauge({
  name: 'education_platform_active_users',
  help: 'Number of currently active users',
  registers: [register],
});

// Subscription Events
const subscriptionEvents = new promClient.Counter({
  name: 'education_platform_subscription_events_total',
  help: 'Total number of subscription events',
  labelNames: ['event_type'], // created, cancelled, renewed
  registers: [register],
});

// Payment Transactions
const paymentTransactions = new promClient.Counter({
  name: 'education_platform_payment_transactions_total',
  help: 'Total number of payment transactions',
  labelNames: ['status'], // success, failed
  registers: [register],
});

// Payment Amount
const paymentAmount = new promClient.Counter({
  name: 'education_platform_payment_amount_total',
  help: 'Total payment amount in currency',
  labelNames: ['currency'],
  registers: [register],
});

// Content Views
const contentViews = new promClient.Counter({
  name: 'education_platform_content_views_total',
  help: 'Total number of content views',
  labelNames: ['content_type'], // book, audio, video
  registers: [register],
});

// Middleware function
function metricsMiddleware(req, res, next) {
  // Increment active connections
  activeConnections.inc();

  // Start timer
  const start = Date.now();

  // Track response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = (Date.now() - start) / 1000;

    // Get route pattern (remove IDs)
    const route = req.route ? req.route.path : req.path;
    const sanitizedRoute = route.replace(/\/\d+/g, '/:id');

    // Record metrics
    httpRequestDuration.observe(
      {
        method: req.method,
        route: sanitizedRoute,
        status_code: res.statusCode,
      },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route: sanitizedRoute,
      status_code: res.statusCode,
    });

    // Track errors
    if (res.statusCode >= 400) {
      apiErrors.inc({
        route: sanitizedRoute,
        error_type: res.statusCode >= 500 ? 'server_error' : 'client_error',
        status_code: res.statusCode,
      });
    }

    // Decrement active connections
    activeConnections.dec();

    return originalSend.call(this, data);
  };

  next();
}

// Helper functions for business metrics
const metrics = {
  // User metrics
  recordUserRegistration: () => {
    userRegistrations.inc();
  },

  recordUserLogin: (method = 'password') => {
    userLogins.inc({ method });
  },

  setActiveUsers: (count) => {
    activeUsers.set(count);
  },

  // Subscription metrics
  recordSubscription: (eventType) => {
    subscriptionEvents.inc({ event_type: eventType });
  },

  // Payment metrics
  recordPayment: (status, amount, currency = 'KRW') => {
    paymentTransactions.inc({ status });
    if (status === 'success') {
      paymentAmount.inc({ currency }, amount);
    }
  },

  // Content metrics
  recordContentView: (contentType) => {
    contentViews.inc({ content_type: contentType });
  },

  // Database metrics
  recordDbQuery: (operation, table, duration, status = 'success') => {
    dbQueryDuration.observe({ operation, table }, duration);
    dbQueryTotal.inc({ operation, table, status });
  },

  // Redis metrics
  recordRedisOperation: (operation, duration) => {
    redisOperationDuration.observe({ operation }, duration);
  },

  // General error tracking
  recordError: (route, errorType, statusCode) => {
    apiErrors.inc({ route, error_type: errorType, status_code: statusCode });
  },
};

// Metrics endpoint handler
function metricsHandler(req, res) {
  res.set('Content-Type', register.contentType);
  register.metrics().then((metrics) => {
    res.send(metrics);
  });
}

module.exports = {
  metricsMiddleware,
  metricsHandler,
  metrics,
  register,
};
