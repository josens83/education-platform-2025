/**
 * Two-Factor Authentication (2FA) Library
 *
 * TOTP-based 2FA implementation compatible with:
 * - Google Authenticator
 * - Authy
 * - Microsoft Authenticator
 * - Any RFC 6238 compliant app
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Generate 2FA secret for a user
 *
 * @param {string} userEmail - User's email for label
 * @param {string} issuer - App name (e.g., "Education Platform")
 * @returns {object} - Secret, QR code data URL, and otpauth URL
 */
async function generateSecret(userEmail, issuer = 'Education Platform') {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${userEmail})`,
    issuer: issuer,
    length: 32, // 256 bits for high security
  });

  // Generate QR code data URL
  const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32, // Base32 encoded secret to store in DB
    qrCode: qrCodeDataURL, // QR code image data URL
    otpauthUrl: secret.otpauth_url, // Manual entry URL
  };
}

/**
 * Verify TOTP code
 *
 * @param {string} secret - User's 2FA secret (base32)
 * @param {string} token - 6-digit code from authenticator app
 * @param {number} window - Time window for code validity (±1 = 90 seconds)
 * @returns {boolean} - True if code is valid
 */
function verifyToken(secret, token, window = 1) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: window, // Allow ±30 seconds time skew
  });
}

/**
 * Generate backup codes
 *
 * @param {number} count - Number of backup codes to generate (default: 10)
 * @returns {Promise<object>} - Plain codes and hashed codes
 */
async function generateBackupCodes(count = 10) {
  const codes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase();

    codes.push(code);

    // Hash code for storage
    const hashedCode = await bcrypt.hash(code, 10);
    hashedCodes.push(hashedCode);
  }

  return {
    plainCodes: codes, // Show to user ONCE
    hashedCodes: hashedCodes, // Store in database
  };
}

/**
 * Verify backup code
 *
 * @param {string} providedCode - Code provided by user
 * @param {string[]} hashedCodes - Array of hashed backup codes from DB
 * @returns {Promise<object>} - { valid: boolean, matchedIndex: number }
 */
async function verifyBackupCode(providedCode, hashedCodes) {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isMatch = await bcrypt.compare(providedCode, hashedCodes[i]);
    if (isMatch) {
      return {
        valid: true,
        matchedIndex: i, // Index of matched code (to remove it)
      };
    }
  }

  return {
    valid: false,
    matchedIndex: -1,
  };
}

/**
 * Remove used backup code
 *
 * @param {string[]} hashedCodes - Array of hashed backup codes
 * @param {number} indexToRemove - Index of code to remove
 * @returns {string[]} - Updated array without the used code
 */
function removeUsedBackupCode(hashedCodes, indexToRemove) {
  return hashedCodes.filter((_, index) => index !== indexToRemove);
}

/**
 * Format backup codes for display
 *
 * @param {string[]} codes - Plain backup codes
 * @returns {string[]} - Formatted codes (e.g., "ABCD-EFGH")
 */
function formatBackupCodes(codes) {
  return codes.map(code => {
    // Format as XXXX-XXXX for readability
    return code.match(/.{1,4}/g).join('-');
  });
}

/**
 * Check if 2FA setup session is expired
 *
 * @param {Date} expiresAt - Expiration timestamp
 * @returns {boolean} - True if expired
 */
function isSetupSessionExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

/**
 * Generate recovery code for email/SMS
 *
 * @returns {string} - 8-digit numeric recovery code
 */
function generateRecoveryCode() {
  return crypto
    .randomInt(10000000, 99999999)
    .toString();
}

/**
 * Validate TOTP token format
 *
 * @param {string} token - Token to validate
 * @returns {boolean} - True if format is valid (6 digits)
 */
function isValidTokenFormat(token) {
  return /^\d{6}$/.test(token);
}

/**
 * Get current TOTP code (for testing/debugging ONLY)
 *
 * @param {string} secret - User's 2FA secret (base32)
 * @returns {string} - Current 6-digit code
 */
function getCurrentToken(secret) {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32',
  });
}

/**
 * Calculate time remaining for current TOTP code
 *
 * @returns {number} - Seconds until code expires
 */
function getTimeRemaining() {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30; // TOTP time step (30 seconds)
  return timeStep - (epoch % timeStep);
}

module.exports = {
  generateSecret,
  verifyToken,
  generateBackupCodes,
  verifyBackupCode,
  removeUsedBackupCode,
  formatBackupCodes,
  isSetupSessionExpired,
  generateRecoveryCode,
  isValidTokenFormat,
  getCurrentToken, // Use only for testing
  getTimeRemaining,
};
