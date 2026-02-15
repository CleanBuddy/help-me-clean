#!/bin/bash
# Run database migrations on Neon databases

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$BACKEND_DIR/internal/db/migrations"

echo "🗄️  Running database migrations on Neon..."
echo ""

# Development database
echo "📦 Migrating DEVELOPMENT database..."
DEV_DB_URL="postgresql://neondb_owner:npg_pderYcxyJ82G@ep-late-waterfall-agcqcvau-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Check if golang-migrate is installed
if ! command -v migrate &> /dev/null; then
    echo "❌ golang-migrate not found. Installing..."
    go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
fi

# Run migrations on dev
migrate -path "$MIGRATIONS_DIR" -database "$DEV_DB_URL" up

echo "✅ Development database migrated!"
echo ""

# Production database
echo "📦 Migrating PRODUCTION database..."
PROD_DB_URL="postgresql://neondb_owner:npg_pderYcxyJ82G@ep-odd-dawn-agcm1p89-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Run migrations on prod
migrate -path "$MIGRATIONS_DIR" -database "$PROD_DB_URL" up

echo "✅ Production database migrated!"
echo ""
echo "🎉 All migrations complete!"
echo ""
echo "Verify migrations:"
echo "Dev:  migrate -path $MIGRATIONS_DIR -database \"$DEV_DB_URL\" version"
echo "Prod: migrate -path $MIGRATIONS_DIR -database \"$PROD_DB_URL\" version"
