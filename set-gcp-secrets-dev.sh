#!/bin/bash
# HelpMeClean.ro - Set GCP Secret Manager Secrets for Development
# Populates all required secrets from backend/.env file

set -e  # Exit on error

PROJECT_ID="help-me-clean-486919"

echo "🔐 Setting GCP Secret Manager secrets for development environment..."
echo "📦 Project: ${PROJECT_ID}"
echo ""

# Helper function to create or update secret
set_secret() {
  local SECRET_NAME=$1
  local SECRET_VALUE=$2

  echo -n "Setting ${SECRET_NAME}... "

  # Try to create the secret
  if echo -n "${SECRET_VALUE}" | gcloud secrets create ${SECRET_NAME} \
    --replication-policy="automatic" \
    --project=${PROJECT_ID} \
    --data-file=- 2>/dev/null; then
    echo "✅ Created"
  else
    # If creation fails (already exists), add new version
    echo -n "${SECRET_VALUE}" | gcloud secrets versions add ${SECRET_NAME} \
      --project=${PROJECT_ID} \
      --data-file=- 2>/dev/null
    echo "✅ Updated"
  fi
}

# Core configuration (from .env)
set_secret "dev_environment" "development"
set_secret "dev_port" "8080"

# Database (from .env)
set_secret "dev_database_url" "postgresql://neondb_owner:npg_pderYcxyJ82G@ep-late-waterfall-agcqcvau-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Auth (from .env)
set_secret "dev_google_client_id" "794597417467-hks5884pvd1ihthpoid6ad0nasanm459.apps.googleusercontent.com"
set_secret "dev_jwt_secret" "IU0j4+QzhdB9YdePOPn0kbHR/s4aDuBUE/WiWIHG5JJ4fjXq+skGyw0icIky/ABk"

# Stripe (from .env)
set_secret "dev_stripe_secret_key" "sk_test_51SzzgVAjjzKXeJfogvsxWDCoA07fzBTmFRrCIIMEdOhro0bsTCFnAtcMW1cXRkORhXTwdewaEhl7BkfDkhy2u7ad004FPejrOj"
set_secret "dev_stripe_publishable_key" "pk_test_51SzzgVAjjzKXeJfowxwRwJ6Pdt7VDf4E2XUqT69Fwo2li16by4RbGYMMp4KsiR46VmI7B2etnGS7rYesgtLHoj1M007Tomkwhv"
set_secret "dev_stripe_webhook_secret" "whsec_d10eacab017cc2bee9a27e36c44f8857ee4759c58e569014c2fb9cc876e7b24e"
set_secret "dev_stripe_connect_return_url" "http://localhost:3000/firma/setari?stripe=complete"
set_secret "dev_stripe_connect_refresh_url" "http://localhost:3000/firma/setari?stripe=refresh"

# Factureaza.ro (from .env)
set_secret "dev_factureaza_api_url" "https://sandbox.factureaza.ro/api/v1/"
set_secret "dev_factureaza_api_key" "your-factureaza-api-key"

# CORS (from .env)
set_secret "dev_allowed_origins" "http://localhost:3000"

# GCS Storage (defaults from .env.example)
set_secret "dev_gcs_bucket" "helpmeclean-dev-uploads"
set_secret "dev_gcs_project_id" "help-me-clean-486919"

# Security settings (defaults from .env.example)
set_secret "dev_cookie_domain" "localhost"  # Use localhost for dev, .helpmeclean.ro for production

# Rate limiting (defaults from .env.example)
set_secret "dev_rate_limit_per_minute" "100"
set_secret "dev_rate_limit_strict_per_minute" "10"

# GraphQL security (defaults from .env.example)
set_secret "dev_graphql_max_depth" "10"
set_secret "dev_graphql_max_complexity" "100"

# File upload security (defaults from .env.example)
set_secret "dev_max_file_size" "10485760"  # 10MB in bytes

# Error handling (defaults from .env.example)
set_secret "dev_error_strict_mode" "false"

echo ""
echo "✅ All 22 secrets have been set!"
echo ""
echo "📋 Verify secrets:"
echo "gcloud secrets list --project=${PROJECT_ID} --filter=\"name:dev_*\""
echo ""
echo "🔍 Check a specific secret:"
echo "gcloud secrets versions access latest --secret=\"dev_environment\" --project=${PROJECT_ID}"
echo ""
echo "🚀 Ready to deploy:"
echo "./deploy-gcp-dev.sh"
