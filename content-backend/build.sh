#!/usr/bin/env bash
# Build script for Render.com deployment

set -o errexit  # Exit on error

echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "🔄 Running database migrations..."
cd /opt/render/project/src/content-backend
alembic upgrade head

echo "✅ Build completed successfully!"
