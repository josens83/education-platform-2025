# High CPU/Memory Usage Runbook

## Severity: P1 (High)

## Symptoms

### Alerts
- `HighCPUUsage` - CPU usage > 80% for 5 minutes
- `HighMemoryUsage` - Memory usage > 85% for 5 minutes
- `ApplicationSlowResponse` - P95 latency > 500ms

### User Impact
- Slow page loads (>5 seconds)
- API timeouts
- Intermittent 504 Gateway Timeout errors
- WebSocket disconnections

### Monitoring Indicators
- **Grafana System Dashboard:**
  - CPU usage spiking above 80%
  - Memory usage approaching limits
  - Swap usage increasing

- **Prometheus Queries:**
  ```promql
  # CPU usage
  100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

  # Memory usage
  100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)
  ```

- **Application Metrics:**
  - Request queue building up
  - Active connections increasing
  - Response time degradation

---

## Causes

### Common Causes

1. **Memory Leaks**
   - Unclosed database connections
   - Event listener leaks
   - Large objects not garbage collected
   - Circular references

2. **Infinite Loops / Runaway Processes**
   - Recursive function without base case
   - While loop with incorrect exit condition
   - Background job stuck in retry loop

3. **Traffic Spikes**
   - Sudden increase in legitimate traffic
   - DDoS attack
   - Viral content causing load spike
   - Marketing campaign without scaling

4. **Resource-Intensive Operations**
   - Large file uploads/downloads
   - Complex database queries without indexes
   - Unoptimized image processing
   - Heavy computation (AI/ML tasks)

5. **Cache Issues**
   - Redis cache failure (causing DB overload)
   - Cache stampede (many requests hitting DB)
   - Memory cache growing unbounded

---

## Diagnosis

### 1. Identify the Problem (5 minutes)

**Check system resources:**
```bash
# SSH to affected server
ssh user@server-ip

# Check CPU and memory
top -b -n 1

# More detailed view
htop

# Memory breakdown
free -h
cat /proc/meminfo

# Swap usage
swapon --show
```

**Check which process is consuming resources:**
```bash
# Top processes by CPU
ps aux --sort=-%cpu | head -n 10

# Top processes by memory
ps aux --sort=-%mem | head -n 10

# Detailed process info
top -p $(pgrep -d',' node)
```

### 2. Check Application Status (5 minutes)

**PM2 monitoring:**
```bash
# Overall status
pm2 status

# Detailed monitoring
pm2 monit

# Memory usage per process
pm2 list

# Logs (check for errors/warnings)
pm2 logs --lines 100
```

**Docker monitoring (if using Docker):**
```bash
# Container stats
docker stats

# Specific container
docker stats education-api

# Container logs
docker logs education-api --tail 100

# Inspect container
docker inspect education-api
```

### 3. Analyze Application Metrics (5 minutes)

**Check Grafana dashboards:**
- Navigate to API Overview dashboard
- Look for:
  - Request rate increase
  - Specific endpoints with high latency
  - Error rate spikes
  - Database query times

**Check Prometheus:**
```promql
# Requests per second
rate(education_platform_http_requests_total[5m])

# Memory usage by app
process_resident_memory_bytes

# Node.js heap usage
nodejs_heap_size_used_bytes

# Active handles (potential leak indicator)
nodejs_active_handles_total
```

**Check Sentry:**
- Look for new error patterns
- Memory warnings
- Timeout errors

### 4. Check Database (5 minutes)

**Database connections:**
```bash
psql -U user -h host -d dbname -c "SELECT count(*) FROM pg_stat_activity;"
psql -U user -h host -d dbname -c "SELECT * FROM pg_stat_activity WHERE state != 'idle';"
```

**Slow queries:**
```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Connection pool status:**
```bash
curl http://localhost:3001/api/health/detailed | jq '.database.pool'
```

### 5. Check Logs (5 minutes)

**Application logs:**
```bash
# Backend logs
tail -f backend/logs/error-*.log
tail -f backend/logs/combined-*.log

# PM2 logs
pm2 logs --err

# System logs
sudo journalctl -u education-platform -n 100 --no-pager
```

**Look for:**
- Out of memory errors
- Unhandled promise rejections
- Database connection errors
- Timeout errors
- "FATAL" or "ERROR" level logs

---

## Resolution

### Immediate Actions (Stop the Bleeding)

#### Option 1: Restart Application (Fastest - 2 minutes)

**PM2:**
```bash
# Graceful reload (zero downtime)
pm2 reload education-api

# If reload doesn't work, restart
pm2 restart education-api

# Monitor after restart
pm2 monit
```

**Docker:**
```bash
# Restart containers
docker-compose restart backend

# Or full restart
docker-compose down
docker-compose up -d

# Check health
docker ps
curl http://localhost:3001/api/health
```

#### Option 2: Scale Horizontally (If traffic spike - 5 minutes)

**PM2 Cluster Mode:**
```bash
# Increase instances
pm2 scale education-api +2

# Or set specific number
pm2 scale education-api 4
```

**Docker Scaling:**
```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Verify
docker-compose ps
```

#### Option 3: Terminate Resource-Intensive Process (2 minutes)

```bash
# Find the culprit
ps aux | grep node
lsof -i :3001

# Kill specific process (last resort)
kill -9 <PID>

# Then restart properly
pm2 restart education-api
```

### Short-term Fixes (Mitigate Impact)

#### 1. Enable Rate Limiting (if traffic spike)

Update environment or feature flags:
```bash
# Stricter rate limiting
curl -X PUT http://localhost:3001/api/feature-flags/rate-limit-strict \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"enabled": true}'
```

#### 2. Clear Cache (if cache issues)

```bash
# Clear all caches
curl -X POST http://localhost:3001/api/health/cache/clear

