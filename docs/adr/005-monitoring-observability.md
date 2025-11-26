# 5. Monitoring and Observability

Date: 2025-11-25
Status: **Accepted**

## Context

Production systems require comprehensive observability to:
- Detect and diagnose issues quickly
- Track performance and reliability
- Understand user behavior
- Make data-driven decisions
- Meet SLA/SLO requirements

The three pillars of observability are:
1. **Metrics** - Time-series data (CPU, requests, latency)
2. **Logs** - Event records (errors, warnings, info)
3. **Traces** - Request flow through system

## Decision

Implement a comprehensive observability stack:

### 1. Metrics - Prometheus + Grafana
**Location:** `monitoring/prometheus/`, `monitoring/grafana/`

**Prometheus** for metrics collection:
- Application metrics (HTTP requests, errors, latency)
- System metrics (CPU, memory, disk via node-exporter)
- Database metrics (connections, query time via postgres-exporter)
- Redis metrics (hit/miss rate via redis-exporter)
- Container metrics (resource usage via cAdvisor)

**Grafana** for visualization:
- Pre-built dashboards (API Overview, DORA Metrics)
- Custom queries with PromQL
- Alert visualization
- User-friendly interface

**Metrics Middleware:**
```javascript
// Location: backend/middleware/metrics.js
- HTTP request duration (histogram)
- Request count by status code
- Active connections (gauge)
- Database query duration
- Cache hit/miss counters
- Business metrics (user registrations, subscriptions)
```

### 2. Logging - Winston + Loki
**Location:** `backend/lib/logger.js`, `monitoring/loki/`

**Winston** for structured logging:
- JSON format for easy parsing
- Multiple log levels (error, warn, info, debug)
- File and console transports
- Correlation IDs for request tracing
- Contextual metadata (userId, IP, endpoint)

**Loki** for log aggregation:
- Centralized log storage
- Label-based querying
- Integration with Grafana
- Promtail for log collection

**Log Format:**
```json
{
  "level": "info",
  "message": "User login successful",
  "timestamp": "2025-11-25T10:30:00.000Z",
  "correlationId": "a1b2c3d4-e5f6-7890",
  "userId": "123",
  "ip": "192.168.1.1",
  "service": "education-platform-backend"
}
```

### 3. Error Tracking - Sentry
**Location:** `backend/config/sentry.js`, `apps/web/src/main.tsx`

- Automatic error capturing
- Stack traces with source maps
- User context and breadcrumbs
- Performance monitoring
- Release tracking
- Alert integration

### 4. Alerting - Alertmanager
**Location:** `monitoring/alertmanager/`

**Alert Rules (25+ rules):**
- **Critical:** High error rate, service down, database unreachable
- **Warning:** Slow responses, high memory, low disk space
- **Business:** Low user registrations, payment failures

**Notification Channels:**
- Slack (team alerts)
- Email (critical alerts)
- PagerDuty (on-call rotation)

### 5. DORA Metrics
**Location:** `monitoring/grafana/dashboards/dora-metrics.json`

Tracking DevOps Research and Assessment metrics:
- **Deployment Frequency:** Multiple per day (target)
- **Lead Time for Changes:** <1 hour (target)
- **Change Failure Rate:** <5% (target)
- **Mean Time to Recovery (MTTR):** <1 hour (target)

## Architecture

```
┌─────────────┐
│ Application │─── Metrics ────► Prometheus ────► Grafana
│             │                                       │
│             │─── Logs ───────► Promtail ──► Loki ──┘
│             │                                       │
│             │─── Errors ─────► Sentry              │
│             │                                       │
│             │─── Health ─────► Healthcheck ────────┘
└─────────────┘                       │
                                      ▼
                                Alertmanager ──► Slack/Email/PagerDuty
```

## Consequences

### Positive

1. **Visibility**
   - Real-time system health monitoring
   - Historical data for trend analysis
   - Quick issue detection and diagnosis
   - User behavior insights

2. **Reliability**
   - Proactive alerting before user impact
   - Faster incident response (MTTR < 1 hour)
   - Data-driven capacity planning
   - SLA/SLO tracking

3. **Developer Experience**
   - Correlation IDs for request tracing
   - Detailed error reports in Sentry
   - Easy debugging with structured logs
   - Grafana dashboards for self-service

4. **Business Value**
   - Track business metrics (registrations, subscriptions)
   - Measure feature adoption
   - Optimize based on data
   - Demonstrate reliability to stakeholders

### Negative

1. **Infrastructure Costs**
   - Prometheus/Grafana resource usage
   - Sentry subscription costs
   - Loki storage costs
   - Alertmanager infrastructure

2. **Operational Overhead**
   - Maintain monitoring stack
   - Update dashboards and alerts
   - Manage alert fatigue
   - Train team on tools

3. **Performance Impact**
   - Metrics collection overhead (~1-2%)
   - Log writes to disk
   - Network traffic for metrics

4. **Complexity**
   - Multiple tools to learn
   - PromQL query language
   - Alert rule management
   - Dashboard maintenance

### Neutral

1. **Data Retention**
   - Prometheus: 30 days (configurable)
   - Loki: 30 days (configurable)
   - Sentry: 90 days (subscription tier)
   - Trade-off: storage cost vs historical data

## Monitoring Stack Deployment

**Docker Compose:**
```bash
docker-compose -f docker-compose.monitoring.yml --profile full up -d
```

**Services:**
- Prometheus (port 9090)
- Grafana (port 3001)
- Alertmanager (port 9093)
- Loki (port 3100)
- Promtail (no exposed port)
- cAdvisor (port 8080)

## Key Metrics

**Application:**
- Request rate (requests/second)
- Error rate (% of 5xx responses)
- P95/P99 latency (milliseconds)
- Active connections

**System:**
- CPU usage (%)
- Memory usage (%)
- Disk I/O (IOPS)
- Network throughput (MB/s)

**Business:**
- User registrations (count/day)
- Active subscriptions (count)
- Payment success rate (%)
- Book views (count/hour)

## Alternatives Considered

### All-in-One Solutions (Datadog, New Relic)
**Rejected because:**
- High cost for startup
- Vendor lock-in
- Less control over infrastructure
- Sufficient open-source alternatives

### ELK Stack (Elasticsearch, Logstash, Kibana)
**Rejected because:**
- More resource-intensive than Loki
- Overkill for current scale
- Prometheus + Loki simpler to operate

### CloudWatch (AWS-specific)
**Rejected because:**
- Cloud provider lock-in
- Less flexible than Prometheus
- Prefer cloud-agnostic solution

## Future Enhancements

1. **Distributed Tracing** - OpenTelemetry + Jaeger
2. **User Session Replay** - FullStory or LogRocket
3. **Synthetic Monitoring** - Uptime checks from multiple regions
4. **APM** - Application Performance Monitoring for deep insights

## Related Decisions

- [002: Technology Stack](002-technology-stack.md) - Compatible with chosen stack
- [004: Caching Strategy](004-caching-strategy.md) - Cache metrics tracked
- [007: Deployment Strategy](007-deployment-strategy.md) - Monitoring in deployment

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
- [Three Pillars of Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)
- [DORA Metrics](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance)
