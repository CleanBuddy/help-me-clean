#!/bin/bash
# HelpMeClean.ro - GCP Production Environment Deployment
# Deploy backend with all configuration via Secret Manager

set -e  # Exit on error

echo "🚀 Deploying HelpMeClean Backend to GCP Production..."
echo "⚠️  WARNING: This will deploy to PRODUCTION!"
echo ""
read -p "Are you sure you want to deploy to production? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled."
    exit 0
fi

# Configuration
PROJECT_ID="helpmeclean-prod"
REGION="europe-west1"
SERVICE_NAME="helpmeclean-backend"
IMAGE="gcr.io/${PROJECT_ID}/backend:latest"

# Set GCP project
echo "📦 Setting GCP project: ${PROJECT_ID}"
gcloud config set project ${PROJECT_ID}

# Deploy to Cloud Run with ALL configuration via secrets
echo "🔧 Deploying to Cloud Run with Secret Manager configuration..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --min-instances 1 \
  --max-instances 100 \
  --set-secrets "\
ENVIRONMENT=prod_environment:latest,\
PORT=prod_port:latest,\
DATABASE_URL=prod_database_url:latest,\
JWT_SECRET=prod_jwt_secret:latest,\
JWT_EXPIRY=prod_jwt_expiry:latest,\
GOOGLE_CLIENT_ID=prod_google_client_id:latest,\
GOOGLE_CLIENT_ID_IOS=prod_google_client_id_ios:latest,\
GOOGLE_CLIENT_ID_ANDROID=prod_google_client_id_android:latest,\
STRIPE_SECRET_KEY=prod_stripe_secret_key:latest,\
STRIPE_WEBHOOK_SECRET=prod_stripe_webhook_secret:latest,\
STRIPE_PUBLISHABLE_KEY=prod_stripe_publishable_key:latest,\
STRIPE_CONNECT_RETURN_URL=prod_stripe_connect_return_url:latest,\
STRIPE_CONNECT_REFRESH_URL=prod_stripe_connect_refresh_url:latest,\
FACTUREAZA_API_URL=prod_factureaza_api_url:latest,\
FACTUREAZA_API_KEY=prod_factureaza_api_key:latest,\
PLATFORM_COMPANY_NAME=prod_platform_company_name:latest,\
PLATFORM_CUI=prod_platform_cui:latest,\
PLATFORM_REG_NUMBER=prod_platform_reg_number:latest,\
PLATFORM_ADDRESS=prod_platform_address:latest,\
PLATFORM_CITY=prod_platform_city:latest,\
PLATFORM_COUNTY=prod_platform_county:latest,\
PLATFORM_IS_VAT_PAYER=prod_platform_is_vat_payer:latest,\
PLATFORM_BANK_NAME=prod_platform_bank_name:latest,\
PLATFORM_IBAN=prod_platform_iban:latest,\
USE_LOCAL_STORAGE=prod_use_local_storage:latest,\
GCS_BUCKET=prod_gcs_bucket:latest,\
GCS_PROJECT_ID=prod_gcs_project_id:latest,\
FIREBASE_PROJECT_ID=prod_firebase_project_id:latest,\
ALLOWED_ORIGINS=prod_allowed_origins:latest,\
COOKIE_DOMAIN=prod_cookie_domain:latest,\
RATE_LIMIT_PER_MINUTE=prod_rate_limit_per_minute:latest,\
RATE_LIMIT_STRICT_PER_MINUTE=prod_rate_limit_strict_per_minute:latest,\
GRAPHQL_MAX_DEPTH=prod_graphql_max_depth:latest,\
GRAPHQL_MAX_COMPLEXITY=prod_graphql_max_complexity:latest,\
MAX_FILE_SIZE=prod_max_file_size:latest,\
ERROR_STRICT_MODE=prod_error_strict_mode:latest"

echo "✅ Deployment to production complete!"
echo ""
echo "🔗 Service URL:"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')
echo "${SERVICE_URL}"
echo ""
echo "📊 View logs:"
echo "gcloud logs tail --follow --project=${PROJECT_ID}"
echo ""
echo "🧪 Test endpoints:"
echo "curl ${SERVICE_URL}/health"
echo ""
echo "⚠️  Post-deployment checklist:"
echo "1. Test login/logout flow"
echo "2. Test file upload validation"
echo "3. Test rate limiting (send 11 requests quickly)"
echo "4. Verify security headers (curl -I ${SERVICE_URL}/health)"
echo "5. Monitor error logs for 24 hours"