# Restart Redis
docker-compose restart redis

# Or restart Redis service
sudo systemctl restart redis
```

#### 3. Enable Maintenance Mode (if severe)

```bash
# Enable maintenance mode via feature flag
curl -X PUT http://localhost:3001/api/feature-flags/maintenance-mode \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"enabled": true}'
```

### Long-term Fixes (Prevent Recurrence)

#### 1. Fix Memory Leaks

**Analyze heap snapshot:**
```bash
# Take heap snapshot
node --inspect backend/server.js
# Use Chrome DevTools to connect and take snapshot

# Or use heapdump
npm install heapdump
# Add to code: require('heapdump');
# Send SIGUSR2 to dump: kill -USR2 <PID>
```

**Common fixes:**
- Close database connections properly
- Remove event listeners when done
- Clear timers and intervals
- Avoid global variables
- Use weak references for caches

#### 2. Optimize Database Queries

```sql
-- Add missing indexes
CREATE INDEX idx_progress_user_book ON progress(user_id, book_id);

-- Analyze slow queries
EXPLAIN ANALYZE SELECT ...;

-- Update statistics
ANALYZE;
```

#### 3. Implement Caching

```javascript
// Cache expensive operations
const { cacheMiddleware, CACHE_DURATIONS } = require('./middleware/cache');

router.get('/expensive-endpoint',
  cacheMiddleware({ ttl: CACHE_DURATIONS.LONG }),
  handler
);
```

#### 4. Add Circuit Breakers

```javascript
// Prevent cascade failures
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(externalAPICall, options);
```

---

## Prevention

### 1. Monitoring & Alerts

- **Ensure alerts are configured:**
  - CPU > 70% for 5 min (warning)
  - CPU > 85% for 2 min (critical)
  - Memory > 80% for 5 min (warning)
  - Memory > 90% for 2 min (critical)

- **Set up Grafana dashboards:**
  - System metrics (CPU, memory, disk, network)
  - Application metrics (requests, errors, latency)
  - Database metrics (connections, query time)

### 2. Capacity Planning

```bash
# Load test to find limits
k6 run load-test.js

# Or Apache Bench
ab -n 10000 -c 100 http://localhost:3001/api/books
```

- Know your capacity limits
- Plan for 3x normal traffic
- Have scaling plan ready

### 3. Resource Limits

**PM2:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'education-api',
    max_memory_restart: '1G', // Auto-restart if > 1GB
    instances: 'max',
    exec_mode: 'cluster'
  }]
};
```

**Docker:**
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### 4. Code Reviews

- Review for potential memory leaks
- Check for N+1 query problems
- Ensure proper error handling
- Validate resource cleanup

### 5. Regular Maintenance

**Weekly:**
- Review resource usage trends
- Check for gradual memory increase (leak indicator)
- Review slow query logs
- Clean up old logs and data

**Monthly:**
- Analyze heap dumps
- Review and optimize slow endpoints
- Update dependencies (security & performance)
- Review and tune database indexes

---

## Verification

After resolution, verify:

```bash
# 1. Check system resources normalized
top
free -h

# 2. Check application health
curl http://localhost:3001/api/health/detailed

# 3. Monitor metrics for 10 minutes
# Watch Grafana dashboards

# 4. Check error rates
# Sentry should show reduced errors

# 5. Test key user flows
# Login, browse books, read chapter

# 6. Verify cache hit rate
curl http://localhost:3001/api/health/cache
# Should see hit rate > 70%
```

---

## Rollback

If fixes don't work or make things worse:

```bash
# 1. Revert to previous code version
git checkout <previous-commit>
npm install
pm2 restart education-api

# 2. Or deploy previous Docker image
docker tag education-platform-backend:previous education-platform-backend:latest
docker-compose up -d

# 3. Restore database if needed
gunzip < backup.sql.gz | psql -U user -d dbname

# 4. Clear all caches
curl -X POST http://localhost:3001/api/health/cache/clear
```

---

## Communication

### Internal Communication

**Slack template:**
```
🚨 High Resource Usage Incident

Status: [Investigating | Mitigating | Resolved]
Severity: P1
Affected: [API response times, specific features]
Impact: [% of users, specific regions]

Timeline:
- 10:00 - Alert triggered
- 10:05 - Investigation started
- 10:15 - Root cause identified: [cause]
- 10:20 - Fix applied: [action]
- 10:30 - Monitoring for stability

Next update: [time]
Incident lead: @engineer
```

### User Communication

**Status page (if prolonged):**
```
We're experiencing slower than normal response times.
Our team is actively working on a fix.
We'll update you in 15 minutes.
```

---

## Post-Incident

### Blameless Post-Mortem

**Document:**
1. Timeline of events
2. Root cause analysis
3. Impact assessment
4. What went well
5. What could be improved
6. Action items

**Store in:** `docs/postmortems/YYYY-MM-DD-high-resource-usage.md`

### Action Items

- [ ] Fix identified memory leak
- [ ] Add missing database indexes
- [ ] Improve monitoring/alerting
- [ ] Update runbook with learnings
- [ ] Schedule load testing
- [ ] Review capacity planning

---

## Related Documents

- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Deployment procedures
- [Database Connection Issues](database-connection-issues.md) - Related runbook
- [Grafana Dashboard](http://grafana.yourdomain.com) - System metrics

---

**Last Updated:** 2025-11-25
**Owner:** DevOps Team
**Reviewers:** Backend Team, SRE Team
