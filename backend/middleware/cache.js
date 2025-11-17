/**
 * API Response Caching Middleware
 * Uses in-memory cache for GET requests
 */

const NodeCache = require('node-cache');

// Create cache instance
// stdTTL: default time-to-live in seconds
// checkperiod: automatic delete check interval
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Don't clone data for better performance
});

/**
 * Cache middleware factory
 * @param {number} duration - Cache duration in seconds (default: 300)
 * @param {function} keyGenerator - Optional custom cache key generator
 */
function cacheMiddleware(duration = 300, keyGenerator = null) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `${req.originalUrl || req.url}_${req.user?.id || 'anonymous'}`;

    // Try to get cached response
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      // Cache hit - return cached response
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Cache miss - store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache the response
    res.json = function(data) {
      // Cache the response
      cache.set(cacheKey, data, duration);
      res.setHeader('X-Cache', 'MISS');

      // Call original json method
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate cache by pattern
 * @param {string|RegExp} pattern - Pattern to match cache keys
 */
function invalidateCache(pattern) {
  const keys = cache.keys();

  if (typeof pattern === 'string') {
    // Exact match or prefix match
    const matchedKeys = keys.filter(key => key.includes(pattern));
    cache.del(matchedKeys);
    return matchedKeys.length;
  } else if (pattern instanceof RegExp) {
    // Regex match
    const matchedKeys = keys.filter(key => pattern.test(key));
    cache.del(matchedKeys);
    return matchedKeys.length;
  }

  return 0;
}

/**
 * Clear all cache
 */
function clearCache() {
  cache.flushAll();
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return cache.getStats();
}

// Pre-configured cache durations for different endpoints
const CACHE_DURATIONS = {
  SHORT: 60,        // 1 minute - for frequently changing data
  MEDIUM: 300,      // 5 minutes - default
  LONG: 1800,       // 30 minutes - for semi-static data
  VERY_LONG: 3600,  // 1 hour - for static data
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  clearCache,
  getCacheStats,
  CACHE_DURATIONS,
  cache, // Export for direct access if needed
};
