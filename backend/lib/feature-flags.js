/**
 * Feature Flag System
 * Simple environment-based feature toggles
 * Can be extended to use LaunchDarkly, Unleash, or similar services
 */

class FeatureFlags {
  constructor() {
    this.flags = {
      // AI Features
      AI_CHAT: process.env.FEATURE_AI_CHAT === 'true',
      AI_RECOMMENDATIONS: process.env.FEATURE_AI_RECOMMENDATIONS === 'true',

      // Payment Features
      NEW_PAYMENT_FLOW: process.env.FEATURE_NEW_PAYMENT_FLOW === 'true',
      STRIPE_PAYMENT: process.env.FEATURE_STRIPE_PAYMENT !== 'false', // Enabled by default

      // Social Features
      SOCIAL_LOGIN: process.env.FEATURE_SOCIAL_LOGIN !== 'false',
      TWO_FACTOR_AUTH: process.env.FEATURE_2FA !== 'false',

      // Content Features
      AUDIO_BOOKS: process.env.FEATURE_AUDIO_BOOKS !== 'false',
      QUIZZES: process.env.FEATURE_QUIZZES !== 'false',
      REVIEWS: process.env.FEATURE_REVIEWS !== 'false',

      // Experimental Features
      BETA_FEATURES: process.env.FEATURE_BETA === 'true',
      DARK_MODE: process.env.FEATURE_DARK_MODE !== 'false',
      NOTIFICATIONS: process.env.FEATURE_NOTIFICATIONS !== 'false',

      // Performance Features
      REDIS_CACHE: process.env.FEATURE_REDIS_CACHE !== 'false',
      CDN: process.env.FEATURE_CDN === 'true',

      // Monitoring
      DETAILED_LOGGING: process.env.FEATURE_DETAILED_LOGGING === 'true',
      PERFORMANCE_MONITORING: process.env.FEATURE_PERF_MON !== 'false'
    };

    // User-specific flags (can be extended to database)
    this.userFlags = new Map();
  }

  /**
   * Check if a feature is enabled
   * @param {string} flagName - Feature flag name
   * @param {string} userId - Optional user ID for user-specific flags
   * @returns {boolean}
   */
  isEnabled(flagName, userId = null) {
    // Check user-specific override first
    if (userId && this.userFlags.has(userId)) {
      const userFlagsForUser = this.userFlags.get(userId);
      if (flagName in userFlagsForUser) {
        return userFlagsForUser[flagName];
      }
    }

    // Check global flag
    return this.flags[flagName] || false;
  }

  /**
   * Enable feature for specific user
   * @param {string} userId - User ID
   * @param {string} flagName - Feature flag name
   */
  enableForUser(userId, flagName) {
    if (!this.userFlags.has(userId)) {
      this.userFlags.set(userId, {});
    }
    this.userFlags.get(userId)[flagName] = true;
  }

  /**
   * Disable feature for specific user
   * @param {string} userId - User ID
   * @param {string} flagName - Feature flag name
   */
  disableForUser(userId, flagName) {
    if (!this.userFlags.has(userId)) {
      this.userFlags.set(userId, {});
    }
    this.userFlags.get(userId)[flagName] = false;
  }

  /**
   * Get all enabled flags
   * @param {string} userId - Optional user ID
   * @returns {object}
   */
  getAllFlags(userId = null) {
    const globalFlags = { ...this.flags };

    if (userId && this.userFlags.has(userId)) {
      const userSpecificFlags = this.userFlags.get(userId);
      return { ...globalFlags, ...userSpecificFlags };
    }

    return globalFlags;
  }

  /**
   * Percentage rollout
   * @param {string} flagName - Feature flag name
   * @param {string} userId - User ID
   * @param {number} percentage - Percentage (0-100)
   * @returns {boolean}
   */
  isEnabledForPercentage(flagName, userId, percentage) {
    if (!this.isEnabled(flagName)) {
      return false;
    }

    // Simple hash-based percentage rollout
    const hash = this._hashString(userId + flagName);
    return (hash % 100) < percentage;
  }

  /**
   * Simple string hash function
   * @private
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * A/B Testing
   * @param {string} experimentName - Experiment name
   * @param {string} userId - User ID
   * @returns {string} - Variant name ('A' or 'B')
   */
  getVariant(experimentName, userId) {
    const hash = this._hashString(userId + experimentName);
    return (hash % 2 === 0) ? 'A' : 'B';
  }
}

// Singleton instance
const featureFlags = new FeatureFlags();

module.exports = featureFlags;
