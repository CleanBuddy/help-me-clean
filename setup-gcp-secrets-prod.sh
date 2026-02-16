#!/bin/bash
# HelpMeClean.ro - Create all GCP Secret Manager secrets for Production
# Follows the naming pattern: prod_{secret_name}

set -e  # Exit on error

PROJECT_ID="helpmeclean-prod"

echo "🔐 Setting up GCP Secret Manager secrets for Production"
echo "Project: ${PROJECT_ID}"
echo "⚠️  WARNING: This will create PRODUCTION secrets!"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Setup cancelled."
    exit 0
fi

# Set GCP project
gcloud config set project ${PROJECT_ID}

echo ""
echo "📝 Creating secrets (you'll be prompted for each value)..."
echo "⚠️  Use PRODUCTION values only!"
echo ""

# Security Configuration (NEW - Phase 1-4)
echo "--- Security Configuration (NEW) ---"

echo -n "Enter ENVIRONMENT (production): "
read -r val
echo -n "$val" | gcloud secrets create prod_environment --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_environment --data-file=-)

echo -n "Enter PORT (8080): "
read -r val
echo -n "$val" | gcloud secrets create prod_port --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_port --data-file=-)

echo -n "Enter COOKIE_DOMAIN (.helpmeclean.ro): "
read -r val
echo -n "$val" | gcloud secrets create prod_cookie_domain --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_cookie_domain --data-file=-)

echo -n "Enter RATE_LIMIT_PER_MINUTE (100): "
read -r val
echo -n "$val" | gcloud secrets create prod_rate_limit_per_minute --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_rate_limit_per_minute --data-file=-)

echo -n "Enter RATE_LIMIT_STRICT_PER_MINUTE (10): "
read -r val
echo -n "$val" | gcloud secrets create prod_rate_limit_strict_per_minute --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_rate_limit_strict_per_minute --data-file=-)

echo -n "Enter GRAPHQL_MAX_DEPTH (10): "
read -r val
echo -n "$val" | gcloud secrets create prod_graphql_max_depth --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_graphql_max_depth --data-file=-)

echo -n "Enter GRAPHQL_MAX_COMPLEXITY (100): "
read -r val
echo -n "$val" | gcloud secrets create prod_graphql_max_complexity --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_graphql_max_complexity --data-file=-)

echo -n "Enter MAX_FILE_SIZE (10485760): "
read -r val
echo -n "$val" | gcloud secrets create prod_max_file_size --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_max_file_size --data-file=-)

echo -n "Enter ERROR_STRICT_MODE (false): "
read -r val
echo -n "$val" | gcloud secrets create prod_error_strict_mode --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_error_strict_mode --data-file=-)

echo ""
echo "--- Database ---"

echo -n "Enter DATABASE_URL (PRODUCTION): "
read -r val
echo -n "$val" | gcloud secrets create prod_database_url --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_database_url --data-file=-)

echo ""
echo "--- Authentication ---"

echo "Generating new JWT_SECRET..."
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated: ${JWT_SECRET}"
echo -n "$JWT_SECRET" | gcloud secrets create prod_jwt_secret --data-file=- 2>/dev/null || \
    (echo -n "$JWT_SECRET" | gcloud secrets versions add prod_jwt_secret --data-file=-)

echo -n "Enter JWT_EXPIRY (24h): "
read -r val
echo -n "$val" | gcloud secrets create prod_jwt_expiry --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_jwt_expiry --data-file=-)

echo -n "Enter GOOGLE_CLIENT_ID (PRODUCTION): "
read -r val
echo -n "$val" | gcloud secrets create prod_google_client_id --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_google_client_id --data-file=-)

echo -n "Enter GOOGLE_CLIENT_ID_IOS (PRODUCTION): "
read -r val
echo -n "$val" | gcloud secrets create prod_google_client_id_ios --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_google_client_id_ios --data-file=-)

echo -n "Enter GOOGLE_CLIENT_ID_ANDROID (PRODUCTION): "
read -r val
echo -n "$val" | gcloud secrets create prod_google_client_id_android --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_google_client_id_android --data-file=-)

echo ""
echo "--- Stripe (LIVE KEYS) ---"

echo -n "Enter STRIPE_SECRET_KEY (sk_live_...): "
read -r val
echo -n "$val" | gcloud secrets create prod_stripe_secret_key --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_stripe_secret_key --data-file=-)

