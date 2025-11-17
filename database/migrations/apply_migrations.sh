#!/bin/bash
# Apply database migrations
# Usage: ./apply_migrations.sh

set -e

echo "🔄 Applying database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Apply migrations in order
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Enable pg_trgm extension for text search (if not already enabled)
echo "📦 Enabling pg_trgm extension..."
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;" || echo "⚠️  Could not enable pg_trgm extension (may already exist or require superuser)"

# Apply performance indexes migration
echo "📊 Applying performance indexes..."
psql "$DATABASE_URL" -f "$SCRIPT_DIR/002_performance_indexes.sql"

echo "✅ All migrations applied successfully!"
echo ""
echo "📈 Database statistics:"
psql "$DATABASE_URL" -c "SELECT schemaname, tablename, n_live_tup as rows FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 10;"
