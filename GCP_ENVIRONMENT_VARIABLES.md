# GCP Environment Variables - HelpMeClean.ro

**Last Updated:** February 16, 2026
**Purpose:** Security implementation environment variables for GCP deployment

---

## Backend Environment Variables (GCP Cloud Run / Compute Engine)

### 🔴 REQUIRED for Production

```bash
# ============================================
# Security - Phase 1 & 2 (CRITICAL)
# ============================================

# Environment setting - MUST be "production" in prod
ENVIRONMENT=production

# Cookie domain for cross-subdomain support
# Use .helpmeclean.ro to work across api.helpmeclean.ro, app.helpmeclean.ro, etc.
COOKIE_DOMAIN=.helpmeclean.ro

# ============================================
# Security - Phase 3 (Rate Limiting)
# ============================================

# General rate limit (requests per minute per IP)
RATE_LIMIT_PER_MINUTE=100

# Strict rate limit for GraphQL endpoint (auth, payments, mutations)
RATE_LIMIT_STRICT_PER_MINUTE=10

# ============================================
# Security - Phase 4 (Input Validation)
# ============================================

# GraphQL query depth limit (prevent deeply nested queries)
GRAPHQL_MAX_DEPTH=10

# GraphQL query complexity limit (prevent expensive queries)
GRAPHQL_MAX_COMPLEXITY=100

# Max file upload size in bytes (10MB = 10485760 bytes)
MAX_FILE_SIZE=10485760

# Error handling - set to "true" to remove error paths in production
ERROR_STRICT_MODE=false
```

### 📋 Complete Production Configuration

```bash
# ============================================
# Server
# ============================================
PORT=8080
ENVIRONMENT=production

# ============================================
# Database (Neon PostgreSQL)
# ============================================
DATABASE_URL=postgresql://username:password@ep-example-123456.eu-central-1.aws.neon.tech/helpmeclean?sslmode=require

# ============================================
# Authentication
# ============================================
# Google OAuth Client IDs
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=123456789-ios-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=123456789-android-abcdefghijklmnop.apps.googleusercontent.com

# JWT Configuration
JWT_SECRET=generate-a-strong-secret-minimum-32-characters-long-use-openssl-rand-base64-32
JWT_EXPIRY=24h

# ============================================
# Security (NEW - All Phases)
# ============================================
# Cookie Configuration (Phase 2)
COOKIE_DOMAIN=.helpmeclean.ro

# Rate Limiting (Phase 3)
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_STRICT_PER_MINUTE=10

# GraphQL Security (Phase 4)
GRAPHQL_MAX_DEPTH=10
GRAPHQL_MAX_COMPLEXITY=100

# File Upload Security (Phase 4)
MAX_FILE_SIZE=10485760

# Error Handling (Phase 4)
ERROR_STRICT_MODE=false

# ============================================
# Stripe Payments
# ============================================
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_CONNECT_RETURN_URL=https://app.helpmeclean.ro/firma/setari?stripe=complete
STRIPE_CONNECT_REFRESH_URL=https://app.helpmeclean.ro/firma/setari?stripe=refresh

# ============================================
# Factureaza.ro (Invoicing)
# ============================================
FACTUREAZA_API_URL=https://api.factureaza.ro/api/v1/
FACTUREAZA_API_KEY=your-production-factureaza-api-key

# ============================================
# Platform Legal Entity (Commission Invoices)
# ============================================
PLATFORM_COMPANY_NAME=HelpMeClean SRL
PLATFORM_CUI=RO12345678
PLATFORM_REG_NUMBER=J40/1234/2024
PLATFORM_ADDRESS=Str. Exemplu nr. 1
PLATFORM_CITY=Bucuresti
PLATFORM_COUNTY=Bucuresti
PLATFORM_IS_VAT_PAYER=true
PLATFORM_BANK_NAME=ING Bank
PLATFORM_IBAN=RO49AAAA1B31007593840000

# ============================================
# Google Cloud Storage
# ============================================
USE_LOCAL_STORAGE=false
GCS_BUCKET=helpmeclean-prod-uploads
GCS_PROJECT_ID=helpmeclean-prod
# GOOGLE_APPLICATION_CREDENTIALS is auto-configured in GCP Cloud Run via Workload Identity

# ============================================
# Firebase (Push Notifications)
# ============================================
FIREBASE_PROJECT_ID=helpmeclean-prod
# FIREBASE_SERVICE_ACCOUNT_KEY is configured via GCP Secret Manager

# ============================================
# CORS
# ============================================
ALLOWED_ORIGINS=https://app.helpmeclean.ro,https://firma.helpmeclean.ro,https://admin.helpmeclean.ro
```

