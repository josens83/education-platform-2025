/**
 * Two-Factor Authentication Routes
 *
 * - Setup 2FA (generate secret + QR code)
 * - Verify and enable 2FA
 * - Disable 2FA
 * - Regenerate backup codes
 * - Verify 2FA during login
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../lib/db');
const {
  generateSecret,
  verifyToken,
  generateBackupCodes,
  verifyBackupCode,
  removeUsedBackupCode,
  formatBackupCodes,
  isValidTokenFormat,
  isSetupSessionExpired,
} = require('../lib/twoFactor');

/**
 * Step 1: Initiate 2FA Setup
 * POST /api/2fa/setup
 *
 * Generates secret and QR code for user to scan
 */
router.post('/setup', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if 2FA is already enabled
    const userResult = await pool.query(
      'SELECT two_factor_enabled FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows[0].two_factor_enabled) {
      return res.status(400).json({
        status: 'error',
        message: '2FA is already enabled for this account',
      });
    }

    // Generate secret and QR code
    const { secret, qrCode } = await generateSecret(userEmail);

    // Generate backup codes
    const { plainCodes, hashedCodes } = await generateBackupCodes(10);

    // Store in temporary setup session (expires in 15 minutes)
    await pool.query(
      `INSERT INTO two_factor_setup_sessions (user_id, secret, backup_codes, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')
       ON CONFLICT (user_id)
       DO UPDATE SET
         secret = EXCLUDED.secret,
         backup_codes = EXCLUDED.backup_codes,
         expires_at = EXCLUDED.expires_at,
         created_at = NOW()`,
      [userId, secret, hashedCodes]
    );

    res.json({
      status: 'success',
      message: '2FA setup initiated. Scan the QR code with your authenticator app.',
      data: {
        secret, // For manual entry
        qrCode, // QR code image (data URL)
        backupCodes: formatBackupCodes(plainCodes), // Show ONCE, user must save them
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      status: 'error',
      message: '2FA setup failed',
    });
  }
});

/**
 * Step 2: Verify and Enable 2FA
 * POST /api/2fa/verify
 *
 * Verifies TOTP code and enables 2FA if correct
 */
router.post('/verify', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    // Validate token format
    if (!token || !isValidTokenFormat(token)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token format. Please provide a 6-digit code.',
      });
    }

    // Get setup session
    const sessionResult = await pool.query(
      'SELECT secret, backup_codes, expires_at FROM two_factor_setup_sessions WHERE user_id = $1',
      [userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No active 2FA setup session. Please start setup again.',
      });
    }

    const { secret, backup_codes, expires_at } = sessionResult.rows[0];

    // Check if session expired
    if (isSetupSessionExpired(expires_at)) {
      await pool.query('DELETE FROM two_factor_setup_sessions WHERE user_id = $1', [userId]);
      return res.status(400).json({
        status: 'error',
        message: 'Setup session expired. Please start setup again.',
      });
    }

    // Verify TOTP code
    const isValid = verifyToken(secret, token);

    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code. Please try again.',
      });
    }

    // Enable 2FA for user
    await pool.query(
      `UPDATE users
       SET two_factor_enabled = true,
           two_factor_secret = $1,
           two_factor_backup_codes = $2,
           two_factor_verified_at = NOW()
       WHERE id = $3`,
      [secret, backup_codes, userId]
    );

    // Delete setup session
    await pool.query('DELETE FROM two_factor_setup_sessions WHERE user_id = $1', [userId]);

    // Log successful setup
    await pool.query(
      'INSERT INTO two_factor_attempts (user_id, success, code_type, ip_address) VALUES ($1, true, $2, $3)',
      [userId, 'totp', req.ip]
    );

    res.json({
      status: 'success',
      message: '2FA has been successfully enabled for your account!',
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({
      status: 'error',
      message: '2FA verification failed',
    });
  }
});

/**
 * Disable 2FA
 * POST /api/2fa/disable
 *
 * Disables 2FA after verifying current password
 */
