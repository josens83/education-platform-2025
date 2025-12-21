# 4. Caching Strategy

Date: 2025-11-25
Status: **Accepted**

## Context

The Education Platform serves content-heavy workloads:
- Book metadata and chapters (read-heavy)
- User progress data (moderate updates)
- Static assets (images, fonts, CSS, JS)
- API responses (varying freshness requirements)

We need an effective caching strategy to:
- Reduce database load
- Improve response times
- Lower infrastructure costs
- Enhance user experience

## Decision

Implement a **multi-layer caching strategy**:

### 1. Application Layer (Redis + In-Memory)
**Location:** `backend/middleware/cache.js`

- **Primary:** Redis (distributed cache)
- **Fallback:** NodeCache (in-memory)
- **TTL Strategy:**
  - Books/Chapters: 30 minutes (LONG)
  - User data: 5 minutes (MEDIUM)
  - Progress/Stats: 1 minute (SHORT)
  - Static lookups: 1 hour (VERY_LONG)

**Implementation:**
```javascript
// Redis with automatic fallback
cacheMiddleware({ ttl: 300, prefix: 'api' })

// Cache key: api:GET:/books:userId:query
// Supports: invalidation by pattern, ETag generation
```

### 2. HTTP Layer (Browser + CDN)
**Location:** `backend/server.js` - httpCacheMiddleware, cdnCacheMiddleware

- **Browser Caching:**
  - Static assets: 1 year (immutable)
  - HTML: 1 hour (revalidate)
  - API: Conditional (ETag)

- **CDN Caching:**
  - Static assets: 1 year
  - Public API: 5 minutes
  - Private API: No cache

**Headers:**
```http
Cache-Control: public, max-age=31536000, immutable
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
CDN-Cache-Control: public, max-age=300
Surrogate-Control: max-age=300
```

### 3. Database Layer
**Location:** Database configuration

- Connection pooling (5-20 connections)
- Query result caching (PostgreSQL)
- Prepared statements for common queries

## Cache Invalidation Strategy

**Pattern-based invalidation:**
```javascript
// Invalidate all book-related caches
await invalidateCache('api:GET:/books:*')

// Invalidate specific user's cache
await invalidateCache(`api:*:userId:${userId}:*`)

// Clear all caches
await clearCache()
```

**Trigger points:**
- Book updates → Invalidate `/books/:id` and list caches
- User profile updates → Invalidate user-specific caches
- Progress updates → Invalidate stats caches
- Subscription changes → Invalidate user permission caches

## Consequences

### Positive

1. **Performance**
   - 80%+ cache hit rate target
   - <50ms response for cached data
   - Reduced database queries by 70%
   - Improved user experience (faster page loads)

2. **Scalability**
   - Redis handles distributed caching across instances
   - CDN reduces origin server load
   - Database can handle more users with same resources

3. **Cost Efficiency**
   - Lower database instance requirements
   - Reduced bandwidth costs with CDN
   - Less compute for repeated queries

4. **Resilience**
   - In-memory fallback if Redis fails
   - Graceful degradation
   - Cache stampede prevention

### Negative

1. **Complexity**
   - Multiple cache layers to manage
   - Cache invalidation logic required
   - Debugging can be harder (stale data)

2. **Consistency**
   - Potential for stale data
   - Need careful TTL tuning
   - Cache invalidation must be comprehensive

3. **Infrastructure**
   - Redis adds operational overhead
   - Monitoring cache hit rates required
   - Memory management for Redis

4. **Development**
   - Developers must understand caching
   - Testing with caches enabled/disabled
   - Cache warming strategies needed

### Neutral

1. **Storage Costs**
   - Redis memory usage
   - Trade-off: memory cost vs compute savings
   - Generally worth it for read-heavy workloads

## Cache Management API

**Endpoints:**
```
GET  /api/health/cache              # Cache statistics
POST /api/health/cache/invalidate   # Pattern invalidation
POST /api/health/cache/clear        # Clear all
```

## Monitoring

**Metrics tracked:**
- Cache hit/miss ratio
- Cache response time
- Redis memory usage
- Eviction rate
- Cache key distribution

**Location:** `backend/middleware/metrics.js`

## Alternatives Considered

### In-Memory Only (No Redis)
**Rejected because:**
- Not shared across multiple server instances
- Lost on server restart
- Limited by single-server memory

### Database Query Caching Only
**Rejected because:**
- Slower than application-level cache
- Still hits database connection pool
- Less flexible invalidation

### CDN Only
**Rejected because:**
- Doesn't help with dynamic API responses
- Can't cache authenticated requests
- Less control over invalidation

## Best Practices

1. **Cache Keys**
   - Include all relevant parameters
   - Use consistent formatting
   - Prefix by type for easy invalidation

2. **TTL Selection**
   - Match data change frequency
   - Shorter TTL for critical data
   - Longer TTL for static content

3. **Invalidation**
   - Invalidate on write operations
   - Use pattern matching for related caches
   - Log invalidation for debugging

4. **Monitoring**
   - Track hit/miss ratios
   - Alert on low hit rates
   - Monitor memory usage

## Related Decisions

- [002: Technology Stack](002-technology-stack.md) - Redis chosen for caching
- [005: Monitoring](005-monitoring-observability.md) - Cache metrics in Prometheus

## References

- [Redis Best Practices](https://redis.io/topics/lru-cache)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Cache Stampede Prevention](https://en.wikipedia.org/wiki/Cache_stampede)