---

## Development Environment Variables

```bash
# ============================================
# Server
# ============================================
PORT=8080
ENVIRONMENT=development

# ============================================
# Database (Local or Neon Dev)
# ============================================
DATABASE_URL=postgresql://helpmeclean:password@localhost:5432/helpmeclean?sslmode=disable

# ============================================
# Authentication
# ============================================
GOOGLE_CLIENT_ID=123456789-dev-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=123456789-ios-dev-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=123456789-android-dev-abcdefghijklmnop.apps.googleusercontent.com
JWT_SECRET=development-secret-minimum-32-characters-long
JWT_EXPIRY=24h

# ============================================
# Security (Development)
# ============================================
# Cookie domain NOT set in development (uses localhost)
# COOKIE_DOMAIN=

# Rate Limiting (more permissive in dev)
RATE_LIMIT_PER_MINUTE=200
RATE_LIMIT_STRICT_PER_MINUTE=50

# GraphQL Security (same as prod)
GRAPHQL_MAX_DEPTH=10
GRAPHQL_MAX_COMPLEXITY=100

# File Upload Security (same as prod)
MAX_FILE_SIZE=10485760

# Error Handling (show full errors in dev)
ERROR_STRICT_MODE=false

# ============================================
# Stripe (Test Mode)
# ============================================
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_CONNECT_RETURN_URL=http://localhost:3001/setari?stripe=complete
STRIPE_CONNECT_REFRESH_URL=http://localhost:3001/setari?stripe=refresh

# ============================================
# Factureaza.ro (Sandbox)
# ============================================
FACTUREAZA_API_URL=https://sandbox.factureaza.ro/api/v1/
FACTUREAZA_API_KEY=your-sandbox-factureaza-api-key

# ============================================
# Platform Legal Entity (Dev)
# ============================================
PLATFORM_COMPANY_NAME=HelpMeClean SRL
PLATFORM_CUI=RO12345678
PLATFORM_REG_NUMBER=J40/1234/2024
PLATFORM_ADDRESS=Str. Exemplu nr. 1
PLATFORM_CITY=Bucuresti
PLATFORM_COUNTY=Bucuresti
PLATFORM_IS_VAT_PAYER=true
PLATFORM_BANK_NAME=ING Bank
PLATFORM_IBAN=RO49AAAA1B31007593840000

# ============================================
# Storage (Local in Dev)
# ============================================
USE_LOCAL_STORAGE=true
GCS_BUCKET=helpmeclean-dev-uploads
GCS_PROJECT_ID=helpmeclean-dev

# ============================================
# Firebase (Dev)
# ============================================
FIREBASE_PROJECT_ID=helpmeclean-dev
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/dev-key.json

# ============================================
# CORS (Multiple Origins for Dev)
# ============================================
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,https://dev-helpmeclean.vercel.app
```

---

## Frontend Environment Variables

### 🌐 Client Web App (Vercel/Static Hosting)

#### Production (`web/packages/client-web/.env.production`)

```bash
# GraphQL API Endpoint
VITE_GRAPHQL_ENDPOINT=https://api.helpmeclean.ro/query

# WebSocket Endpoint (Optional - auto-detected from VITE_GRAPHQL_ENDPOINT)
# If HTTPS is used, it automatically becomes wss://
# VITE_WS_ENDPOINT=wss://api.helpmeclean.ro/query

# Google OAuth (Client-side)
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# Stripe Publishable Key (Client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx

# Environment
VITE_ENVIRONMENT=production
```

#### Development (`web/packages/client-web/.env.development`)

