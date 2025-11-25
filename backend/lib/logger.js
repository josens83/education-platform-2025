/**
 * Winston Logger - Production-Grade Structured Logging
 * Elite Developer Methodology - Observability & Monitoring
 *
 * Features:
 * - Structured JSON logging
 * - Daily log rotation
 * - Multiple transports (console, file, error file)
 * - Automatic cleanup of old logs
 * - Performance optimized
 * - Environment-aware configuration
 * - Correlation IDs for request tracking
 * - Distributed tracing support
 * - Grafana Loki integration
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

/**
 * Custom format for console output (human-readable)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      // Remove empty objects and null values
      const cleanMeta = Object.fromEntries(
        Object.entries(meta).filter(([_, v]) => v != null && v !== '')
      );
      if (Object.keys(cleanMeta).length > 0) {
        metaStr = `\n${JSON.stringify(cleanMeta, null, 2)}`;
      }
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Format for file output (JSON structured logging)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Add correlation ID and tracing context to logs
 */
const addCorrelationId = winston.format((info) => {
  // Get correlation ID from async local storage or generate new one
  const correlationId = info.correlationId || global.requestContext?.correlationId || uuidv4();
  info.correlationId = correlationId;

  // Add tracing information if available
  if (global.requestContext?.traceId) {
    info.traceId = global.requestContext.traceId;
    info.spanId = global.requestContext.spanId;
  }

  // Add service information
  info.service = 'education-platform-backend';
  info.environment = process.env.NODE_ENV || 'development';
  info.hostname = require('os').hostname();

  return info;
});

/**
 * Loki-compatible format
 */
const lokiFormat = winston.format.combine(
  winston.format.timestamp(),
  addCorrelationId(),
  winston.format.json()
);

/**
 * Transports configuration
 */
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    level: logLevel,
  })
);

// File transports (enabled in production or if explicitly enabled)
if (isProduction || process.env.ENABLE_FILE_LOGGING === 'true') {
  // All logs (daily rotation)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m', // Rotate when file reaches 20MB
      maxFiles: '30d', // Keep logs for 30 days
      format: fileFormat,
      level: logLevel,
    })
  );

  // Error logs only (daily rotation)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d', // Keep error logs for 90 days
      format: fileFormat,
      level: 'error',
    })
  );

  // Combined all logs (for debugging, short retention)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '7d', // Keep combined logs for 7 days only
      format: fileFormat,
      level: 'debug',
    })
  );
}

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(addCorrelationId(), fileFormat),
  transports,
  exitOnError: false, // Don't exit on handled exceptions
  silent: process.env.NODE_ENV === 'test', // Silence logs in test environment
});

/**
 * Enhanced logging methods with context
 */

/**
 * Log HTTP request
 */
logger.request = (req, res, duration) => {
  const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

  logger.log(level, `HTTP ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    category: 'http',
  });
};

/**
 * Log database query
 */
logger.query = (query, params, duration) => {
  logger.debug('Database Query', {
    query: query.substring(0, 200), // Truncate long queries
    params,
    duration: `${duration}ms`,
    category: 'database',
  });
};

/**
 * Log authentication events
 */
logger.auth = (event, userId, success, meta = {}) => {
  const level = success ? 'info' : 'warn';
  logger.log(level, `Auth: ${event}`, {
    event,
    userId,
    success,
    category: 'auth',
    ...meta,
  });
};

/**
 * Log payment events
 */
logger.payment = (event, userId, amount, success, meta = {}) => {
  const level = success ? 'info' : 'error';
  logger.log(level, `Payment: ${event}`, {
    event,
    userId,
    amount,
    currency: meta.currency || 'USD',
    success,
    category: 'payment',
    ...meta,
  });
};

/**
 * Log system events
 */
logger.system = (event, meta = {}) => {
  logger.info(`System: ${event}`, {
    event,
    category: 'system',
    ...meta,
  });
};

/**
 * Log security events
 */
logger.security = (event, severity = 'medium', meta = {}) => {
  const level = severity === 'high' || severity === 'critical' ? 'error' : 'warn';
  logger.log(level, `Security: ${event}`, {
    event,
    severity,
    category: 'security',
    ...meta,
  });
};

/**
 * Log performance metrics
 */
logger.performance = (operation, duration, meta = {}) => {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger.log(level, `Performance: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    category: 'performance',
    ...meta,
  });
};

/**
 * Log email events
 */
logger.email = (event, recipient, success, meta = {}) => {
  const level = success ? 'info' : 'error';
  logger.log(level, `Email: ${event}`, {
    event,
    recipient,
    success,
    category: 'email',
    ...meta,
  });
};

/**
 * Log AI/ML events
 */
logger.ai = (event, model, success, meta = {}) => {
  const level = success ? 'info' : 'error';
  logger.log(level, `AI: ${event}`, {
    event,
    model,
    success,
    category: 'ai',
    ...meta,
  });
};

/**
 * Log cache events
 */
logger.cache = (event, key, hit, meta = {}) => {
  logger.debug(`Cache: ${event}`, {
    event,
    key,
    hit,
    category: 'cache',
    ...meta,
  });
};

/**
 * Stream for Morgan HTTP logger middleware
 */
logger.stream = {
  write: (message) => {
    logger.info(message.trim(), { category: 'http' });
  },
};

/**
 * Graceful shutdown
 */
logger.close = () => {
  return new Promise((resolve) => {
    logger.on('finish', resolve);
    logger.end();
  });
};

/**
 * Create child logger with additional context
 */
logger.child = (context = {}) => {
  return {
    ...logger,
    defaultMeta: { ...logger.defaultMeta, ...context },
    log: (level, message, meta = {}) => {
      logger.log(level, message, { ...context, ...meta });
    },
    error: (message, meta = {}) => logger.error(message, { ...context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { ...context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { ...context, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { ...context, ...meta }),
  };
};

/**
 * Express middleware to add correlation ID to requests
 */
logger.correlationMiddleware = (req, res, next) => {
  const correlationId = req.get('X-Correlation-ID') || req.get('X-Request-ID') || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  // Store in global context for child processes
  global.requestContext = {
    correlationId,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  // Clean up after request completes
  res.on('finish', () => {
    delete global.requestContext;
  });

  next();
};

/**
 * Log uncaught exceptions and unhandled rejections
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    category: 'fatal',
  });
  // Give logger time to write before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
    category: 'fatal',
  });
});

/**
 * Log process warnings
 */
process.on('warning', (warning) => {
  logger.warn('Process Warning', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
    category: 'system',
  });
});

/**
 * Log startup message
 */
if (!process.env.NODE_ENV === 'test') {
  logger.info('Logger initialized', {
    level: logLevel,
    environment: process.env.NODE_ENV,
    fileLoggingEnabled: isProduction || process.env.ENABLE_FILE_LOGGING === 'true',
    logsDirectory: logsDir,
  });
}

module.exports = logger;
