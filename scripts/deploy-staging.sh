#!/bin/bash

# ============================================
# Staging Deployment Script
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.staging exists
if [ ! -f ".env.staging" ]; then
    log_error ".env.staging file not found!"
    log_info "Please copy .env.staging.example to .env.staging and configure it."
    exit 1
fi

log_info "Starting staging deployment..."

# Pull latest code
log_info "Pulling latest code from git..."
git pull origin main || { log_error "Failed to pull latest code"; exit 1; }

# Load environment variables
log_info "Loading environment variables..."
export $(cat .env.staging | grep -v '^#' | xargs)

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f docker-compose.staging.yml down

# Remove old images (optional - uncomment if needed)
# log_warning "Removing old Docker images..."
# docker image prune -f

# Build new images
log_info "Building Docker images..."
docker-compose -f docker-compose.staging.yml build --no-cache || { log_error "Docker build failed"; exit 1; }

# Start services
log_info "Starting services..."
docker-compose -f docker-compose.staging.yml up -d || { log_error "Failed to start services"; exit 1; }

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 10

# Check if backend is healthy
log_info "Checking backend health..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:5001/health > /dev/null 2>&1; then
        log_success "Backend is healthy!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    log_info "Waiting for backend to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_error "Backend health check failed after $MAX_RETRIES attempts"
    docker-compose -f docker-compose.staging.yml logs backend
    exit 1
fi

# Run database migrations
log_info "Running database migrations..."
docker-compose -f docker-compose.staging.yml exec -T backend npm run db:migrate:up || log_warning "Migration failed or already up to date"

# Optional: Seed demo data (uncomment if needed)
# log_info "Seeding demo data..."
# docker-compose -f docker-compose.staging.yml exec -T backend npm run db:seed

# Show running containers
log_info "Running containers:"
docker-compose -f docker-compose.staging.yml ps

# Show logs (last 50 lines)
log_info "Recent logs:"
docker-compose -f docker-compose.staging.yml logs --tail=50

log_success "========================================="
log_success "Staging deployment completed successfully!"
log_success "========================================="
log_info ""
log_info "Services are running at:"
log_info "  Frontend: http://localhost:3001"
log_info "  Backend API: http://localhost:5001"
log_info "  API Docs: http://localhost:5001/api-docs"
log_info "  Prometheus: http://localhost:9091"
log_info "  Grafana: http://localhost:3002 (admin/staging_admin_password)"
log_info ""
log_info "To view logs:"
log_info "  docker-compose -f docker-compose.staging.yml logs -f [service-name]"
log_info ""
log_info "To stop all services:"
log_info "  docker-compose -f docker-compose.staging.yml down"
