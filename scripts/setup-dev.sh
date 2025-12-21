#!/bin/bash

# ============================================
# Development Environment Setup Script
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "🚀 ============================================"
echo "🚀  Development Environment Setup"
echo "🚀 ============================================"
echo ""

# Check Node.js
log_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
log_success "Node.js $NODE_VERSION is installed"

# Check PostgreSQL
log_info "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    log_warning "PostgreSQL CLI not found. Make sure PostgreSQL is running."
else
    POSTGRES_VERSION=$(psql --version)
    log_success "PostgreSQL installed: $POSTGRES_VERSION"
fi

# Check Docker
log_info "Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    log_success "Docker installed: $DOCKER_VERSION"
else
    log_warning "Docker not found. You'll need to run services manually."
fi

# Install dependencies
log_info "Installing dependencies..."
log_info "This may take a few minutes..."

# Root dependencies
npm install

# Backend dependencies
log_info "Installing backend dependencies..."
cd backend
npm ci
cd ..

# Frontend dependencies
log_info "Installing frontend dependencies..."
cd apps/web
npm ci
cd ../..

log_success "All dependencies installed!"

# Setup environment files
log_info "Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    log_success "Created backend/.env from example"
    log_warning "⚠️  Please edit backend/.env with your actual configuration"
else
    log_info "backend/.env already exists, skipping..."
fi

if [ ! -f "apps/web/.env" ]; then
    cp apps/web/.env.example apps/web/.env
    log_success "Created apps/web/.env from example"
    log_warning "⚠️  Please edit apps/web/.env with your actual configuration"
else
    log_info "apps/web/.env already exists, skipping..."
fi

# Start Docker services (optional)
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    log_info "Starting Docker services (PostgreSQL, Redis)..."

    # Create docker-compose override for local development
    cat > docker-compose.override.yml << 'EOF'
version: '3.8'
services:
  postgres:
    ports:
      - "5432:5432"
  redis:
    ports:
      - "6379:6379"
EOF

    docker-compose up -d postgres redis

    log_success "Docker services started!"
    log_info "PostgreSQL: localhost:5432"
    log_info "Redis: localhost:6379"

    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    sleep 5

    # Run database migrations
    log_info "Running database migrations..."
    cd backend
    npm run db:migrate:up || log_warning "Migration failed or already up to date"

    # Seed demo data (optional)
    read -p "Do you want to seed demo data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
        log_success "Demo data seeded!"
    fi

    cd ..
else
    log_warning "Docker not available. Please set up PostgreSQL and Redis manually."
    log_info "PostgreSQL: Create database 'education_platform'"
    log_info "Redis: Make sure Redis is running on port 6379"
fi

# Create .gitignore entries
log_info "Ensuring .gitignore is up to date..."
cat >> .gitignore << 'EOF'

# Development
.DS_Store
*.log
.vscode/
.idea/

# Environment files
.env
.env.local
.env.*.local

# Docker override
docker-compose.override.yml
EOF

log_success "✅ Development environment setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Edit apps/web/.env with your configuration"
echo "3. Start development servers:"
echo "   npm run dev"
echo ""
echo "📚 Useful Commands:"
echo "   npm run dev                  - Start backend + frontend"
echo "   npm run test                 - Run all tests"
echo "   npm run lint                 - Lint all code"
echo "   npm run monitoring:start     - Start monitoring stack"
echo "   npm run health:check         - Check API health"
echo ""
echo "🎉 Happy coding!"
