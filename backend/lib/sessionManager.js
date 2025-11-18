/**
 * Session Management System
 *
 * - 로그인 기록 추적
 * - 활성 세션 관리
 * - 의심스러운 활동 감지
 * - 디바이스 관리
 */

const pool = require('./db');
const crypto = require('crypto');
const UAParser = require('ua-parser-js');

/**
 * Parse User Agent
 */
function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || '',
    deviceType: result.device.type || 'desktop',
    deviceVendor: result.device.vendor || '',
    deviceModel: result.device.model || '',
  };
}

/**
 * Get device name
 */
function getDeviceName(parsedUA) {
  if (parsedUA.deviceModel) {
    return `${parsedUA.deviceVendor || ''} ${parsedUA.deviceModel}`.trim();
  }

  if (parsedUA.deviceType === 'mobile') {
    return 'Mobile Device';
  } else if (parsedUA.deviceType === 'tablet') {
    return 'Tablet';
  } else {
    return `${parsedUA.os} Computer`;
  }
}

/**
 * Record login attempt
 */
async function recordLogin(userId, ipAddress, userAgent, success = true, failureReason = null) {
  try {
    const parsed = parseUserAgent(userAgent);

    await pool.query(
      `INSERT INTO login_history (user_id, ip_address, user_agent, device_type, browser, os, success, failure_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        ipAddress,
        userAgent,
        parsed.deviceType,
        parsed.browser,
        parsed.os,
        success,
        failureReason,
      ]
    );

    console.log(`[Session] Login recorded for user ${userId}: ${success ? 'success' : 'failed'}`);
  } catch (error) {
    console.error('[Session] Error recording login:', error);
  }
}

/**
 * Create active session
 */
async function createSession(userId, token, refreshToken, ipAddress, userAgent, expiresAt) {
  try {
    const parsed = parseUserAgent(userAgent);
    const deviceName = getDeviceName(parsed);

    // Token hash (for security)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await pool.query(
      `INSERT INTO active_sessions
       (user_id, session_token, refresh_token, ip_address, user_agent, device_type, device_name, browser, os, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
        tokenHash,
        refreshToken,
        ipAddress,
        userAgent,
        parsed.deviceType,
        deviceName,
        parsed.browser,
        parsed.os,
        expiresAt,
      ]
    );

    console.log(`[Session] Session created for user ${userId} on ${deviceName}`);

    return { success: true };
  } catch (error) {
    console.error('[Session] Error creating session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's active sessions
 */
async function getUserSessions(userId) {
  try {
    const result = await pool.query(
      `SELECT id, device_name, device_type, browser, os, ip_address,
              last_activity, created_at, expires_at
       FROM active_sessions
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY last_activity DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('[Session] Error getting sessions:', error);
    return [];
  }
}

/**
 * Revoke session
 */
async function revokeSession(userId, sessionId) {
  try {
    const result = await pool.query(
      'DELETE FROM active_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    return { success: result.rowCount > 0 };
  } catch (error) {
    console.error('[Session] Error revoking session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoke all sessions except current
 */
async function revokeAllSessions(userId, currentToken) {
  try {
    const tokenHash = crypto.createHash('sha256').update(currentToken).digest('hex');

    const result = await pool.query(
      'DELETE FROM active_sessions WHERE user_id = $1 AND session_token != $2',
      [userId, tokenHash]
    );

    console.log(`[Session] Revoked ${result.rowCount} sessions for user ${userId}`);

    return { success: true, count: result.rowCount };
  } catch (error) {
    console.error('[Session] Error revoking all sessions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get login history
 */
async function getLoginHistory(userId, limit = 20) {
  try {
    const result = await pool.query(
      `SELECT ip_address, device_type, browser, os, location, success, failure_reason, created_at
       FROM login_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('[Session] Error getting login history:', error);
    return [];
  }
}

/**
 * Track login attempt (for rate limiting)
 */
async function trackLoginAttempt(identifier) {
  try {
    const result = await pool.query(
      `INSERT INTO login_attempts (identifier, attempts, updated_at)
       VALUES ($1, 1, NOW())
       ON CONFLICT (identifier)
       DO UPDATE SET attempts = login_attempts.attempts + 1, updated_at = NOW()
       RETURNING attempts, locked_until`,
      [identifier]
    );

    const { attempts, locked_until } = result.rows[0];

    // Lock account after 5 failed attempts
    if (attempts >= 5 && !locked_until) {
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await pool.query(
        'UPDATE login_attempts SET locked_until = $1 WHERE identifier = $2',
        [lockUntil, identifier]
      );

      return { locked: true, lockUntil, attempts };
    }

    return { locked: false, attempts };
  } catch (error) {
    console.error('[Session] Error tracking login attempt:', error);
    return { locked: false, attempts: 0 };
  }
}

/**
 * Check if account is locked
 */
async function isAccountLocked(identifier) {
  try {
    const result = await pool.query(
      'SELECT locked_until FROM login_attempts WHERE identifier = $1',
      [identifier]
    );

    if (result.rows.length === 0) {
      return { locked: false };
    }

    const { locked_until } = result.rows[0];

    if (locked_until && new Date(locked_until) > new Date()) {
      return { locked: true, until: locked_until };
    }

    // Clear lock if expired
    if (locked_until) {
      await pool.query(
        'UPDATE login_attempts SET locked_until = NULL, attempts = 0 WHERE identifier = $1',
        [identifier]
      );
    }

    return { locked: false };
  } catch (error) {
    console.error('[Session] Error checking account lock:', error);
    return { locked: false };
  }
}

/**
 * Reset login attempts (on successful login)
 */
async function resetLoginAttempts(identifier) {
  try {
    await pool.query(
      'DELETE FROM login_attempts WHERE identifier = $1',
      [identifier]
    );
  } catch (error) {
    console.error('[Session] Error resetting login attempts:', error);
  }
}

/**
 * Log suspicious activity
 */
async function logSuspiciousActivity(userId, activityType, severity, description, ipAddress, userAgent, metadata = {}) {
  try {
    await pool.query(
      `INSERT INTO suspicious_activity
       (user_id, activity_type, severity, description, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, activityType, severity, description, ipAddress, userAgent, JSON.stringify(metadata)]
    );

    console.log(`[Security] Suspicious activity logged: ${activityType} (${severity}) for user ${userId}`);

    // TODO: Send alert email for high/critical severity
    if (severity === 'high' || severity === 'critical') {
      // sendSecurityAlertEmail(userId, activityType, description);
    }
  } catch (error) {
    console.error('[Session] Error logging suspicious activity:', error);
  }
}

/**
 * Detect unusual location
 */
async function detectUnusualLocation(userId, ipAddress) {
  try {
    // Get recent login locations
    const result = await pool.query(
      `SELECT DISTINCT ip_address
       FROM login_history
       WHERE user_id = $1 AND success = true AND created_at >= NOW() - INTERVAL '30 days'
       LIMIT 10`,
      [userId]
    );

    const knownIPs = result.rows.map(r => r.ip_address);

    if (knownIPs.length > 0 && !knownIPs.includes(ipAddress)) {
      return { unusual: true, knownIPs };
    }

    return { unusual: false };
  } catch (error) {
    console.error('[Session] Error detecting unusual location:', error);
    return { unusual: false };
  }
}

/**
 * Cleanup expired sessions (run via CRON)
 */
async function cleanupExpiredSessions() {
  try {
    const result = await pool.query('SELECT cleanup_expired_sessions()');
    const count = result.rows[0].cleanup_expired_sessions;

    console.log(`[Session] Cleaned up ${count} expired sessions`);

    return { success: true, count };
  } catch (error) {
    console.error('[Session] Error cleaning up sessions:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  recordLogin,
  createSession,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  getLoginHistory,
  trackLoginAttempt,
  isAccountLocked,
  resetLoginAttempts,
  logSuspiciousActivity,
  detectUnusualLocation,
  cleanupExpiredSessions,
};
