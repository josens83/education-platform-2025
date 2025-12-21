/**
 * Feature Flags Service
 * Allows runtime feature toggling without code deployment
 *
 * Usage:
 *   const { isFeatureEnabled } = require('./lib/featureFlags');
 *   if (isFeatureEnabled('new-ui')) { ... }
 */

const logger = require('./logger');

// Feature flags configuration
// In production, this would come from a database or external service (LaunchDarkly, Unleash, etc.)
const DEFAULT_FLAGS = {
  // UI Features
  'new-dashboard': {
    enabled: false,
    description: 'New dashboard UI with improved analytics',
    rolloutPercentage: 0, // 0-100
    enabledForUsers: [], // Specific user IDs
    enabledForRoles: [], // Specific roles
  },

  // Backend Features
  'ai-recommendations': {
    enabled: true,
    description: 'AI-powered book recommendations',
    rolloutPercentage: 100,
    enabledForUsers: [],
    enabledForRoles: ['premium', 'admin'],
  },

  'advanced-caching': {
    enabled: true,
    description: 'Redis caching with ETag support',
    rolloutPercentage: 100,
    enabledForUsers: [],
    enabledForRoles: [],
  },

  'social-sharing': {
    enabled: false,
    description: 'Share progress on social media',
    rolloutPercentage: 0,
    enabledForUsers: [],
    enabledForRoles: [],
  },

  'offline-mode': {
    enabled: false,
    description: 'Offline reading capability',
    rolloutPercentage: 0,
    enabledForUsers: [],
    enabledForRoles: [],
  },

  'dark-mode': {
    enabled: true,
    description: 'Dark mode UI theme',
    rolloutPercentage: 100,
    enabledForUsers: [],
    enabledForRoles: [],
  },

  // Experimental Features
  'beta-reader': {
    enabled: false,
    description: 'Beta book reader with new features',
    rolloutPercentage: 10, // 10% gradual rollout
    enabledForUsers: [],
    enabledForRoles: ['beta-tester'],
  },

  // System Features
  'maintenance-mode': {
    enabled: false,
    description: 'Maintenance mode (show maintenance page)',
    rolloutPercentage: 0,
    enabledForUsers: [],
    enabledForRoles: [],
  },

  'rate-limit-strict': {
    enabled: false,
    description: 'Stricter rate limiting for suspected abuse',
    rolloutPercentage: 0,
    enabledForUsers: [],
    enabledForRoles: [],
  },
};

// In-memory cache of feature flags (refreshed periodically)
let featureFlags = { ...DEFAULT_FLAGS };
let lastRefresh = Date.now();
const REFRESH_INTERVAL = 60000; // 1 minute

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature flag
 * @param {Object} context - Context (user, request, etc.)
 * @returns {boolean} - Whether the feature is enabled
 */
function isFeatureEnabled(featureName, context = {}) {
  refreshFlagsIfNeeded();

  const flag = featureFlags[featureName];

  if (!flag) {
    logger.warn('Unknown feature flag', { featureName });
    return false; // Default to disabled for unknown flags
  }

  // Check if globally disabled
  if (!flag.enabled) {
    return false;
  }

  // Check user-specific enablement
  if (context.userId && flag.enabledForUsers.includes(context.userId)) {
    return true;
  }

  // Check role-specific enablement
  if (context.userRole && flag.enabledForRoles.includes(context.userRole)) {
    return true;
  }

  // Check rollout percentage
  if (flag.rolloutPercentage === 100) {
    return true;
  }

  if (flag.rolloutPercentage === 0) {
    return false;
  }

  // Use consistent hashing for gradual rollout
  // Same user always gets same result
  if (context.userId) {
    const hash = hashString(`${featureName}:${context.userId}`);
    return (hash % 100) < flag.rolloutPercentage;
  }

  // No user context, use random (not recommended for user-facing features)
  return Math.random() * 100 < flag.rolloutPercentage;
}

/**
 * Get all feature flags (for admin dashboard)
 * @returns {Object} - All feature flags
 */
function getAllFlags() {
  refreshFlagsIfNeeded();
  return { ...featureFlags };
}

/**
 * Get enabled features for a context
 * @param {Object} context - Context (user, request, etc.)
 * @returns {Array} - Array of enabled feature names
 */
function getEnabledFeatures(context = {}) {
  refreshFlagsIfNeeded();

  const enabled = [];
  for (const [name, flag] of Object.entries(featureFlags)) {
    if (isFeatureEnabled(name, context)) {
      enabled.push(name);
    }
  }

  return enabled;
}

/**
 * Update a feature flag (for admin use)
 * In production, this would update the database
 * @param {string} featureName - Name of the feature
 * @param {Object} updates - Updates to apply
 */
function updateFlag(featureName, updates) {
  if (!featureFlags[featureName]) {
    throw new Error(`Feature flag '${featureName}' does not exist`);
  }

  featureFlags[featureName] = {
    ...featureFlags[featureName],
    ...updates,
  };

  logger.info('Feature flag updated', {
    featureName,
    updates,
  });

  // In production, this would:
  // 1. Update database
  // 2. Publish event to notify other instances
  // 3. Invalidate cache
}

/**
 * Create a new feature flag
 * @param {string} featureName - Name of the feature
 * @param {Object} config - Flag configuration
 */
function createFlag(featureName, config) {
  if (featureFlags[featureName]) {
    throw new Error(`Feature flag '${featureName}' already exists`);
  }

  featureFlags[featureName] = {
    enabled: false,
    description: '',
    rolloutPercentage: 0,
    enabledForUsers: [],
    enabledForRoles: [],
    ...config,
  };

  logger.info('Feature flag created', { featureName, config });
}

/**
 * Delete a feature flag
 * @param {string} featureName - Name of the feature
 */
function deleteFlag(featureName) {
  if (!featureFlags[featureName]) {
    throw new Error(`Feature flag '${featureName}' does not exist`);
  }

  delete featureFlags[featureName];
  logger.info('Feature flag deleted', { featureName });
}

/**
 * Refresh feature flags from data source
 * In production, this would fetch from database or external service
 */
function refreshFlags() {
  // In production:
  // 1. Fetch from database
  // 2. Or fetch from external service (LaunchDarkly, Unleash, etc.)
  // 3. Update in-memory cache

  lastRefresh = Date.now();
  logger.debug('Feature flags refreshed');
}

/**
 * Refresh flags if needed (time-based)
 */
function refreshFlagsIfNeeded() {
  const now = Date.now();
  if (now - lastRefresh > REFRESH_INTERVAL) {
    refreshFlags();
  }
}

/**
 * Simple string hash function for consistent rollout
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Express middleware to add feature flags to request
 */
function featureFlagsMiddleware(req, res, next) {
  const context = {
    userId: req.user?.id,
    userRole: req.user?.subscription_tier || 'free',
    ip: req.ip,
  };

  // Add helper methods to request
  req.isFeatureEnabled = (featureName) => isFeatureEnabled(featureName, context);
  req.getEnabledFeatures = () => getEnabledFeatures(context);

  next();
}

module.exports = {
  isFeatureEnabled,
  getAllFlags,
  getEnabledFeatures,
  updateFlag,
  createFlag,
  deleteFlag,
  refreshFlags,
  featureFlagsMiddleware,
};
