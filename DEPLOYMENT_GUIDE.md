# HelpMeClean.ro - Deployment Guide

**Last Updated:** February 16, 2026
**Purpose:** Step-by-step guide to deploy security-hardened backend to GCP

---

## Prerequisites

1. **GCP CLI Installed:**
   ```bash
   # Check if installed
   gcloud --version

   # If not installed, install from:
   # https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticated with GCP:**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. **Docker Installed** (for building images):
   ```bash
   docker --version
   ```

4. **Secrets Created in GCP Secret Manager:**

   See [GCP_ENVIRONMENT_VARIABLES.md](GCP_ENVIRONMENT_VARIABLES.md#using-gcp-secret-manager-recommended-for-sensitive-data) for details.

---

## Quick Start

### Development Deployment

```bash
# 1. Build and push Docker image
cd backend
docker build -t gcr.io/helpmeclean-dev/backend:latest .
docker push gcr.io/helpmeclean-dev/backend:latest

# 2. Run deployment script
cd ..
./deploy-gcp-dev.sh
```

### Production Deployment

```bash
# 1. Build and push Docker image
cd backend
docker build -t gcr.io/helpmeclean-prod/backend:latest .
docker push gcr.io/helpmeclean-prod/backend:latest

# 2. Run deployment script (will ask for confirmation)
cd ..
./deploy-gcp-prod.sh
```

---

## Step-by-Step Deployment

### Step 1: Create GCP Secrets (One-time Setup)

#### Development Secrets:

```bash
# Set project
gcloud config set project helpmeclean-dev

# Database URL
echo -n "postgresql://user:pass@host/db?sslmode=require" | \
  gcloud secrets create database-url-dev --data-file=-

# JWT Secret (generate with: openssl rand -base64 32)
echo -n "your-jwt-secret-32-characters-minimum" | \
  gcloud secrets create jwt-secret-dev --data-file=-

# Google OAuth
echo -n "123456789-dev.apps.googleusercontent.com" | \
  gcloud secrets create google-client-id-dev --data-file=-

# Stripe
echo -n "sk_test_xxx" | \
  gcloud secrets create stripe-secret-key-dev --data-file=-
echo -n "whsec_test_xxx" | \
  gcloud secrets create stripe-webhook-secret-dev --data-file=-
echo -n "pk_test_xxx" | \
  gcloud secrets create stripe-publishable-key-dev --data-file=-

# Factureaza.ro
echo -n "your-factureaza-sandbox-key" | \
  gcloud secrets create factureaza-api-key-dev --data-file=-
```

#### Production Secrets:

```bash
# Set project
gcloud config set project helpmeclean-prod

# Database URL
echo -n "postgresql://user:pass@prod-host/db?sslmode=require" | \
  gcloud secrets create database-url-prod --data-file=-

# JWT Secret (DIFFERENT from dev!)
echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create jwt-secret-prod --data-file=-

# Google OAuth (production credentials)
echo -n "123456789-prod.apps.googleusercontent.com" | \
  gcloud secrets create google-client-id-prod --data-file=-

# Stripe (live keys)
echo -n "sk_live_xxx" | \
  gcloud secrets create stripe-secret-key-prod --data-file=-
echo -n "whsec_xxx" | \
  gcloud secrets create stripe-webhook-secret-prod --data-file=-
echo -n "pk_live_xxx" | \
  gcloud secrets create stripe-publishable-key-prod --data-file=-

# Factureaza.ro (production key)
echo -n "your-factureaza-production-key" | \
  gcloud secrets create factureaza-api-key-prod --data-file=-
```

---

### Step 2: Grant Secret Access to Cloud Run

```bash
# Development
gcloud projects add-iam-policy-binding helpmeclean-dev \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Production
gcloud projects add-iam-policy-binding helpmeclean-prod \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

> **Note:** Replace `PROJECT_NUMBER` with your actual GCP project number.
> Find it with: `gcloud projects describe helpmeclean-dev --format='value(projectNumber)'`

---

### Step 3: Build Docker Image

```bash
cd backend

# Development
docker build -t gcr.io/helpmeclean-dev/backend:latest .
docker push gcr.io/helpmeclean-dev/backend:latest

# Production
docker build -t gcr.io/helpmeclean-prod/backend:latest .
docker push gcr.io/helpmeclean-prod/backend:latest
```

---

### Step 4: Deploy to Cloud Run

#### Option A: Using Deployment Scripts (Recommended)

```bash
# Development
./deploy-gcp-dev.sh

# Production (asks for confirmation)
./deploy-gcp-prod.sh
```

#### Option B: Manual Deployment

**Development:**
```bash
gcloud run deploy helpmeclean-backend-dev \
  --image gcr.io/helpmeclean-dev/backend:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "ENVIRONMENT=development,RATE_LIMIT_PER_MINUTE=200,..." \
  --set-secrets "DATABASE_URL=database-url-dev:latest,..."
```

**Production:**
```bash
gcloud run deploy helpmeclean-backend \
  --image gcr.io/helpmeclean-prod/backend:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "ENVIRONMENT=production,COOKIE_DOMAIN=.helpmeclean.ro,..." \
  --set-secrets "DATABASE_URL=database-url-prod:latest,..."
```

---

### Step 5: Configure Custom Domain (Production Only)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service helpmeclean-backend \
  --domain api.helpmeclean.ro \
  --region europe-west1

# Get DNS records to configure
gcloud run domain-mappings describe \
  --domain api.helpmeclean.ro \
  --region europe-west1
