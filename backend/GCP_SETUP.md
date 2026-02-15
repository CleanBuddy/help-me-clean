# GCP Cloud Run Setup Guide

Complete guide to deploy HelpMeClean backend to Google Cloud Platform with automated CI/CD.

## Architecture

```
GitHub Repository
├── development branch → helpmeclean-backend-dev (Cloud Run)
└── main branch        → helpmeclean-backend-prod (Cloud Run)

GCP Project: helpmeclean
├── Cloud Run Services (europe-west1)
│   ├── helpmeclean-backend-dev
│   └── helpmeclean-backend-prod
├── Artifact Registry (Docker images)
├── Secret Manager (Environment variables)
└── Cloud Build (Automated deployments)
```

## Prerequisites

- Google Cloud account
- GitHub repository connected to GCP
- gcloud CLI installed (optional for manual operations)

## Step 1: Create GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: `helpmeclean`
3. Note your PROJECT_ID (usually `helpmeclean` or with a suffix)

## Step 2: Enable Required APIs

Run these in Cloud Shell or local terminal:

```bash
# Set your project
gcloud config set project helpmeclean

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com
```

## Step 3: Create Artifact Registry Repository

```bash
gcloud artifacts repositories create helpmeclean \
  --repository-format=docker \
  --location=europe-west1 \
  --description="HelpMeClean Docker images"
```

## Step 4: Set Up Secrets in Secret Manager

### Development Secrets

```bash
# Database URL (Neon)
echo -n "YOUR_DEV_DATABASE_URL" | gcloud secrets create dev_DATABASE_URL --data-file=-

# JWT Secret (generate strong random string)
echo -n "YOUR_DEV_JWT_SECRET_MIN_32_CHARS" | gcloud secrets create dev_JWT_SECRET --data-file=-

# Google OAuth
echo -n "YOUR_GOOGLE_CLIENT_ID" | gcloud secrets create dev_GOOGLE_CLIENT_ID --data-file=-
echo -n "YOUR_GOOGLE_CLIENT_ID_IOS" | gcloud secrets create dev_GOOGLE_CLIENT_ID_IOS --data-file=-
echo -n "YOUR_GOOGLE_CLIENT_ID_ANDROID" | gcloud secrets create dev_GOOGLE_CLIENT_ID_ANDROID --data-file=-

# Stripe (Test Keys)
echo -n "sk_test_xxx" | gcloud secrets create dev_STRIPE_SECRET_KEY --data-file=-
echo -n "pk_test_xxx" | gcloud secrets create dev_STRIPE_PUBLISHABLE_KEY --data-file=-
echo -n "whsec_xxx" | gcloud secrets create dev_STRIPE_WEBHOOK_SECRET --data-file=-

# Factureaza.ro
echo -n "YOUR_FACTUREAZA_API_KEY" | gcloud secrets create dev_FACTUREAZA_API_KEY --data-file=-

# GCS Bucket
echo -n "helpmeclean-dev-uploads" | gcloud secrets create dev_GCS_BUCKET --data-file=-

# Firebase (paste entire JSON key content)
cat firebase-dev-key.json | gcloud secrets create dev_FIREBASE_SERVICE_ACCOUNT_KEY --data-file=-
```

### Production Secrets

```bash
# Same pattern but with prod_ prefix and LIVE credentials
echo -n "YOUR_PROD_DATABASE_URL" | gcloud secrets create prod_DATABASE_URL --data-file=-
echo -n "YOUR_PROD_JWT_SECRET_DIFFERENT_FROM_DEV" | gcloud secrets create prod_JWT_SECRET --data-file=-
echo -n "YOUR_GOOGLE_CLIENT_ID" | gcloud secrets create prod_GOOGLE_CLIENT_ID --data-file=-
echo -n "YOUR_GOOGLE_CLIENT_ID_IOS" | gcloud secrets create prod_GOOGLE_CLIENT_ID_IOS --data-file=-
echo -n "YOUR_GOOGLE_CLIENT_ID_ANDROID" | gcloud secrets create prod_GOOGLE_CLIENT_ID_ANDROID --data-file=-

# Stripe LIVE keys
echo -n "sk_live_xxx" | gcloud secrets create prod_STRIPE_SECRET_KEY --data-file=-
echo -n "pk_live_xxx" | gcloud secrets create prod_STRIPE_PUBLISHABLE_KEY --data-file=-
echo -n "whsec_xxx" | gcloud secrets create prod_STRIPE_WEBHOOK_SECRET --data-file=-

echo -n "YOUR_FACTUREAZA_API_KEY" | gcloud secrets create prod_FACTUREAZA_API_KEY --data-file=-
echo -n "helpmeclean-prod-uploads" | gcloud secrets create prod_GCS_BUCKET --data-file=-
cat firebase-prod-key.json | gcloud secrets create prod_FIREBASE_SERVICE_ACCOUNT_KEY --data-file=-
```

## Step 5: Grant Cloud Build Access to Secrets