```bash
# GraphQL API Endpoint
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/query

# WebSocket Endpoint (Optional - auto-detected)
# VITE_WS_ENDPOINT=ws://localhost:8080/query

# Google OAuth (Client-side)
VITE_GOOGLE_CLIENT_ID=123456789-dev-abcdefghijklmnop.apps.googleusercontent.com

# Stripe Publishable Key (Client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Environment
VITE_ENVIRONMENT=development
```

---

### 🏢 Company Dashboard (Vercel/Static Hosting)

Same configuration as Client Web App, but with separate deployment.

#### Production (`web/packages/company-dashboard/.env.production`)

```bash
VITE_GRAPHQL_ENDPOINT=https://api.helpmeclean.ro/query
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
VITE_ENVIRONMENT=production
```

---

### 🔧 Admin Dashboard (Vercel/Static Hosting)

#### Production (`web/packages/admin-dashboard/.env.production`)

```bash
VITE_GRAPHQL_ENDPOINT=https://api.helpmeclean.ro/query
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_ENVIRONMENT=production
```

---

## GCP-Specific Configuration

### Setting Environment Variables in GCP Cloud Run

#### Via gcloud CLI:

```bash
# Deploy with environment variables
gcloud run deploy helpmeclean-backend \
  --image gcr.io/helpmeclean-prod/backend:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars "ENVIRONMENT=production" \
  --set-env-vars "COOKIE_DOMAIN=.helpmeclean.ro" \
  --set-env-vars "RATE_LIMIT_PER_MINUTE=100" \
  --set-env-vars "RATE_LIMIT_STRICT_PER_MINUTE=10" \
  --set-env-vars "GRAPHQL_MAX_DEPTH=10" \
  --set-env-vars "GRAPHQL_MAX_COMPLEXITY=100" \
  --set-env-vars "MAX_FILE_SIZE=10485760" \
  --set-env-vars "ERROR_STRICT_MODE=false"
```

#### Via GCP Console:

1. Go to **Cloud Run** → Select your service
2. Click **Edit & Deploy New Revision**
3. Go to **Variables & Secrets** tab
4. Add each environment variable:
   - Name: `ENVIRONMENT`, Value: `production`
   - Name: `COOKIE_DOMAIN`, Value: `.helpmeclean.ro`
   - Name: `RATE_LIMIT_PER_MINUTE`, Value: `100`
   - Name: `RATE_LIMIT_STRICT_PER_MINUTE`, Value: `10`
   - Name: `GRAPHQL_MAX_DEPTH`, Value: `10`
   - Name: `GRAPHQL_MAX_COMPLEXITY`, Value: `100`
   - Name: `MAX_FILE_SIZE`, Value: `10485760`
   - Name: `ERROR_STRICT_MODE`, Value: `false`

---

### Using GCP Secret Manager (Recommended for Sensitive Data)

For sensitive values like JWT_SECRET, database passwords, and API keys:

#### Create Secrets:

```bash
# JWT Secret
echo -n "your-jwt-secret-here" | gcloud secrets create jwt-secret --data-file=-

# Database URL
echo -n "postgresql://..." | gcloud secrets create database-url --data-file=-

# Stripe Secret Key
echo -n "sk_live_..." | gcloud secrets create stripe-secret-key --data-file=-
```

#### Grant Access to Cloud Run Service Account:

```bash
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:your-service-account@helpmeclean-prod.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### Mount Secrets in Cloud Run:

```bash
gcloud run deploy helpmeclean-backend \
  --image gcr.io/helpmeclean-prod/backend:latest \
  --set-secrets "JWT_SECRET=jwt-secret:latest" \
  --set-secrets "DATABASE_URL=database-url:latest" \
  --set-secrets "STRIPE_SECRET_KEY=stripe-secret-key:latest"
