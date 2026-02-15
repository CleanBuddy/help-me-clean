#!/bin/bash
# Complete GCP Cloud Run Setup Script
# This script sets up everything for HelpMeClean backend deployment

set -e  # Exit on error

PROJECT_ID="help-me-clean-486919"
REGION="eu-central2"
ARTIFACT_REPO="helpmeclean"

echo "🚀 Starting GCP Cloud Run setup for project: $PROJECT_ID"
echo ""

# Set project
gcloud config set project $PROJECT_ID

echo "✅ Step 1: Enabling required APIs..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com \
  storage.googleapis.com

echo ""
echo "✅ Step 2: Creating Artifact Registry repository..."
gcloud artifacts repositories create $ARTIFACT_REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="HelpMeClean Docker images" \
  2>/dev/null || echo "Repository already exists, skipping..."

echo ""
echo "✅ Step 3: Uploading Development Secrets..."

# Generate JWT secret if needed
DEV_JWT_SECRET=$(openssl rand -base64 48)
PROD_JWT_SECRET=$(openssl rand -base64 48)

# Development Database
echo -n "postgresql://neondb_owner:npg_pderYcxyJ82G@ep-late-waterfall-agcqcvau-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" | \
  gcloud secrets create dev_DATABASE_URL --data-file=- 2>/dev/null || \
  echo -n "postgresql://neondb_owner:npg_pderYcxyJ82G@ep-late-waterfall-agcqcvau-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" | \
  gcloud secrets versions add dev_DATABASE_URL --data-file=-

# Development JWT Secret
echo -n "$DEV_JWT_SECRET" | \
  gcloud secrets create dev_JWT_SECRET --data-file=- 2>/dev/null || \
  echo -n "$DEV_JWT_SECRET" | \
  gcloud secrets versions add dev_JWT_SECRET --data-file=-

# Google OAuth - Development
echo -n "794597417467-hks5884pvd1ihthpoid6ad0nasanm459.apps.googleusercontent.com" | \
  gcloud secrets create dev_GOOGLE_CLIENT_ID --data-file=- 2>/dev/null || \
  echo -n "794597417467-hks5884pvd1ihthpoid6ad0nasanm459.apps.googleusercontent.com" | \
  gcloud secrets versions add dev_GOOGLE_CLIENT_ID --data-file=-

echo -n "794597417467-fhv7oset50pld7mlnd0ttumpr1spm8gi.apps.googleusercontent.com" | \
  gcloud secrets create dev_GOOGLE_CLIENT_ID_IOS --data-file=- 2>/dev/null || \
  echo -n "794597417467-fhv7oset50pld7mlnd0ttumpr1spm8gi.apps.googleusercontent.com" | \
  gcloud secrets versions add dev_GOOGLE_CLIENT_ID_IOS --data-file=-

echo -n "your-android-client-id" | \
  gcloud secrets create dev_GOOGLE_CLIENT_ID_ANDROID --data-file=- 2>/dev/null || \
  echo -n "your-android-client-id" | \
  gcloud secrets versions add dev_GOOGLE_CLIENT_ID_ANDROID --data-file=-

# Stripe - Development (TEST keys)
echo -n "sk_test_51SzzgVAjjzKXeJfogvsxWDCoA07fzBTmFRrCIIMEdOhro0bsTCFnAtcMW1cXRkORhXTwdewaEhl7BkfDkhy2u7ad004FPejrOj" | \
  gcloud secrets create dev_STRIPE_SECRET_KEY --data-file=- 2>/dev/null || \
  echo -n "sk_test_51SzzgVAjjzKXeJfogvsxWDCoA07fzBTmFRrCIIMEdOhro0bsTCFnAtcMW1cXRkORhXTwdewaEhl7BkfDkhy2u7ad004FPejrOj" | \
  gcloud secrets versions add dev_STRIPE_SECRET_KEY --data-file=-

