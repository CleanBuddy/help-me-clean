#!/bin/bash
# Manual deployment script for Cloud Run
# Use this if you want to deploy without pushing to GitHub

set -e

PROJECT_ID="help-me-clean-486919"
REGION="eu-central2"

# Check arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [dev|prod]"
    echo "Example: $0 dev"
    exit 1
fi

ENV=$1

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "Error: Environment must be 'dev' or 'prod'"
    exit 1
fi

echo "🚀 Deploying to $ENV environment..."
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Find project root (where .git directory is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Generate a short SHA from current git commit or timestamp
if git rev-parse --git-dir > /dev/null 2>&1; then
    SHORT_SHA=$(git rev-parse --short=7 HEAD)
else
    SHORT_SHA=$(date +%s)
fi

echo "Using SHA: $SHORT_SHA"

# Build and deploy
if [ "$ENV" = "dev" ]; then
    echo "📦 Building and deploying development environment..."
    gcloud builds submit \
        --config=backend/cloudbuild.yaml \
        --substitutions=SHORT_SHA=$SHORT_SHA \
        .
else
    echo "📦 Building and deploying production environment..."
    gcloud builds submit \
        --config=backend/cloudbuild-prod.yaml \
        --substitutions=SHORT_SHA=$SHORT_SHA \
        .
fi

echo ""
echo "✅ Deployment complete!"
echo ""

# Get service URL
SERVICE_NAME="helpmeclean-backend-$ENV"
URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "🌐 Service URL: $URL"
echo ""
echo "Test GraphQL endpoint:"
echo "curl $URL/graphql"