```

---

## Environment Variable Checklist

### ✅ Backend Production Deployment

Before deploying to production, ensure these are set:

#### Security Variables (NEW - from all 4 phases):
- [ ] `ENVIRONMENT=production`
- [ ] `COOKIE_DOMAIN=.helpmeclean.ro`
- [ ] `RATE_LIMIT_PER_MINUTE=100`
- [ ] `RATE_LIMIT_STRICT_PER_MINUTE=10`
- [ ] `GRAPHQL_MAX_DEPTH=10`
- [ ] `GRAPHQL_MAX_COMPLEXITY=100`
- [ ] `MAX_FILE_SIZE=10485760`
- [ ] `ERROR_STRICT_MODE=false`

#### Existing Variables:
- [ ] `PORT=8080`
- [ ] `DATABASE_URL` (via Secret Manager)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `JWT_SECRET` (via Secret Manager)
- [ ] `JWT_EXPIRY=24h`
- [ ] `STRIPE_SECRET_KEY` (via Secret Manager)
- [ ] `STRIPE_WEBHOOK_SECRET` (via Secret Manager)
- [ ] `GCS_BUCKET`
- [ ] `GCS_PROJECT_ID`
- [ ] `ALLOWED_ORIGINS`

---

### ✅ Frontend Production Deployment

#### Client Web App:
- [ ] `VITE_GRAPHQL_ENDPOINT=https://api.helpmeclean.ro/query`
- [ ] `VITE_GOOGLE_CLIENT_ID`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `VITE_ENVIRONMENT=production`

#### Company Dashboard:
- [ ] `VITE_GRAPHQL_ENDPOINT=https://api.helpmeclean.ro/query`
- [ ] `VITE_GOOGLE_CLIENT_ID`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `VITE_ENVIRONMENT=production`

#### Admin Dashboard:
- [ ] `VITE_GRAPHQL_ENDPOINT=https://api.helpmeclean.ro/query`
- [ ] `VITE_GOOGLE_CLIENT_ID`
- [ ] `VITE_ENVIRONMENT=production`

---

## Important Notes

### 🔒 Security Best Practices

1. **Never commit secrets to Git** - Use GCP Secret Manager for sensitive data
2. **Use different credentials for dev/prod** - Separate Google OAuth clients, Stripe keys, etc.
3. **Rotate secrets regularly** - JWT_SECRET, database passwords, API keys
4. **Enable GCP Secret Manager audit logs** - Track secret access

### 🚀 Deployment Order

1. **Set backend environment variables** in GCP Cloud Run
2. **Deploy backend** and verify it starts successfully
3. **Set frontend environment variables** in Vercel (or your hosting provider)
4. **Deploy frontend apps** and verify they connect to the backend

### 📊 Monitoring

After deployment, monitor these metrics:
- Rate limit hits (should be < 1% of total requests)
- Authorization denials (track for anomalies)
- File upload rejections (check for legitimate vs malicious)
- Error rates (should not increase after deployment)

### 🔄 Testing in Production

After deployment, test:
1. Login/logout flow (verify cookies are set/cleared)
2. File upload (verify validation works)
3. Rate limiting (send 11 requests in quick succession to GraphQL endpoint, 11th should fail with 429)
4. Deep query rejection (send a query with depth > 10, should fail)
5. Cross-origin WebSocket connection (should fail from unauthorized origin)

---

## Quick Copy-Paste Commands

### Backend (GCP Cloud Run):

```bash
# Set all security environment variables at once
gcloud run services update helpmeclean-backend \
  --region europe-west1 \
  --update-env-vars \
ENVIRONMENT=production,\
COOKIE_DOMAIN=.helpmeclean.ro,\
RATE_LIMIT_PER_MINUTE=100,\
RATE_LIMIT_STRICT_PER_MINUTE=10,\
GRAPHQL_MAX_DEPTH=10,\
GRAPHQL_MAX_COMPLEXITY=100,\
MAX_FILE_SIZE=10485760,\
ERROR_STRICT_MODE=false
```

### Frontend (Vercel CLI):

```bash
# Set production environment variables for client-web
cd web/packages/client-web
vercel env add VITE_GRAPHQL_ENDPOINT production
# Enter: https://api.helpmeclean.ro/query
vercel env add VITE_ENVIRONMENT production
# Enter: production
```

---

**Last Updated:** February 16, 2026
**Status:** ✅ Production Ready
**Related Documentation:** [SECURITY_IMPLEMENTATION_SUMMARY.md](SECURITY_IMPLEMENTATION_SUMMARY.md)