router.post('/disable', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required to disable 2FA',
      });
    }

    // Verify password
    const bcrypt = require('bcrypt');
    const userResult = await pool.query(
      'SELECT password_hash, two_factor_enabled FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const { password_hash, two_factor_enabled } = userResult.rows[0];

    if (!two_factor_enabled) {
      return res.status(400).json({
        status: 'error',
        message: '2FA is not enabled for this account',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect password',
      });
    }

    // Disable 2FA
    await pool.query(
      `UPDATE users
       SET two_factor_enabled = false,
           two_factor_secret = NULL,
           two_factor_backup_codes = NULL,
           two_factor_verified_at = NULL
       WHERE id = $1`,
      [userId]
    );

    res.json({
      status: 'success',
      message: '2FA has been disabled for your account',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to disable 2FA',
    });
  }
});

/**
 * Regenerate Backup Codes
 * POST /api/2fa/regenerate-backup-codes
 *
 * Generates new backup codes (invalidates old ones)
 */
router.post('/regenerate-backup-codes', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required to regenerate backup codes',
      });
    }

    // Verify password
    const bcrypt = require('bcrypt');
    const userResult = await pool.query(
      'SELECT password_hash, two_factor_enabled FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const { password_hash, two_factor_enabled } = userResult.rows[0];

    if (!two_factor_enabled) {
      return res.status(400).json({
        status: 'error',
        message: '2FA is not enabled for this account',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect password',
      });
    }

    // Generate new backup codes
    const { plainCodes, hashedCodes } = await generateBackupCodes(10);

    // Update backup codes
    await pool.query(
      'UPDATE users SET two_factor_backup_codes = $1 WHERE id = $2',
      [hashedCodes, userId]
    );

    res.json({
      status: 'success',
      message: 'New backup codes generated. Save them in a secure place!',
      backupCodes: formatBackupCodes(plainCodes),
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to regenerate backup codes',
    });
  }
});

/**
 * Get 2FA Status
 * GET /api/2fa/status
 *
 * Returns whether 2FA is enabled for current user
 */
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         two_factor_enabled,
         two_factor_verified_at,
         CASE
           WHEN two_factor_backup_codes IS NOT NULL
           THEN array_length(two_factor_backup_codes, 1)
           ELSE 0
         END as remaining_backup_codes
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const {
      two_factor_enabled,
      two_factor_verified_at,
      remaining_backup_codes,
    } = result.rows[0];

    res.json({
      status: 'success',
      twoFactorEnabled: two_factor_enabled,
      enabledAt: two_factor_verified_at,
      remainingBackupCodes: remaining_backup_codes,
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get 2FA status',
    });
  }
});

/**
 * Verify 2FA Code (During Login)
 * POST /api/2fa/verify-login
 *
 * Used during login flow to verify 2FA code
 * This endpoint is rate-limited to prevent brute force
 */
router.post('/verify-login', async (req, res) => {
  try {
    const { userId, token, isBackupCode } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and token are required',
      });
    }

    // Get user's 2FA data
    const userResult = await pool.query(
      'SELECT two_factor_secret, two_factor_backup_codes FROM users WHERE id = $1 AND two_factor_enabled = true',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request',
      });
    }

    const { two_factor_secret, two_factor_backup_codes } = userResult.rows[0];

    let isValid = false;
    let codeType = 'totp';

    if (isBackupCode) {
      // Verify backup code
      const { valid, matchedIndex } = await verifyBackupCode(token, two_factor_backup_codes);
      isValid = valid;
      codeType = 'backup';

      if (isValid) {
        // Remove used backup code
        const updatedCodes = removeUsedBackupCode(two_factor_backup_codes, matchedIndex);
        await pool.query(
          'UPDATE users SET two_factor_backup_codes = $1 WHERE id = $2',
          [updatedCodes, userId]
        );

        // Log backup code usage
        await pool.query(
          'INSERT INTO two_factor_recovery_log (user_id, backup_code_hash, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
          [userId, two_factor_backup_codes[matchedIndex], req.ip, req.headers['user-agent']]
        );
      }
    } else {
      // Verify TOTP code
      if (!isValidTokenFormat(token)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid token format',
        });
      }

      isValid = verifyToken(two_factor_secret, token);
    }

    // Log attempt
    await pool.query(
      'INSERT INTO two_factor_attempts (user_id, success, code_type, ip_address) VALUES ($1, $2, $3, $4)',
      [userId, isValid, codeType, req.ip]
    );

    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid verification code',
      });
    }

    res.json({
      status: 'success',
      message: '2FA verification successful',
    });
  } catch (error) {
    console.error('2FA login verify error:', error);
    res.status(500).json({
      status: 'error',
      message: '2FA verification failed',
    });
  }
});

module.exports = router;
