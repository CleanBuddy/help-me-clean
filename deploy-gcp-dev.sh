#!/bin/bash
# HelpMeClean.ro - GCP Development Environment Deployment
# Deploy backend with security environment variables

set -e  # Exit on error

echo "🚀 Deploying HelpMeClean Backend to GCP Development..."

# Configuration
PROJECT_ID="helpmeclean-dev"
REGION="europe-west1"
SERVICE_NAME="helpmeclean-backend-dev"
IMAGE="gcr.io/${PROJECT_ID}/backend:latest"

# Set GCP project
echo "📦 Setting GCP project: ${PROJECT_ID}"
gcloud config set project ${PROJECT_ID}

# Deploy to Cloud Run with security environment variables
echo "🔧 Deploying to Cloud Run with environment variables..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "\
ENVIRONMENT=development,\
PORT=8080,\
RATE_LIMIT_PER_MINUTE=200,\
RATE_LIMIT_STRICT_PER_MINUTE=50,\
GRAPHQL_MAX_DEPTH=10,\
GRAPHQL_MAX_COMPLEXITY=100,\
MAX_FILE_SIZE=10485760,\
ERROR_STRICT_MODE=false,\
USE_LOCAL_STORAGE=false,\
GCS_BUCKET=helpmeclean-dev-uploads,\
GCS_PROJECT_ID=helpmeclean-dev,\
FIREBASE_PROJECT_ID=helpmeclean-dev,\
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,https://dev-helpmeclean.vercel.app" \
  --set-secrets "\
DATABASE_URL=database-url-dev:latest,\
JWT_SECRET=jwt-secret-dev:latest,\
GOOGLE_CLIENT_ID=google-client-id-dev:latest,\
GOOGLE_CLIENT_ID_IOS=google-client-id-ios-dev:latest,\
GOOGLE_CLIENT_ID_ANDROID=google-client-id-android-dev:latest,\
STRIPE_SECRET_KEY=stripe-secret-key-dev:latest,\
STRIPE_WEBHOOK_SECRET=stripe-webhook-secret-dev:latest,\
STRIPE_PUBLISHABLE_KEY=stripe-publishable-key-dev:latest,\
FACTUREAZA_API_KEY=factureaza-api-key-dev:latest"

echo "✅ Deployment to development complete!"
echo ""
echo "🔗 Service URL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)'
echo ""
echo "📊 View logs:"
echo "gcloud logs tail --follow --project=${PROJECT_ID}"
echo ""
echo "🧪 Test health endpoint:"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')
echo "curl ${SERVICE_URL}/health"