echo -n "pk_test_51SzzgVAjjzKXeJfowxwRwJ6Pdt7VDf4E2XUqT69Fwo2li16by4RbGYMMp4KsiR46VmI7B2etnGS7rYesgtLHoj1M007Tomkwhv" | \
  gcloud secrets create dev_STRIPE_PUBLISHABLE_KEY --data-file=- 2>/dev/null || \
  echo -n "pk_test_51SzzgVAjjzKXeJfowxwRwJ6Pdt7VDf4E2XUqT69Fwo2li16by4RbGYMMp4KsiR46VmI7B2etnGS7rYesgtLHoj1M007Tomkwhv" | \
  gcloud secrets versions add dev_STRIPE_PUBLISHABLE_KEY --data-file=-

echo -n "whsec_d10eacab017cc2bee9a27e36c44f8857ee4759c58e569014c2fb9cc876e7b24e" | \
  gcloud secrets create dev_STRIPE_WEBHOOK_SECRET --data-file=- 2>/dev/null || \
  echo -n "whsec_d10eacab017cc2bee9a27e36c44f8857ee4759c58e569014c2fb9cc876e7b24e" | \
  gcloud secrets versions add dev_STRIPE_WEBHOOK_SECRET --data-file=-

# Factureaza.ro - Development
echo -n "dev-factureaza-api-key-placeholder" | \
  gcloud secrets create dev_FACTUREAZA_API_KEY --data-file=- 2>/dev/null || \
  echo -n "dev-factureaza-api-key-placeholder" | \
  gcloud secrets versions add dev_FACTUREAZA_API_KEY --data-file=-

# GCS Bucket - Development
echo -n "helpmeclean-dev-uploads" | \
  gcloud secrets create dev_GCS_BUCKET --data-file=- 2>/dev/null || \
  echo -n "helpmeclean-dev-uploads" | \
  gcloud secrets versions add dev_GCS_BUCKET --data-file=-

# Firebase - Development (dummy JSON)
echo '{"type":"service_account","project_id":"help-me-clean-486919","private_key_id":"dummy","private_key":"dummy","client_email":"dummy@help-me-clean-486919.iam.gserviceaccount.com"}' | \
  gcloud secrets create dev_FIREBASE_SERVICE_ACCOUNT_KEY --data-file=- 2>/dev/null || \
  echo '{"type":"service_account","project_id":"help-me-clean-486919","private_key_id":"dummy","private_key":"dummy","client_email":"dummy@help-me-clean-486919.iam.gserviceaccount.com"}' | \
  gcloud secrets versions add dev_FIREBASE_SERVICE_ACCOUNT_KEY --data-file=-

echo ""
echo "✅ Step 4: Uploading Production Secrets (dummy data)..."

# Production Database
echo -n "postgresql://neondb_owner:npg_pderYcxyJ82G@ep-odd-dawn-agcm1p89-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" | \
  gcloud secrets create prod_DATABASE_URL --data-file=- 2>/dev/null || \
  echo -n "postgresql://neondb_owner:npg_pderYcxyJ82G@ep-odd-dawn-agcm1p89-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" | \
  gcloud secrets versions add prod_DATABASE_URL --data-file=-

# Production JWT Secret (different from dev!)
echo -n "$PROD_JWT_SECRET" | \
  gcloud secrets create prod_JWT_SECRET --data-file=- 2>/dev/null || \
  echo -n "$PROD_JWT_SECRET" | \
  gcloud secrets versions add prod_JWT_SECRET --data-file=-

# Google OAuth - Production (dummy)
echo -n "prod-google-client-id-placeholder.apps.googleusercontent.com" | \
  gcloud secrets create prod_GOOGLE_CLIENT_ID --data-file=- 2>/dev/null || \
  echo -n "prod-google-client-id-placeholder.apps.googleusercontent.com" | \
  gcloud secrets versions add prod_GOOGLE_CLIENT_ID --data-file=-

echo -n "prod-google-client-id-ios-placeholder.apps.googleusercontent.com" | \
  gcloud secrets create prod_GOOGLE_CLIENT_ID_IOS --data-file=- 2>/dev/null || \
  echo -n "prod-google-client-id-ios-placeholder.apps.googleusercontent.com" | \
  gcloud secrets versions add prod_GOOGLE_CLIENT_ID_IOS --data-file=-

