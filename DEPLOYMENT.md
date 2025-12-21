# Production Deployment Guide
## Elite Developer Methodology - Phase 4

Complete guide for deploying the Education Platform to production with zero-downtime deployment, monitoring, and rollback procedures.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Build & Deployment](#build--deployment)
5. [Monitoring & Observability](#monitoring--observability)
6. [Performance Optimization](#performance-optimization)
7. [Security Checklist](#security-checklist)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services

- **Node.js**: v18.x or v20.x (LTS)
- **PostgreSQL**: v14+ (with pg_stat_statements enabled)
- **Redis**: v7+ (optional, for caching)
- **Nginx**: v1.20+ (reverse proxy & load balancer)
- **Docker**: v24+ (for containerized deployment)
- **Prometheus**: v2.40+ (metrics collection)
- **Grafana**: v10+ (visualization)

### Required Accounts

- **AWS** (S3 for file storage, optional CloudFront CDN)
- **SendGrid** or **SMTP** (email delivery)
- **Stripe** (payment processing)
- **Sentry** (error tracking)
- **Google Cloud** (OAuth)
- **Kakao Developers** (OAuth)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/josens83/education-platform-2025.git
cd education-platform-2025
```

### 2. Configure Environment Variables

Create `.env` files for each environment:

#### Backend (.env)

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/education_platform
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=education_platform
DB_USER=production_user
DB_PASSWORD=your-secure-password
DB_SSL=true
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis Cache (Optional)
REDIS_URL=redis://your-redis-host:6379
REDIS_PASSWORD=your-redis-password

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# OAuth - Kakao
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=https://yourdomain.com/api/auth/kakao/callback

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Education Platform

# Or SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=education-platform-prod

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# OpenAI (AI Features)
OPENAI_API_KEY=sk-your-openai-api-key

# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production

# Admin Alerts
ADMIN_EMAIL=admin@yourdomain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook-url

# Security
CSRF_SECRET=your-csrf-secret-min-32-chars
COOKIE_SECRET=your-cookie-secret-min-32-chars

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Performance
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true
```

#### Frontend (apps/web/.env.production)

```bash
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_SENTRY_DSN=https://your-frontend-sentry-dsn@sentry.io/project-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## Database Setup

### 1. Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE education_platform;
CREATE USER production_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE education_platform TO production_user;

# Enable required extensions
\c education_platform
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

# Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO production_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO production_user;
```

### 2. Run Migrations

```bash
cd backend
npm install

# Run database initialization
node database/init.js

# Verify tables
psql -U production_user -d education_platform -c "\dt"
```

### 3. Database Backup Strategy

```bash
# Create backup script (backup-db.sh)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgres"
BACKUP_FILE="$BACKUP_DIR/education_platform_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR
pg_dump -U production_user education_platform | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Schedule in crontab
# 0 2 * * * /path/to/backup-db.sh
```

---

## Build & Deployment

### Option 1: Traditional Deployment (PM2)

#### 1. Build Frontend

```bash
cd apps/web
npm install
npm run build

# Output: apps/web/dist
```

#### 2. Deploy Backend

```bash
cd backend
npm install --production

# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### 3. PM2 Configuration (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'education-api',
    script: './server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
  }]
};
```

### Option 2: Docker Deployment

#### 1. Build Images

```bash
# Build backend
docker build -t education-platform-backend:latest -f backend/Dockerfile .

# Build frontend
docker build -t education-platform-frontend:latest -f apps/web/Dockerfile .
```

#### 2. Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: education-platform-backend:latest
    container_name: education-api
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    container_name: education-db
    restart: always
    environment:
      POSTGRES_DB: education_platform
      POSTGRES_USER: production_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: education-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: education-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./apps/web/dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

#### 3. Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Nginx Configuration

```nginx
# /etc/nginx/nginx.conf
upstream backend {
    least_conn;
    server localhost:3001 max_fails=3 fail_timeout=30s;
    # Add more backend instances for load balancing
    # server localhost:3002 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;

# Cache settings
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # Frontend Static Files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Proxy
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Auth endpoints - stricter rate limiting
    location /api/auth/ {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Socket.IO WebSocket
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Health Check
    location /api/health {
        proxy_pass http://backend;
        access_log off;
    }
}
```

---

## Monitoring & Observability

### 1. Start Monitoring Stack

```bash
# Start Prometheus, Grafana, Alertmanager
docker-compose -f docker-compose.monitoring.yml --profile full up -d

# Access dashboards
# Grafana: http://localhost:3001 (admin / admin)
# Prometheus: http://localhost:9090
# Alertmanager: http://localhost:9093
```

### 2. Configure Alerting

Edit `monitoring/alertmanager/config.yml` with your notification channels:

```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'

  - name: 'email'
    email_configs:
      - to: 'admin@yourdomain.com'
        from: 'alerts@yourdomain.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@yourdomain.com'
        auth_password: 'your-password'
```

### 3. Grafana Dashboards

Pre-configured dashboards are available in `monitoring/grafana/dashboards/`:
- API Overview (request rates, errors, latency)
- DORA Metrics (deployment frequency, lead time, MTTR, CFR)
- System Metrics (CPU, memory, disk, network)

Import them via Grafana UI or provision automatically.

---

## Performance Optimization

### 1. Frontend Performance

```bash
# Run Lighthouse CI
cd apps/web
npm run lighthouse

# Bundle analysis
npm run build
# View dist/stats.html for bundle size analysis
```

**Performance Targets:**
- Lighthouse Performance Score: > 90
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

### 2. Backend Performance

**Implemented Optimizations:**
- Redis caching for GET endpoints
- HTTP cache headers (ETag, Cache-Control)
- CDN-ready static asset serving
- Gzip & Brotli compression
- Database connection pooling
- Query optimization with indexes

**Monitor Performance:**
```bash
# Check cache hit rate
curl http://localhost:3001/api/health/cache

# View Prometheus metrics
curl http://localhost:3001/api/health/metrics
```

### 3. Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_progress_user_book ON progress(user_id, book_id);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM books WHERE status = 'active';

-- Enable query stats
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

---

## Security Checklist

### Pre-Deployment Security

- [ ] All environment variables are set in `.env` (not in code)
- [ ] JWT secrets are random and at least 32 characters
- [ ] Database uses strong password and SSL connection
- [ ] CORS is configured for production domain only
- [ ] Rate limiting is enabled for all API endpoints
- [ ] CSRF protection is enabled for mutation endpoints
- [ ] Helmet middleware is configured for security headers
- [ ] File upload size limits are enforced
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (input sanitization)
- [ ] Sensitive data is encrypted at rest
- [ ] HTTPS/TLS is enabled with valid certificates
- [ ] Admin endpoints are protected with authentication
- [ ] Error messages don't expose sensitive information
- [ ] Dependency vulnerabilities are checked (`npm audit`)
- [ ] Sentry is configured for error tracking

### Post-Deployment Verification

```bash
# Run security audit
npm audit --production

# Check for known vulnerabilities
npm audit fix

# SSL/TLS verification
openssl s_client -connect yourdomain.com:443

# Security headers check
curl -I https://yourdomain.com
```

---

## Rollback Procedures

### 1. Quick Rollback (PM2)

```bash
# View deployment history
pm2 list

# Rollback to previous version
pm2 restart education-api --update-env

# Or use specific version
git checkout <previous-commit>
npm install
pm2 restart education-api
```

### 2. Docker Rollback

```bash
# List images
docker images

# Deploy previous version
docker-compose -f docker-compose.prod.yml down
docker tag education-platform-backend:previous education-platform-backend:latest
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Database Rollback

```bash
# Restore from backup
gunzip < /var/backups/postgres/education_platform_20231215_020000.sql.gz | \
  psql -U production_user education_platform

# Or use pg_restore for custom format
pg_restore -U production_user -d education_platform backup.dump
```

---

## Troubleshooting

### Common Issues

#### 1. High Error Rate

```bash
# Check application logs
pm2 logs education-api --lines 100

# Check error logs
tail -f backend/logs/error-*.log

# View Sentry dashboard for error details
```

#### 2. Slow Response Times

```bash
# Check database connections
psql -U production_user -d education_platform -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql -U production_user -d education_platform -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check cache hit rate
curl http://localhost:3001/api/health/cache
```

#### 3. Memory Issues

```bash
# Check memory usage
free -h
pm2 monit

# Restart with memory limit
pm2 restart education-api --max-memory-restart 1G
```

#### 4. Database Connection Issues

```bash
# Test database connection
psql -U production_user -h your-db-host -d education_platform

# Check connection pool
curl http://localhost:3001/api/health | jq '.database.pool'

# Adjust pool size in .env
DB_POOL_MIN=5
DB_POOL_MAX=20
```

### Health Checks

```bash
# Basic health check
curl http://localhost:3001/api/health

# Detailed health check
curl http://localhost:3001/api/health/detailed

# Database health
curl http://localhost:3001/api/health/db

# Prometheus metrics
curl http://localhost:3001/api/health/metrics
```

---

## Zero-Downtime Deployment

### Using PM2 Cluster Mode

```bash
# Start in cluster mode (all CPU cores)
pm2 start ecosystem.config.js --env production

# Reload without downtime
pm2 reload education-api

# Graceful reload (wait for connections to close)
pm2 gracefulReload education-api
```

### Using Blue-Green Deployment

```bash
# Deploy to green environment
docker-compose -f docker-compose.green.yml up -d

# Test green environment
curl http://green.yourdomain.com/api/health

# Switch Nginx to green
# Edit nginx.conf to point to green environment
nginx -s reload

# If issues, switch back to blue
# Edit nginx.conf to point to blue environment
nginx -s reload
```

---

## Performance Benchmarks

### Expected Performance

- **API Response Time (P95)**: < 200ms
- **Database Query Time (P95)**: < 100ms
- **Cache Hit Rate**: > 80%
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Simple load test
ab -n 1000 -c 100 https://yourdomain.com/api/health

# Or use k6 for advanced testing
k6 run load-test.js
```

---

## Maintenance Tasks

### Daily
- Monitor error rates in Grafana
- Check Sentry for new errors
- Review alert notifications

### Weekly
- Review performance metrics
- Check disk space usage
- Analyze slow queries

### Monthly
- Update dependencies (`npm update`)
- Review security patches (`npm audit`)
- Database optimization (VACUUM, ANALYZE)
- Certificate renewal check

---

## Support & Documentation

- **API Documentation**: https://yourdomain.com/api-docs
- **Monitoring**: https://grafana.yourdomain.com
- **Error Tracking**: https://sentry.io
- **Project Repository**: https://github.com/josens83/education-platform-2025

---

**Elite Developer Methodology - Phase 4**
Production-ready deployment with zero downtime, comprehensive monitoring, and automated rollback procedures.
