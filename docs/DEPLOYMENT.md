# Deployment Guide

Complete guide for deploying the Education Platform to production and staging environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Database Setup](#database-setup)
7. [SSL/TLS Configuration](#ssltls-configuration)
8. [Monitoring Setup](#monitoring-setup)
9. [Security Checklist](#security-checklist)
10. [Rollback Procedures](#rollback-procedures)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **CPU**: 2+ cores (4+ recommended for production)
- **RAM**: 4GB minimum (8GB+ recommended for production)
- **Storage**: 20GB+ available space
- **OS**: Ubuntu 20.04+, Debian 11+, or compatible Linux distribution
- **Network**: Public IP address with open ports 80 (HTTP) and 443 (HTTPS)

### Required Software

```bash
# Node.js (v16+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL (v15+)
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get -y install postgresql-15

# Redis (v7+)
sudo apt-get install -y redis-server

# Docker & Docker Compose (recommended)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Nginx (for reverse proxy)
sudo apt-get install -y nginx

# Certbot (for SSL certificates)
sudo apt-get install -y certbot python3-certbot-nginx
```

---

## Environment Setup

### 1. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/josens83/education-platform-2025.git
cd education-platform-2025
sudo chown -R $USER:$USER .
```

### 2. Configure Environment Variables

**For Production:**
```bash
# Backend
cp backend/.env.example backend/.env
nano backend/.env

# Update critical values:
NODE_ENV=production
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD@localhost:5432/education_platform
JWT_SECRET=GENERATE_STRONG_RANDOM_SECRET_HERE
SESSION_SECRET=GENERATE_STRONG_RANDOM_SECRET_HERE
CSRF_SECRET=GENERATE_STRONG_RANDOM_SECRET_HERE

# Frontend
cp apps/web/.env.example apps/web/.env
nano apps/web/.env
```

**Generate Secure Secrets:**
```bash
# Generate strong random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm ci --only=production
cd ..

# Frontend
cd apps/web
npm ci --only=production
npm run build
cd ../..
```

---

## Deployment Options

### Option 1: Docker Deployment (Recommended)

**Advantages:**
- ✅ Isolated environment
- ✅ Easy rollback
- ✅ Consistent across environments
- ✅ Simple scaling

**Disadvantages:**
- ❌ Requires Docker knowledge
- ❌ Additional resource overhead

### Option 2: Manual Deployment

**Advantages:**
- ✅ Full control
- ✅ Lower resource usage
- ✅ Direct debugging

**Disadvantages:**
- ❌ Manual dependency management
- ❌ Complex rollback
- ❌ Environment inconsistencies

### Option 3: Cloud Platform Deployment

- **AWS**: EC2, RDS, ElastiCache, S3
- **GCP**: Compute Engine, Cloud SQL, Cloud Storage
- **Azure**: Virtual Machines, Azure Database for PostgreSQL
- **DigitalOcean**: Droplets, Managed Databases
- **Heroku**: Easy deployment with buildpacks

---

## Docker Deployment

### Production Deployment

1. **Configure Environment:**
```bash
cp .env.example .env
nano .env  # Edit with production values
```

2. **Start Services:**
```bash
docker-compose -f docker-compose.yml up -d
```

3. **Run Database Migrations:**
```bash
docker-compose exec backend npm run db:migrate:up
```

4. **Seed Initial Data (Optional):**
```bash
docker-compose exec backend npm run db:seed
```

5. **Verify Deployment:**
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test health endpoint
curl http://localhost:5000/api/health
```

### Staging Deployment

```bash
# Use staging configuration
docker-compose -f docker-compose.staging.yml up -d

# Or use the deployment script
./scripts/deploy-staging.sh
```

### Docker Commands

```bash
# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Remove volumes (⚠️ CAUTION: Deletes data)
docker-compose down -v

# Update images
docker-compose pull
docker-compose up -d

# Execute command in container
docker-compose exec backend npm run [command]
```

---

## Manual Deployment

### 1. Database Setup

```bash
# Create production database
sudo -u postgres psql

postgres=# CREATE DATABASE education_platform;
postgres=# CREATE USER education_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
postgres=# GRANT ALL PRIVILEGES ON DATABASE education_platform TO education_user;
postgres=# \q

# Run schema initialization
psql -U education_user -d education_platform -f backend/database/init.sql

# Run migrations
cd backend
npm run db:migrate:up
```

### 2. Redis Setup

```bash
# Configure Redis for production
sudo nano /etc/redis/redis.conf

# Update:
# bind 127.0.0.1
# requirepass YOUR_STRONG_PASSWORD
# maxmemory 512mb
# maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis
```

### 3. Backend Setup

```bash
# Install PM2 for process management
sudo npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name education-api -i max

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Run the command it outputs

# Monitor
pm2 monit
```

### 4. Frontend Build

```bash
cd apps/web
npm run build

# Serve with Nginx (configured below)
```

### 5. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/education-platform

# Add configuration (see nginx/production.conf)
# Then enable:
sudo ln -s /etc/nginx/sites-available/education-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Example Nginx Config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/education-platform-2025/apps/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Database Setup

### Migration Management

```bash
# Check migration status
npm run db:migrate:status

# Run all pending migrations
npm run db:migrate:up

# Rollback last migration
npm run db:migrate:down

# Create new migration
npm run db:migrate:create add_new_feature
```

### Backup & Restore

**Automated Backup Script:**
```bash
#!/bin/bash
# /usr/local/bin/backup-database.sh

BACKUP_DIR="/var/backups/education-platform"
DATE=$(date +%Y%m%d_%H%M%S)
DATABASE="education_platform"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump $DATABASE | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Setup Cron Job:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/backup.log 2>&1
```

**Restore Backup:**
```bash
# Restore from backup
gunzip -c /var/backups/education-platform/backup_20250115_020000.sql.gz | psql education_platform
```

---

## SSL/TLS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run

# Certbot will auto-renew via systemd timer
sudo systemctl status certbot.timer
```

### Using Custom SSL Certificate

```bash
# Copy certificates
sudo mkdir -p /etc/nginx/ssl
sudo cp fullchain.pem /etc/nginx/ssl/
sudo cp privkey.pem /etc/nginx/ssl/
sudo chmod 600 /etc/nginx/ssl/privkey.pem

# Update Nginx configuration
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

---

## Monitoring Setup

### 1. Health Checks

```bash
# Setup health check monitoring
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  ...
}
```

### 2. Log Management

```bash
# Backend logs (PM2)
pm2 logs education-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### 3. Prometheus & Grafana (Optional)

```bash
# Deploy monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access:
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
```

### 4. Application Monitoring with Sentry

Already configured in the application. Just set:
```bash
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production
```

---

## Security Checklist

### Before Going Live

- [ ] **Environment Variables**
  - [ ] All secrets are strong random values (64+ characters)
  - [ ] No default/example values in production
  - [ ] Environment variables are not committed to git

- [ ] **Database Security**
  - [ ] Strong database password
  - [ ] Database only accessible from backend
  - [ ] Regular backups configured
  - [ ] SSL/TLS connection enabled

- [ ] **SSL/TLS**
  - [ ] Valid SSL certificate installed
  - [ ] HTTP to HTTPS redirect configured
  - [ ] HSTS enabled
  - [ ] Strong cipher suites configured

- [ ] **Application Security**
  - [ ] JWT secrets are strong and unique
  - [ ] CSRF protection enabled
  - [ ] Rate limiting configured
  - [ ] Helmet.js security headers enabled
  - [ ] Input validation on all endpoints
  - [ ] SQL injection protection (parameterized queries)
  - [ ] XSS protection enabled

- [ ] **Access Control**
  - [ ] Admin routes protected
  - [ ] Role-based access control implemented
  - [ ] API documentation access restricted in production
  - [ ] Database admin tools not publicly accessible

- [ ] **Monitoring & Logging**
  - [ ] Error tracking configured (Sentry)
  - [ ] Log rotation configured
  - [ ] Health checks running
  - [ ] Uptime monitoring configured

- [ ] **Infrastructure**
  - [ ] Firewall configured (only 80, 443, 22 open)
  - [ ] SSH key-only authentication
  - [ ] Regular security updates enabled
  - [ ] Intrusion detection configured

### Security Headers Configuration

Already configured via Helmet.js:
```javascript
{
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}
```

---

## Rollback Procedures

### Docker Deployment Rollback

```bash
# Tag current version before deploying
docker tag education-platform-backend:latest education-platform-backend:backup-$(date +%Y%m%d)

# If deployment fails, rollback:
docker-compose down
git checkout previous-commit-hash
docker-compose up -d --build
```

### Manual Deployment Rollback

```bash
# Using Git
git log --oneline  # Find commit hash
git checkout commit-hash

# Rebuild frontend
cd apps/web
npm run build

# Restart backend
pm2 restart education-api

# Rollback database (if needed)
npm run db:migrate:down
```

### Database Rollback

```bash
# Rollback one migration
cd backend
npm run db:migrate:down

# Restore from backup
gunzip -c /var/backups/education-platform/backup_date.sql.gz | psql education_platform
```

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Check logs:**
```bash
pm2 logs education-api
# or
docker-compose logs backend
```

**Common causes:**
- Database connection failed → Check DATABASE_URL
- Port already in use → Check `lsof -i :5000`
- Environment variables missing → Check .env file
- Dependencies not installed → Run `npm ci`

#### 2. Database Connection Errors

```bash
# Test database connection
psql -U education_user -d education_platform -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Common fixes:
# - Update pg_hba.conf for authentication
# - Check DATABASE_URL format
# - Verify database user permissions
```

#### 3. Redis Connection Errors

```bash
# Test Redis connection
redis-cli ping

# With password
redis-cli -a your_password ping

# Check Redis status
sudo systemctl status redis

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

#### 4. SSL Certificate Issues

```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew --force-renewal

# Check certificate expiry
sudo certbot certificates
```

#### 5. High CPU/Memory Usage

```bash
# Check resource usage
htop

# Check Node.js processes
pm2 monit

# Check database connections
psql -U education_user -d education_platform -c "SELECT * FROM pg_stat_activity;"

# Restart services if needed
pm2 restart education-api
sudo systemctl restart postgresql
```

#### 6. Slow API Response

**Check:**
1. Database query performance:
```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

2. Add database indexes:
```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_books_category ON books(category_id);
```

3. Check connection pool:
```bash
curl http://localhost:5000/api/health/db
```

#### 7. CORS Errors

**Update backend .env:**
```bash
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Restart backend:**
```bash
pm2 restart education-api
```

### Performance Optimization

#### Enable Gzip Compression

Already enabled in Nginx configuration.

#### Database Query Optimization

```sql
-- Analyze slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_name ON table_name(column_name);

-- Update statistics
ANALYZE;
```

#### Redis Caching

Already implemented for:
- Session storage
- Socket.IO adapter
- API response caching (can be extended)

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Code reviewed and approved
- [ ] Database migrations created and tested
- [ ] Environment variables configured
- [ ] Security checklist completed
- [ ] Backup current database
- [ ] Notify users of maintenance window (if applicable)

### Deployment Steps

1. [ ] Pull latest code
2. [ ] Install/update dependencies
3. [ ] Run database migrations
4. [ ] Build frontend assets
5. [ ] Restart backend services
6. [ ] Verify health checks
7. [ ] Test critical user flows
8. [ ] Monitor logs for errors
9. [ ] Update documentation

### Post-Deployment

- [ ] Verify all services running
- [ ] Check error logs
- [ ] Test authentication flow
- [ ] Test payment processing
- [ ] Verify email sending
- [ ] Check monitoring dashboards
- [ ] Update status page (if applicable)
- [ ] Notify team of successful deployment

---

## Support & Resources

- **GitHub Issues**: https://github.com/josens83/education-platform-2025/issues
- **API Documentation**: https://yourdomain.com/api-docs
- **System Status**: https://yourdomain.com/api/health

---

## Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh - Automated deployment script

set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd backend && npm ci --only=production && cd ..
cd apps/web && npm ci --only=production && cd ../..

# Run migrations
echo "🗄️  Running database migrations..."
cd backend && npm run db:migrate:up && cd ..

# Build frontend
echo "🏗️  Building frontend..."
cd apps/web && npm run build && cd ../..

# Restart services
echo "♻️  Restarting services..."
pm2 restart education-api

# Health check
echo "🏥 Running health check..."
sleep 5
curl -f http://localhost:5000/api/health || exit 1

echo "✅ Deployment completed successfully!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

---

## License

This deployment guide is part of the Education Platform project.
