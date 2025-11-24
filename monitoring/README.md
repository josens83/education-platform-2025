# Monitoring Setup

Complete monitoring stack for the Education Platform using Prometheus and Grafana.

## Quick Start

### Start Monitoring Stack

```bash
# Basic stack (Prometheus + Grafana + Node Exporter)
docker-compose -f docker-compose.monitoring.yml up -d

# Full stack (includes PostgreSQL, Redis, Nginx exporters)
docker-compose -f docker-compose.monitoring.yml --profile full up -d
```

### Access Dashboards

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Node Exporter**: http://localhost:9100/metrics

## Components

### Prometheus
- **Port**: 9090
- **Purpose**: Metrics collection and storage
- **Config**: `prometheus.yml`
- **Alerts**: `alerts/api-alerts.yml`
- **Retention**: 30 days

### Grafana
- **Port**: 3000
- **Purpose**: Visualization and dashboards
- **Default User**: admin/admin (change after first login!)
- **Dashboards**: Auto-provisioned from `grafana-dashboards/`

### Node Exporter
- **Port**: 9100
- **Purpose**: System-level metrics (CPU, memory, disk, network)

### PostgreSQL Exporter (optional)
- **Port**: 9187
- **Purpose**: Database metrics (connections, queries, performance)

### Redis Exporter (optional)
- **Port**: 9121
- **Purpose**: Redis metrics (memory, commands, keys)

### Nginx Exporter (optional)
- **Port**: 9113
- **Purpose**: Nginx metrics (requests, connections)

## Metrics Available

### Application Metrics
- `service_uptime_seconds` - Service uptime
- `http_requests_total` - Total HTTP requests
- `http_errors_total` - Total HTTP errors
- `http_request_duration_ms_avg` - Average request duration

### Process Metrics
- `process_memory_rss_bytes` - Resident Set Size
- `process_memory_heap_total_bytes` - Total heap size
- `process_memory_heap_used_bytes` - Used heap size
- `process_uptime_seconds` - Process uptime

### System Metrics
- `system_memory_total_bytes` - Total system memory
- `system_memory_free_bytes` - Free system memory
- `system_cpu_usage_percent` - CPU usage percentage
- `system_load_average_*` - System load averages

### Database Metrics
- `db_pool_connections_total` - Total pool connections
- `db_pool_connections_idle` - Idle connections
- `db_pool_connections_waiting` - Waiting connections

## Alerts

Alerts are configured in `alerts/api-alerts.yml`:

### Critical Alerts
- **ServiceDown**: API is unreachable
- **VeryHighErrorRate**: >5 errors/second for 2+ minutes
- **CriticalMemoryUsage**: >90% memory usage for 5+ minutes
- **CriticalCPUUsage**: >95% CPU usage for 5+ minutes

### Warning Alerts
- **HighErrorRate**: >1 error/second for 5+ minutes
- **SlowResponseTime**: >500ms average for 10+ minutes
- **HighMemoryUsage**: >80% memory usage for 10+ minutes
- **HighCPUUsage**: >80% CPU usage for 10+ minutes
- **DatabasePoolFull**: No idle connections
- **HighDatabasePoolUsage**: >80% pool usage

## Grafana Dashboards

Pre-configured dashboard: **Education Platform - Backend API**

### Panels:
1. **Service Uptime** - How long the service has been running
2. **Request Rate** - Requests per second
3. **Average Response Time** - API response latency
4. **Memory Usage** - Heap memory utilization
5. **CPU Usage** - System CPU consumption
6. **Database Pool Connections** - Connection pool status
7. **Error Rate** - Errors per second

## Customization

### Adding Custom Metrics

1. **In your code**, expose metrics in Prometheus format:
```javascript
// Already implemented in backend/routes/health.js
router.get('/api/health/metrics', async (req, res) => {
  const metrics = `
# HELP my_custom_metric Description of metric
# TYPE my_custom_metric gauge
my_custom_metric ${value}
  `;
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
});
```

2. **Prometheus will scrape** it automatically (already configured)

3. **Add to Grafana**:
   - Create new panel
   - Use PromQL query: `my_custom_metric`

### Adding Custom Alerts

Edit `alerts/api-alerts.yml`:

```yaml
- alert: MyCustomAlert
  expr: my_custom_metric > 100
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Custom alert triggered"
    description: "Value is {{ $value }}."
```

Reload Prometheus:
```bash
curl -X POST http://localhost:9090/-/reload
```

## Production Recommendations

### 1. Secure Dashboards

Change default passwords:
```bash
# Set via environment variables
GRAFANA_ADMIN_USER=your_username
GRAFANA_ADMIN_PASSWORD=strong_password
```

### 2. Enable Authentication

Add to `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'backend-api'
    basic_auth:
      username: 'prometheus'
      password: 'secure_password'
```

### 3. Set Up Alertmanager

Configure notifications in `alertmanager.yml`:
```yaml
route:
  receiver: 'email'
receivers:
  - name: 'email'
    email_configs:
      - to: 'alerts@yourdomain.com'
        from: 'prometheus@yourdomain.com'
```

### 4. Increase Retention

For production, increase retention period:
```yaml
command:
  - '--storage.tsdb.retention.time=90d'  # 90 days
```

### 5. Use External Storage

For long-term storage, configure remote write:
```yaml
remote_write:
  - url: "https://your-prometheus-remote-storage.com/api/v1/write"
```

## Troubleshooting

### Metrics not showing in Grafana

1. Check Prometheus is scraping:
   ```bash
   curl http://localhost:9090/api/v1/targets
   ```

2. Check datasource connection in Grafana:
   - Configuration → Data Sources → Prometheus
   - Click "Test" button

3. Verify metrics endpoint:
   ```bash
   curl http://localhost:5000/api/health/metrics
   ```

### High Memory Usage

Reduce retention or scrape interval:
```yaml
global:
  scrape_interval: 30s  # Instead of 15s
```

### Alerts Not Firing

1. Check alert rules:
   ```bash
   curl http://localhost:9090/api/v1/rules
   ```

2. Check Alertmanager:
   ```bash
   curl http://localhost:9093/api/v1/alerts
   ```

## Useful PromQL Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error percentage
(rate(http_errors_total[5m]) / rate(http_requests_total[5m])) * 100

# Memory growth rate
deriv(process_memory_heap_used_bytes[5m])

# 99th percentile response time (requires histogram)
histogram_quantile(0.99, http_request_duration_seconds_bucket)

# Database connection usage
(db_pool_connections_total - db_pool_connections_idle) / db_pool_connections_total * 100
```

## Integration with External Services

### Grafana Cloud

```yaml
remote_write:
  - url: https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push
    basic_auth:
      username: 'your_username'
      password: 'your_api_key'
```

### Datadog

Use Datadog Agent with Prometheus integration.

### New Relic

Configure New Relic Prometheus integration.

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Cheatsheet](https://promlabs.com/promql-cheat-sheet/)
- [Grafana Dashboard Gallery](https://grafana.com/grafana/dashboards/)