echo -n "prod-google-client-id-android-placeholder.apps.googleusercontent.com" | \
  gcloud secrets create prod_GOOGLE_CLIENT_ID_ANDROID --data-file=- 2>/dev/null || \
  echo -n "prod-google-client-id-android-placeholder.apps.googleusercontent.com" | \
  gcloud secrets versions add prod_GOOGLE_CLIENT_ID_ANDROID --data-file=-

# Stripe - Production (dummy LIVE keys)
echo -n "sk_live_placeholder_replace_with_real_key" | \
  gcloud secrets create prod_STRIPE_SECRET_KEY --data-file=- 2>/dev/null || \
  echo -n "sk_live_placeholder_replace_with_real_key" | \
  gcloud secrets versions add prod_STRIPE_SECRET_KEY --data-file=-

echo -n "pk_live_placeholder_replace_with_real_key" | \
  gcloud secrets create prod_STRIPE_PUBLISHABLE_KEY --data-file=- 2>/dev/null || \
  echo -n "pk_live_placeholder_replace_with_real_key" | \
  gcloud secrets versions add prod_STRIPE_PUBLISHABLE_KEY --data-file=-

echo -n "whsec_placeholder_replace_with_real_webhook_secret" | \
  gcloud secrets create prod_STRIPE_WEBHOOK_SECRET --data-file=- 2>/dev/null || \
  echo -n "whsec_placeholder_replace_with_real_webhook_secret" | \
  gcloud secrets versions add prod_STRIPE_WEBHOOK_SECRET --data-file=-

# Factureaza.ro - Production
echo -n "prod-factureaza-api-key-placeholder" | \
  gcloud secrets create prod_FACTUREAZA_API_KEY --data-file=- 2>/dev/null || \
  echo -n "prod-factureaza-api-key-placeholder" | \
  gcloud secrets versions add prod_FACTUREAZA_API_KEY --data-file=-

# GCS Bucket - Production
echo -n "helpmeclean-prod-uploads" | \
  gcloud secrets create prod_GCS_BUCKET --data-file=- 2>/dev/null || \
  echo -n "helpmeclean-prod-uploads" | \
  gcloud secrets versions add prod_GCS_BUCKET --data-file=-

# Firebase - Production (dummy JSON)
echo '{"type":"service_account","project_id":"help-me-clean-486919","private_key_id":"dummy","private_key":"dummy","client_email":"dummy@help-me-clean-486919.iam.gserviceaccount.com"}' | \
  gcloud secrets create prod_FIREBASE_SERVICE_ACCOUNT_KEY --data-file=- 2>/dev/null || \
  echo '{"type":"service_account","project_id":"help-me-clean-486919","private_key_id":"dummy","private_key":"dummy","client_email":"dummy@help-me-clean-486919.iam.gserviceaccount.com"}' | \
  gcloud secrets versions add prod_FIREBASE_SERVICE_ACCOUNT_KEY --data-file=-

echo ""
echo "✅ Step 5: Granting Cloud Build permissions..."

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

echo ""
echo "✅ Step 6: Creating GCS buckets..."
gsutil mb -p $PROJECT_ID -l $REGION gs://helpmeclean-dev-uploads 2>/dev/null || echo "Dev bucket exists"
gsutil mb -p $PROJECT_ID -l $REGION gs://helpmeclean-prod-uploads 2>/dev/null || echo "Prod bucket exists"

echo ""
echo "🎉 GCP Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Connect GitHub repository to Cloud Build"
echo "   → https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
echo ""
echo "2. Create Cloud Build Triggers:"
echo "   - Trigger 1: development branch → backend/cloudbuild.yaml"
echo "   - Trigger 2: main branch → backend/cloudbuild-prod.yaml"
echo ""
echo "3. Run migrations on Neon databases:"
echo "   → cd backend && ./scripts/run-migrations.sh"
echo ""
echo "4. Deploy by pushing to GitHub:"
echo "   → git push origin development  # Deploys to dev"
echo "   → git push origin main          # Deploys to prod"
echo ""
echo "Generated JWT Secrets (save these!):"
echo "Dev JWT Secret:  $DEV_JWT_SECRET"
echo "Prod JWT Secret: $PROD_JWT_SECRET"
echo ""
