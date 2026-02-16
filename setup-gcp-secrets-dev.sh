#!/bin/bash
# HelpMeClean.ro - Create all GCP Secret Manager secrets for Development
# Follows the naming pattern: dev_{secret_name}
# Single GCP project for both dev and production

set -e  # Exit on error

PROJECT_ID="help-me-clean"

echo "🔐 Setting up GCP Secret Manager secrets for Development"
echo "Project: ${PROJECT_ID}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Setup cancelled."
    exit 0
fi

# Set GCP project
gcloud config set project ${PROJECT_ID}

echo ""
echo "📝 Creating dev_ secrets (you'll be prompted for each value)..."
echo ""

# Security Configuration (NEW - Phase 1-4)
echo "--- Security Configuration (NEW) ---"

echo -n "Enter ENVIRONMENT (development): "
read -r val
echo -n "$val" | gcloud secrets create dev_environment --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_environment --data-file=-)

echo -n "Enter PORT (8080): "
read -r val
echo -n "$val" | gcloud secrets create dev_port --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_port --data-file=-)

echo -n "Enter COOKIE_DOMAIN (leave empty for dev): "
read -r val
echo -n "$val" | gcloud secrets create dev_cookie_domain --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_cookie_domain --data-file=-)

echo -n "Enter RATE_LIMIT_PER_MINUTE (200): "
read -r val
echo -n "$val" | gcloud secrets create dev_rate_limit_per_minute --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_rate_limit_per_minute --data-file=-)

echo -n "Enter RATE_LIMIT_STRICT_PER_MINUTE (50): "
read -r val
echo -n "$val" | gcloud secrets create dev_rate_limit_strict_per_minute --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_rate_limit_strict_per_minute --data-file=-)

echo -n "Enter GRAPHQL_MAX_DEPTH (10): "
read -r val
echo -n "$val" | gcloud secrets create dev_graphql_max_depth --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_graphql_max_depth --data-file=-)

echo -n "Enter GRAPHQL_MAX_COMPLEXITY (100): "
read -r val
echo -n "$val" | gcloud secrets create dev_graphql_max_complexity --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_graphql_max_complexity --data-file=-)

echo -n "Enter MAX_FILE_SIZE (10485760): "
read -r val
echo -n "$val" | gcloud secrets create dev_max_file_size --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_max_file_size --data-file=-)

echo -n "Enter ERROR_STRICT_MODE (false): "
read -r val
echo -n "$val" | gcloud secrets create dev_error_strict_mode --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_error_strict_mode --data-file=-)

echo ""
echo "--- Database ---"

echo -n "Enter DATABASE_URL: "
read -r val
echo -n "$val" | gcloud secrets create dev_database_url --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_database_url --data-file=-)

echo ""
echo "--- Authentication ---"

echo -n "Enter JWT_SECRET (generate with: openssl rand -base64 32): "
read -r val
echo -n "$val" | gcloud secrets create dev_jwt_secret --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_jwt_secret --data-file=-)

echo -n "Enter JWT_EXPIRY (24h): "
read -r val
echo -n "$val" | gcloud secrets create dev_jwt_expiry --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_jwt_expiry --data-file=-)

echo -n "Enter GOOGLE_CLIENT_ID: "
read -r val
echo -n "$val" | gcloud secrets create dev_google_client_id --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_google_client_id --data-file=-)

echo -n "Enter GOOGLE_CLIENT_ID_IOS: "
read -r val
echo -n "$val" | gcloud secrets create dev_google_client_id_ios --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_google_client_id_ios --data-file=-)

echo -n "Enter GOOGLE_CLIENT_ID_ANDROID: "
read -r val
echo -n "$val" | gcloud secrets create dev_google_client_id_android --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_google_client_id_android --data-file=-)

echo ""
echo "--- Stripe ---"

echo -n "Enter STRIPE_SECRET_KEY (sk_test_...): "
read -r val
echo -n "$val" | gcloud secrets create dev_stripe_secret_key --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_stripe_secret_key --data-file=-)

echo -n "Enter STRIPE_WEBHOOK_SECRET (whsec_...): "
read -r val
echo -n "$val" | gcloud secrets create dev_stripe_webhook_secret --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_stripe_webhook_secret --data-file=-)

echo -n "Enter STRIPE_PUBLISHABLE_KEY (pk_test_...): "
read -r val
echo -n "$val" | gcloud secrets create dev_stripe_publishable_key --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_stripe_publishable_key --data-file=-)

echo -n "Enter STRIPE_CONNECT_RETURN_URL (http://localhost:3001/setari?stripe=complete): "
read -r val
echo -n "$val" | gcloud secrets create dev_stripe_connect_return_url --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_stripe_connect_return_url --data-file=-)

echo -n "Enter STRIPE_CONNECT_REFRESH_URL (http://localhost:3001/setari?stripe=refresh): "
read -r val
echo -n "$val" | gcloud secrets create dev_stripe_connect_refresh_url --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_stripe_connect_refresh_url --data-file=-)

echo ""
echo "--- Factureaza.ro ---"

echo -n "Enter FACTUREAZA_API_URL (https://sandbox.factureaza.ro/api/v1/): "
read -r val
echo -n "$val" | gcloud secrets create dev_factureaza_api_url --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_factureaza_api_url --data-file=-)

echo -n "Enter FACTUREAZA_API_KEY: "
read -r val
echo -n "$val" | gcloud secrets create dev_factureaza_api_key --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_factureaza_api_key --data-file=-)

echo ""
echo "--- Storage & Services ---"

echo -n "Enter USE_LOCAL_STORAGE (false): "
read -r val
echo -n "$val" | gcloud secrets create dev_use_local_storage --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_use_local_storage --data-file=-)

echo -n "Enter GCS_BUCKET (help-me-clean-dev-uploads): "
read -r val
echo -n "$val" | gcloud secrets create dev_gcs_bucket --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_gcs_bucket --data-file=-)

echo -n "Enter GCS_PROJECT_ID (help-me-clean): "
read -r val
echo -n "$val" | gcloud secrets create dev_gcs_project_id --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_gcs_project_id --data-file=-)

echo -n "Enter FIREBASE_PROJECT_ID (help-me-clean): "
read -r val
echo -n "$val" | gcloud secrets create dev_firebase_project_id --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_firebase_project_id --data-file=-)

echo ""
echo "--- CORS ---"

echo -n "Enter ALLOWED_ORIGINS (http://localhost:3000,http://localhost:3001,http://localhost:3002): "
read -r val
echo -n "$val" | gcloud secrets create dev_allowed_origins --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add dev_allowed_origins --data-file=-)

echo ""
echo "✅ All development secrets created!"
echo ""
echo "📝 Grant Secret Manager access to Cloud Run service accounts:"
echo "PROJECT_NUMBER=\$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')"
echo "gcloud projects add-iam-policy-binding ${PROJECT_ID} \\"
echo "  --member=\"serviceAccount:\${PROJECT_NUMBER}-compute@developer.gserviceaccount.com\" \\"
echo "  --role=\"roles/secretmanager.secretAccessor\""