```

Then add the DNS records to your domain provider (e.g., Cloudflare, Google Domains).

---

### Step 6: Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe helpmeclean-backend \
  --region europe-west1 \
  --format='value(status.url)')

# Test health endpoint
curl ${SERVICE_URL}/health

# Expected response:
# {"status":"ok","version":"0.1.0"}

# Test security headers
curl -I ${SERVICE_URL}/health

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: ...
```

---

### Step 7: Test Security Features

#### 1. Rate Limiting Test

```bash
# Send 11 requests quickly (limit is 10/min for GraphQL)
for i in {1..11}; do
  echo "Request $i:"
  curl -X POST ${SERVICE_URL}/query \
    -H "Content-Type: application/json" \
    -d '{"query":"{ __typename }"}' \
    -w "\nHTTP Status: %{http_code}\n\n"
  sleep 0.5
done

# Expected: 11th request should return 429 (Too Many Requests)
```

#### 2. Cookie Authentication Test

```bash
# Login and check for Set-Cookie header
curl -X POST ${SERVICE_URL}/query \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { signInWithGoogle(idToken: \"test\") { token user { id } } }"}' \
  -i | grep -i "set-cookie"

# Expected: Set-Cookie: helpmeclean_token=...; HttpOnly; Secure; SameSite=Lax
```

#### 3. File Upload Validation Test

```bash
# Try to upload invalid file (should fail)
curl -X POST ${SERVICE_URL}/query \
  -F 'operations={"query":"mutation($file: Upload!) { uploadFile(file: $file, purpose: \"avatar\") { url } }","variables":{"file":null}}' \
  -F 'map={"0":["variables.file"]}' \
  -F '0=@malicious.exe'

# Expected: Error about file type not allowed
```

#### 4. Deep Query Test

```bash
# Send deeply nested query (should fail if depth > 10)
curl -X POST ${SERVICE_URL}/query \
  -H "Content-Type: application/json" \
  -d '{"query":"{ a { b { c { d { e { f { g { h { i { j { k { l } } } } } } } } } } } }"}'

# Expected: Error about query exceeding maximum depth
```

---

## Post-Deployment Monitoring

### View Logs

```bash
# Real-time logs (development)
gcloud logs tail --follow --project=helpmeclean-dev

# Real-time logs (production)
gcloud logs tail --follow --project=helpmeclean-prod

# Filter for security events
gcloud logs read --project=helpmeclean-prod \
  --filter='textPayload:"[SECURITY]"' \
  --limit=50
```

### Monitor Metrics

```bash
# View Cloud Run metrics in GCP Console
https://console.cloud.google.com/run/detail/europe-west1/helpmeclean-backend/metrics

# Key metrics to monitor:
# - Request count (should be stable)
# - Request latency (should be < 500ms p95)
# - Error rate (should be < 1%)
# - Container CPU/Memory usage
```

### Set Up Alerts

```bash
# Create alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

---

## Troubleshooting

### Issue: Service fails to start

**Check logs:**
```bash
gcloud logs read --project=helpmeclean-prod \
  --service=helpmeclean-backend \
  --limit=100
```

**Common causes:**
- Missing secret (check Secret Manager access)
- Invalid DATABASE_URL
- Wrong ENVIRONMENT value

### Issue: Rate limiting not working

**Verify environment variables:**
```bash
gcloud run services describe helpmeclean-backend \
  --region europe-west1 \
  --format='value(spec.template.spec.containers[0].env)'
```

### Issue: Cookies not being set

**Check domain configuration:**
- Ensure `COOKIE_DOMAIN=.helpmeclean.ro` is set in production
- Verify frontend uses `credentials: 'include'`
- Check CORS `ALLOWED_ORIGINS` includes your frontend domain

---

## Rollback Procedure

If deployment fails or issues arise:

```bash
# List revisions
gcloud run revisions list \
  --service helpmeclean-backend \
  --region europe-west1

# Rollback to previous revision
gcloud run services update-traffic helpmeclean-backend \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region europe-west1
```

---

## Continuous Deployment (Optional)

### Set up Cloud Build trigger:

1. Go to Cloud Build → Triggers
2. Create trigger:
   - Event: Push to branch
   - Source: GitHub repository
   - Branch: `^development$` (for dev) or `^main$` (for prod)
   - Build configuration: Cloud Build configuration file
   - Create `cloudbuild.yaml` in repository root

### Example cloudbuild.yaml:

```yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA', './backend']

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'helpmeclean-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA'
      - '--region'
      - 'europe-west1'
      - '--platform'
      - 'managed'

images:
  - 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA'
```

---

## Security Checklist

Before deploying to production:

- [ ] All secrets created in Secret Manager
- [ ] ENVIRONMENT=production
- [ ] COOKIE_DOMAIN set correctly
- [ ] Rate limits configured (100/min, 10/min)
- [ ] ALLOWED_ORIGINS includes only production domains
- [ ] Stripe live keys configured
- [ ] Database connection secure (sslmode=require)
- [ ] Custom domain mapped (api.helpmeclean.ro)
- [ ] Monitoring and alerts configured
- [ ] Logs retention policy set
- [ ] Backup strategy in place

---

**Last Updated:** February 16, 2026
**Related Documentation:**
- [SECURITY_IMPLEMENTATION_SUMMARY.md](SECURITY_IMPLEMENTATION_SUMMARY.md)
- [GCP_ENVIRONMENT_VARIABLES.md](GCP_ENVIRONMENT_VARIABLES.md)
