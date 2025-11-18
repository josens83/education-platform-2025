const fs = require('fs');
const path = require('path');

/**
 * Simple logging system for production
 * Logs to both console and file
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Colors for console output
const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gray
  RESET: '\x1b[0m'
};

/**
 * Format log message
 */
function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaStr}`.trim();
}

/**
 * Write log to file
 */
function writeToFile(level, message, meta) {
  const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
  const allLogsFile = path.join(logsDir, 'all.log');
  const formattedMessage = formatMessage(level, message, meta) + '\n';

  // Write to level-specific log file
  fs.appendFileSync(logFile, formattedMessage);

  // Write to all logs file
  fs.appendFileSync(allLogsFile, formattedMessage);
}

/**
 * Log to console with colors
 */
function logToConsole(level, message, meta) {
  const color = COLORS[level] || COLORS.RESET;
  const formattedMessage = formatMessage(level, message, meta);
  console.log(`${color}${formattedMessage}${COLORS.RESET}`);
}

/**
 * Main log function
 */
function log(level, message, meta = {}) {
  // Only log in production or if explicitly enabled
  const shouldLog = process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true';

  // Always log to console
  logToConsole(level, message, meta);

  // Log to file in production
  if (shouldLog) {
    try {
      writeToFile(level, message, meta);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }
}

/**
 * Logger object with convenience methods
 */
const logger = {
  error: (message, meta = {}) => log(LOG_LEVELS.ERROR, message, meta),
  warn: (message, meta = {}) => log(LOG_LEVELS.WARN, message, meta),
  info: (message, meta = {}) => log(LOG_LEVELS.INFO, message, meta),
  debug: (message, meta = {}) => log(LOG_LEVELS.DEBUG, message, meta),

  /**
   * Log HTTP request
   */
  request: (req, res, duration) => {
    const meta = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    const level = res.statusCode >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
    log(level, `HTTP ${req.method} ${req.path}`, meta);
  },

  /**
   * Log database query
   */
  query: (query, params, duration) => {
    const meta = {
      query,
      params,
      duration: `${duration}ms`
    };
    log(LOG_LEVELS.DEBUG, 'Database Query', meta);
  },

  /**
   * Log authentication events
   */
  auth: (event, userId, success, meta = {}) => {
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.WARN;
    log(level, `Auth: ${event}`, { userId, success, ...meta });
  },

  /**
   * Log payment events
   */
  payment: (event, userId, amount, success, meta = {}) => {
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR;
    log(level, `Payment: ${event}`, { userId, amount, success, ...meta });
  },

  /**
   * Log system events
   */
  system: (event, meta = {}) => {
    log(LOG_LEVELS.INFO, `System: ${event}`, meta);
  }
};

/**
 * Log rotation (delete old logs)
 * Call this periodically to prevent log files from growing too large
 */
logger.rotate = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = Date.now();

  fs.readdirSync(logsDir).forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtime.getTime() > maxAge) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted old log file: ${file}`);
    }
  });
};

module.exports = logger;