echo -n "Enter STRIPE_WEBHOOK_SECRET (whsec_...): "
read -r val
echo -n "$val" | gcloud secrets create prod_stripe_webhook_secret --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_stripe_webhook_secret --data-file=-)

echo -n "Enter STRIPE_PUBLISHABLE_KEY (pk_live_...): "
read -r val
echo -n "$val" | gcloud secrets create prod_stripe_publishable_key --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_stripe_publishable_key --data-file=-)

echo -n "Enter STRIPE_CONNECT_RETURN_URL (https://app.helpmeclean.ro/firma/setari?stripe=complete): "
read -r val
echo -n "$val" | gcloud secrets create prod_stripe_connect_return_url --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_stripe_connect_return_url --data-file=-)

echo -n "Enter STRIPE_CONNECT_REFRESH_URL (https://app.helpmeclean.ro/firma/setari?stripe=refresh): "
read -r val
echo -n "$val" | gcloud secrets create prod_stripe_connect_refresh_url --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_stripe_connect_refresh_url --data-file=-)

echo ""
echo "--- Factureaza.ro (PRODUCTION) ---"

echo -n "Enter FACTUREAZA_API_URL (https://api.factureaza.ro/api/v1/): "
read -r val
echo -n "$val" | gcloud secrets create prod_factureaza_api_url --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_factureaza_api_url --data-file=-)

echo -n "Enter FACTUREAZA_API_KEY (PRODUCTION): "
read -r val
echo -n "$val" | gcloud secrets create prod_factureaza_api_key --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_factureaza_api_key --data-file=-)

echo ""
echo "--- Platform Legal Entity ---"

echo -n "Enter PLATFORM_COMPANY_NAME: "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_company_name --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_company_name --data-file=-)

echo -n "Enter PLATFORM_CUI: "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_cui --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_cui --data-file=-)

echo -n "Enter PLATFORM_REG_NUMBER: "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_reg_number --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_reg_number --data-file=-)

echo -n "Enter PLATFORM_ADDRESS: "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_address --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_address --data-file=-)

echo -n "Enter PLATFORM_CITY: "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_city --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_city --data-file=-)

echo -n "Enter PLATFORM_COUNTY: "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_county --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_county --data-file=-)

echo -n "Enter PLATFORM_IS_VAT_PAYER (true/false): "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_is_vat_payer --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_is_vat_payer --data-file=-)

echo -n "Enter PLATFORM_BANK_NAME: "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_bank_name --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_bank_name --data-file=-)

echo -n "Enter PLATFORM_IBAN: "
read -r val
echo -n "$val" | gcloud secrets create prod_platform_iban --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_platform_iban --data-file=-)

echo ""
echo "--- Storage & Services ---"

echo -n "Enter USE_LOCAL_STORAGE (false): "
read -r val
echo -n "$val" | gcloud secrets create prod_use_local_storage --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_use_local_storage --data-file=-)

echo -n "Enter GCS_BUCKET (helpmeclean-prod-uploads): "
read -r val
echo -n "$val" | gcloud secrets create prod_gcs_bucket --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_gcs_bucket --data-file=-)

echo -n "Enter GCS_PROJECT_ID (helpmeclean-prod): "
read -r val
echo -n "$val" | gcloud secrets create prod_gcs_project_id --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_gcs_project_id --data-file=-)

echo -n "Enter FIREBASE_PROJECT_ID (helpmeclean-prod): "
read -r val
echo -n "$val" | gcloud secrets create prod_firebase_project_id --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_firebase_project_id --data-file=-)

echo ""
echo "--- CORS ---"

echo -n "Enter ALLOWED_ORIGINS (https://app.helpmeclean.ro,https://firma.helpmeclean.ro,https://admin.helpmeclean.ro): "
read -r val
echo -n "$val" | gcloud secrets create prod_allowed_origins --data-file=- 2>/dev/null || \
    (echo -n "$val" | gcloud secrets versions add prod_allowed_origins --data-file=-)

echo ""
echo "✅ All production secrets created!"
echo ""
echo "📝 Grant Secret Manager access to Cloud Run service account:"
echo "gcloud projects add-iam-policy-binding ${PROJECT_ID} \\"
echo "  --member=\"serviceAccount:\$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')-compute@developer.gserviceaccount.com\" \\"
echo "  --role=\"roles/secretmanager.secretAccessor\""
