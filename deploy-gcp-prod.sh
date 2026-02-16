#!/bin/bash
# HelpMeClean.ro - GCP Production Environment Deployment
# Deploy backend with security environment variables

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

# Deploy to Cloud Run with security environment variables
echo "🔧 Deploying to Cloud Run with environment variables..."
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
  --set-env-vars "\
ENVIRONMENT=production,\
PORT=8080,\
COOKIE_DOMAIN=.helpmeclean.ro,\
RATE_LIMIT_PER_MINUTE=100,\
RATE_LIMIT_STRICT_PER_MINUTE=10,\
GRAPHQL_MAX_DEPTH=10,\
GRAPHQL_MAX_COMPLEXITY=100,\
MAX_FILE_SIZE=10485760,\
ERROR_STRICT_MODE=false,\
USE_LOCAL_STORAGE=false,\
GCS_BUCKET=helpmeclean-prod-uploads,\
GCS_PROJECT_ID=helpmeclean-prod,\
FIREBASE_PROJECT_ID=helpmeclean-prod,\
FACTUREAZA_API_URL=https://api.factureaza.ro/api/v1/,\
PLATFORM_COMPANY_NAME=HelpMeClean SRL,\
PLATFORM_CUI=RO12345678,\
PLATFORM_REG_NUMBER=J40/1234/2024,\
PLATFORM_ADDRESS=Str. Exemplu nr. 1,\
PLATFORM_CITY=Bucuresti,\
PLATFORM_COUNTY=Bucuresti,\
PLATFORM_IS_VAT_PAYER=true,\
PLATFORM_BANK_NAME=ING Bank,\
PLATFORM_IBAN=RO49AAAA1B31007593840000,\
ALLOWED_ORIGINS=https://app.helpmeclean.ro,https://firma.helpmeclean.ro,https://admin.helpmeclean.ro,\
STRIPE_CONNECT_RETURN_URL=https://app.helpmeclean.ro/firma/setari?stripe=complete,\
STRIPE_CONNECT_REFRESH_URL=https://app.helpmeclean.ro/firma/setari?stripe=refresh" \
  --set-secrets "\
DATABASE_URL=database-url-prod:latest,\
JWT_SECRET=jwt-secret-prod:latest,\
GOOGLE_CLIENT_ID=google-client-id-prod:latest,\
GOOGLE_CLIENT_ID_IOS=google-client-id-ios-prod:latest,\
GOOGLE_CLIENT_ID_ANDROID=google-client-id-android-prod:latest,\
STRIPE_SECRET_KEY=stripe-secret-key-prod:latest,\
STRIPE_WEBHOOK_SECRET=stripe-webhook-secret-prod:latest,\
STRIPE_PUBLISHABLE_KEY=stripe-publishable-key-prod:latest,\
FACTUREAZA_API_KEY=factureaza-api-key-prod:latest"

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
