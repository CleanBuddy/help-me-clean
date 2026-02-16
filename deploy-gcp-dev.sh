#!/bin/bash
# HelpMeClean.ro - GCP Development Environment Deployment
# Deploy backend with all configuration via Secret Manager

set -e  # Exit on error

echo "🚀 Deploying HelpMeClean Backend to GCP Development..."

# Configuration
PROJECT_ID="help-me-clean"
REGION="europe-west1"
SERVICE_NAME="helpmeclean-backend-dev"
IMAGE="gcr.io/${PROJECT_ID}/backend:dev"

# Set GCP project
echo "📦 Setting GCP project: ${PROJECT_ID}"
gcloud config set project ${PROJECT_ID}

# Build and push Docker image
echo "🔨 Building Docker image..."
cd backend
docker build -t ${IMAGE} .

echo "📤 Pushing to Container Registry..."
docker push ${IMAGE}
cd ..

# Deploy to Cloud Run with ALL configuration via secrets
echo "🔧 Deploying to Cloud Run (Development service)..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-secrets "\
ENVIRONMENT=dev_environment:latest,\
PORT=dev_port:latest,\
DATABASE_URL=dev_database_url:latest,\
JWT_SECRET=dev_jwt_secret:latest,\
GOOGLE_CLIENT_ID=dev_google_client_id:latest,\
STRIPE_SECRET_KEY=dev_stripe_secret_key:latest,\
STRIPE_WEBHOOK_SECRET=dev_stripe_webhook_secret:latest,\
STRIPE_PUBLISHABLE_KEY=dev_stripe_publishable_key:latest,\
STRIPE_CONNECT_RETURN_URL=dev_stripe_connect_return_url:latest,\
STRIPE_CONNECT_REFRESH_URL=dev_stripe_connect_refresh_url:latest,\
FACTUREAZA_API_URL=dev_factureaza_api_url:latest,\
FACTUREAZA_API_KEY=dev_factureaza_api_key:latest,\
GCS_BUCKET=dev_gcs_bucket:latest,\
GCS_PROJECT_ID=dev_gcs_project_id:latest,\
ALLOWED_ORIGINS=dev_allowed_origins:latest,\
COOKIE_DOMAIN=dev_cookie_domain:latest,\
RATE_LIMIT_PER_MINUTE=dev_rate_limit_per_minute:latest,\
RATE_LIMIT_STRICT_PER_MINUTE=dev_rate_limit_strict_per_minute:latest,\
GRAPHQL_MAX_DEPTH=dev_graphql_max_depth:latest,\
GRAPHQL_MAX_COMPLEXITY=dev_graphql_max_complexity:latest,\
MAX_FILE_SIZE=dev_max_file_size:latest,\
ERROR_STRICT_MODE=dev_error_strict_mode:latest"

echo "✅ Deployment to development complete!"
echo ""
echo "🔗 Service URL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)'
echo ""
echo "📊 View logs:"
echo "gcloud logs tail --follow --project=${PROJECT_ID} --filter=\"resource.labels.service_name=${SERVICE_NAME}\""
echo ""
echo "🧪 Test health endpoint:"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')
echo "curl ${SERVICE_URL}/health"