```bash
# Get Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe helpmeclean --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding helpmeclean \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"

# Grant Cloud Run Admin (for deployment)
gcloud projects add-iam-policy-binding helpmeclean \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

# Grant Service Account User (to deploy as service account)
gcloud projects add-iam-policy-binding helpmeclean \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"
```

## Step 6: Connect GitHub Repository

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Connect Repository"
3. Select "GitHub (Cloud Build GitHub App)"
4. Authenticate and select your `help-me-clean` repository
5. Click "Connect"

## Step 7: Create Cloud Build Triggers

### Development Trigger

1. Click "Create Trigger"
2. Configure:
   - **Name:** `deploy-backend-dev`
   - **Region:** `europe-west1`
   - **Event:** Push to a branch
   - **Source:** `^development$` (regex)
   - **Configuration:** Cloud Build configuration file
   - **Location:** `backend/cloudbuild.yaml`
3. Click "Create"

### Production Trigger

1. Click "Create Trigger"
2. Configure:
   - **Name:** `deploy-backend-prod`
   - **Region:** `europe-west1`
   - **Event:** Push to a branch
   - **Source:** `^main$` (regex)
   - **Configuration:** Cloud Build configuration file
   - **Location:** `backend/cloudbuild-prod.yaml`
3. Click "Create"

## Step 8: Deploy!

### First Deployment (Manual)

Option A - Via Cloud Build:
```bash
# Deploy dev
gcloud builds submit --config=backend/cloudbuild.yaml backend/

# Deploy prod
gcloud builds submit --config=backend/cloudbuild-prod.yaml backend/
```

Option B - Trigger via Git:
```bash
# Deploy dev
git checkout development
git commit --allow-empty -m "trigger: initial dev deployment"
git push origin development

# Deploy prod
git checkout main
git commit --allow-empty -m "trigger: initial prod deployment"
git push origin main
```

### Automated Deployments (After First Deploy)

Just push to the branches:

```bash
# Auto-deploy to dev
git checkout development
git add .
git commit -m "feat: new feature"
git push origin development
# → Automatically deploys to helpmeclean-backend-dev

# Auto-deploy to prod
git checkout main
git merge development
git push origin main
# → Automatically deploys to helpmeclean-backend-prod
```

## Step 9: Get Your API URLs

After deployment:

```bash
# Dev URL
gcloud run services describe helpmeclean-backend-dev \
  --region=europe-west1 \
  --format='value(status.url)'

# Prod URL
gcloud run services describe helpmeclean-backend-prod \
  --region=europe-west1 \
  --format='value(status.url)'
```

URLs will be like:
- Dev: `https://helpmeclean-backend-dev-xxx-ew.a.run.app`
- Prod: `https://helpmeclean-backend-prod-xxx-ew.a.run.app`

## Step 10: Configure Custom Domains (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service=helpmeclean-backend-prod \
  --domain=api.helpmeclean.ro \
  --region=europe-west1

# Verify domain ownership and add DNS records as instructed
```

## Monitoring & Logs

### View Logs
```bash
# Dev logs
gcloud run services logs read helpmeclean-backend-dev \
  --region=europe-west1 \
  --limit=50

# Prod logs
gcloud run services logs read helpmeclean-backend-prod \
  --region=europe-west1 \
  --limit=50
```

### View in Console
- Logs: https://console.cloud.google.com/logs
- Cloud Run: https://console.cloud.google.com/run
- Cloud Build: https://console.cloud.google.com/cloud-build

## Costs Estimation

### Development Environment
- Cloud Run (min=0): $0-5/month
- Artifact Registry: $0.10/GB/month (~$0.50)
- Secret Manager: $0.06 per 10K accesses (~$0.10)
- Cloud Build: First 120 min/day free
- **Total: ~$1-10/month**

### Production Environment
- Cloud Run (min=1): $7-30/month
- Artifact Registry: $0.10/GB/month (~$1)
- Secret Manager: $0.06 per 10K accesses (~$0.50)
- Cloud Build: First 120 min/day free
- **Total: ~$10-40/month**

## Updating Secrets

```bash
# Update a secret
echo -n "NEW_VALUE" | gcloud secrets versions add dev_DATABASE_URL --data-file=-

# Cloud Run will automatically use latest version on next deployment
```

## Troubleshooting

### Build Fails
```bash
# Check build logs
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)')
```

### Service Not Starting
```bash
# Check service logs
gcloud run services logs read helpmeclean-backend-dev --region=europe-west1
```

### Permission Issues
```bash
# Verify Cloud Build has necessary roles
gcloud projects get-iam-policy helpmeclean \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
```

## Next Steps

1. ✅ Update your frontend `.env` files with the Cloud Run URLs
2. ✅ Test GraphQL endpoint: `https://YOUR-URL/graphql`
3. ✅ Set up custom domains for production
4. ✅ Configure Stripe webhooks with your Cloud Run URL
5. ✅ Set up monitoring alerts in Cloud Monitoring

## Support

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
