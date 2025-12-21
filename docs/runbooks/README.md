# Operational Runbooks
## Education Platform 2025

Operational runbooks for common incidents and procedures.

Last Updated: 2025-11-25

---

## What are Runbooks?

Runbooks are step-by-step guides for handling common operational scenarios, incidents, and maintenance tasks. They help ensure consistent, quick, and reliable responses to issues.

---

## Available Runbooks

### Incident Response
1. [High CPU/Memory Usage](high-resource-usage.md) - Diagnose and resolve resource exhaustion
2. [Database Connection Issues](database-connection-issues.md) - Fix database connectivity problems
3. [Cache Issues](cache-issues.md) - Troubleshoot Redis and caching problems
4. [Application Errors Spike](application-errors.md) - Handle sudden increase in errors
5. [Slow API Response Times](slow-api-response.md) - Diagnose and fix performance issues

### Deployment & Maintenance
6. [Deployment Rollback](deployment-rollback.md) - Quickly revert a bad deployment
7. [Database Backup & Restore](database-backup-restore.md) - Backup and recovery procedures
8. [Cache Invalidation](cache-invalidation.md) - Clear caches safely
9. [SSL Certificate Renewal](ssl-certificate-renewal.md) - Renew SSL/TLS certificates

### Security
10. [Security Incident Response](security-incident.md) - Handle security breaches
11. [DDoS Attack Mitigation](ddos-mitigation.md) - Respond to DDoS attacks
12. [Suspected Data Breach](data-breach.md) - Data breach investigation

---

## Using These Runbooks

### Severity Levels

- **P0 (Critical)** - Service down, data loss risk
  - Response time: Immediate
  - Example: Database down, complete service outage

- **P1 (High)** - Major functionality broken
  - Response time: <15 minutes
  - Example: Login broken, payment processing down

- **P2 (Medium)** - Degraded performance
  - Response time: <1 hour
  - Example: Slow response times, some features unavailable

- **P3 (Low)** - Minor issues
  - Response time: <4 hours
  - Example: UI glitches, non-critical features affected

### Incident Response Process

1. **Detect** - Alert triggers or user reports
2. **Assess** - Determine severity and impact
3. **Respond** - Follow relevant runbook
4. **Communicate** - Update stakeholders
5. **Resolve** - Fix the issue
6. **Document** - Log what happened and how it was fixed
7. **Review** - Post-mortem for P0/P1 incidents

---

## Quick Reference

### Emergency Contacts

```
On-Call Engineer: Check PagerDuty rotation
Team Lead: [Contact info]
DevOps Lead: [Contact info]
Security Lead: [Contact info]
Database Admin: [Contact info]
```

### Critical Commands

```bash
# Check system health
curl http://localhost:3001/api/health

# Check logs
docker-compose logs -f --tail=100 backend

# Restart service
pm2 restart education-api

# Check resource usage
docker stats

# Database connection test
psql -U user -h host -d dbname -c "SELECT NOW();"

# Clear all caches
curl -X POST http://localhost:3001/api/health/cache/clear
```

### Monitoring Dashboards

- **Grafana**: http://grafana.yourdomain.com
  - API Overview Dashboard
  - System Metrics Dashboard
  - DORA Metrics Dashboard

- **Sentry**: https://sentry.io
  - Real-time error tracking
  - Performance monitoring

- **Prometheus**: http://prometheus.yourdomain.com:9090
  - Raw metrics queries
  - Alert status

---

## Contributing to Runbooks

When you encounter and resolve a new issue:

1. Document the problem
2. Write step-by-step resolution
3. Add it to this collection
4. Update this index

**Template:**
```markdown
# [Incident Name]

## Severity: [P0/P1/P2/P3]

## Symptoms
- What the user sees
- What alerts trigger
- What metrics show

## Causes
- Common root causes

## Diagnosis
Step-by-step investigation

## Resolution
Step-by-step fix

## Prevention
How to avoid this in the future

## Related
- Links to monitoring, logs, etc.
```

---

## Post-Incident Review

For P0/P1 incidents, conduct a blameless post-mortem:

1. **Timeline** - What happened when
2. **Root Cause** - Why it happened
3. **Impact** - Who was affected, for how long
4. **Resolution** - How it was fixed
5. **Action Items** - Prevent recurrence

**Store in:** `docs/postmortems/YYYY-MM-DD-incident-name.md`

---

**Need Help?**
- Check Grafana dashboards first
- Review relevant runbook
- Escalate if needed (PagerDuty)
- Document what you learn
