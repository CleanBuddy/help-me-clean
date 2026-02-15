# Environment Variables & Secrets Template

Fill in these values and keep them secure. **Never commit this file with real values!**

## Required Information Checklist

### ✅ Database URLs (Neon)

I need TWO Neon database connection strings:

```bash
# Development Database URL
dev_DATABASE_URL="postgresql://user:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/helpmeclean_dev?sslmode=require"

# Production Database URL
prod_DATABASE_URL="postgresql://user:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/helpmeclean_prod?sslmode=require"
```

### ✅ JWT Secrets

Generate strong random strings (minimum 32 characters). **MUST be different for dev and prod!**

```bash
# Generate with: openssl rand -base64 48

# Development JWT Secret
dev_JWT_SECRET="your-dev-jwt-secret-minimum-32-characters-long-random-string"

# Production JWT Secret (DIFFERENT!)
prod_JWT_SECRET="your-prod-jwt-secret-different-from-dev-min-32-chars"
```

### ✅ Google OAuth Credentials

Get from: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

```bash
# Web Client ID (same for dev and prod or separate)
dev_GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
prod_GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"

# iOS Client ID
dev_GOOGLE_CLIENT_ID_IOS="xxx.apps.googleusercontent.com"
prod_GOOGLE_CLIENT_ID_IOS="xxx.apps.googleusercontent.com"

# Android Client ID
dev_GOOGLE_CLIENT_ID_ANDROID="xxx.apps.googleusercontent.com"
prod_GOOGLE_CLIENT_ID_ANDROID="xxx.apps.googleusercontent.com"
```

### ✅ Stripe Credentials

Get from: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

```bash
# Development (TEST keys - start with sk_test_, pk_test_)
dev_STRIPE_SECRET_KEY="sk_test_xxx"
dev_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
dev_STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Production (LIVE keys - start with sk_live_, pk_live_)
prod_STRIPE_SECRET_KEY="sk_live_xxx"
prod_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
prod_STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

**Stripe Webhook Setup:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://YOUR-CLOUD-RUN-URL/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.
4. Copy webhook signing secret

### ✅ Factureaza.ro API

Get from: [Factureaza.ro Account](https://factureaza.ro/)

```bash
# Development (sandbox)
dev_FACTUREAZA_API_KEY="your-factureaza-api-key"

# Production (live)
prod_FACTUREAZA_API_KEY="your-factureaza-api-key"
```

### ✅ Google Cloud Storage Buckets

```bash
# Create GCS buckets first:
# gsutil mb -l europe-west1 gs://helpmeclean-dev-uploads
# gsutil mb -l europe-west1 gs://helpmeclean-prod-uploads

dev_GCS_BUCKET="helpmeclean-dev-uploads"
prod_GCS_BUCKET="helpmeclean-prod-uploads"
```

### ✅ Firebase Service Account Keys

Get from: [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts

1. Generate new private key (downloads JSON file)
2. Save as `firebase-dev-key.json` and `firebase-prod-key.json`
3. Upload to Secret Manager (see GCP_SETUP.md)

```bash
# These will be uploaded as files
firebase-dev-key.json
firebase-prod-key.json
```

### ✅ Platform Company Details (Same for dev/prod)

```bash
PLATFORM_COMPANY_NAME="HelpMeClean SRL"
PLATFORM_CUI="RO12345678"
PLATFORM_REG_NUMBER="J40/1234/2024"
PLATFORM_ADDRESS="Str. Exemplu nr. 1"
PLATFORM_CITY="Bucuresti"
PLATFORM_COUNTY="Bucuresti"
PLATFORM_IS_VAT_PAYER="true"
PLATFORM_BANK_NAME="ING Bank"
PLATFORM_IBAN="RO49AAAA1B31007593840000"
```

## Quick Upload Script

Once you have all values, use this script to upload to GCP Secret Manager:

```bash
#!/bin/bash
# upload-secrets.sh

PROJECT_ID="helpmeclean"
gcloud config set project $PROJECT_ID

# Development Secrets
echo "Uploading development secrets..."
echo -n "$dev_DATABASE_URL" | gcloud secrets create dev_DATABASE_URL --data-file=-
echo -n "$dev_JWT_SECRET" | gcloud secrets create dev_JWT_SECRET --data-file=-
echo -n "$dev_GOOGLE_CLIENT_ID" | gcloud secrets create dev_GOOGLE_CLIENT_ID --data-file=-
echo -n "$dev_GOOGLE_CLIENT_ID_IOS" | gcloud secrets create dev_GOOGLE_CLIENT_ID_IOS --data-file=-
echo -n "$dev_GOOGLE_CLIENT_ID_ANDROID" | gcloud secrets create dev_GOOGLE_CLIENT_ID_ANDROID --data-file=-
echo -n "$dev_STRIPE_SECRET_KEY" | gcloud secrets create dev_STRIPE_SECRET_KEY --data-file=-
echo -n "$dev_STRIPE_PUBLISHABLE_KEY" | gcloud secrets create dev_STRIPE_PUBLISHABLE_KEY --data-file=-
echo -n "$dev_STRIPE_WEBHOOK_SECRET" | gcloud secrets create dev_STRIPE_WEBHOOK_SECRET --data-file=-
echo -n "$dev_FACTUREAZA_API_KEY" | gcloud secrets create dev_FACTUREAZA_API_KEY --data-file=-
echo -n "$dev_GCS_BUCKET" | gcloud secrets create dev_GCS_BUCKET --data-file=-
cat firebase-dev-key.json | gcloud secrets create dev_FIREBASE_SERVICE_ACCOUNT_KEY --data-file=-

# Production Secrets
echo "Uploading production secrets..."
echo -n "$prod_DATABASE_URL" | gcloud secrets create prod_DATABASE_URL --data-file=-
echo -n "$prod_JWT_SECRET" | gcloud secrets create prod_JWT_SECRET --data-file=-
echo -n "$prod_GOOGLE_CLIENT_ID" | gcloud secrets create prod_GOOGLE_CLIENT_ID --data-file=-
echo -n "$prod_GOOGLE_CLIENT_ID_IOS" | gcloud secrets create prod_GOOGLE_CLIENT_ID_IOS --data-file=-
echo -n "$prod_GOOGLE_CLIENT_ID_ANDROID" | gcloud secrets create prod_GOOGLE_CLIENT_ID_ANDROID --data-file=-
echo -n "$prod_STRIPE_SECRET_KEY" | gcloud secrets create prod_STRIPE_SECRET_KEY --data-file=-
echo -n "$prod_STRIPE_PUBLISHABLE_KEY" | gcloud secrets create prod_STRIPE_PUBLISHABLE_KEY --data-file=-
echo -n "$prod_STRIPE_WEBHOOK_SECRET" | gcloud secrets create prod_STRIPE_WEBHOOK_SECRET --data-file=-
echo -n "$prod_FACTUREAZA_API_KEY" | gcloud secrets create prod_FACTUREAZA_API_KEY --data-file=-
echo -n "$prod_GCS_BUCKET" | gcloud secrets create prod_GCS_BUCKET --data-file=-
cat firebase-prod-key.json | gcloud secrets create prod_FIREBASE_SERVICE_ACCOUNT_KEY --data-file=-

echo "✅ All secrets uploaded!"
```

## Verification

After uploading, verify:

```bash
# List all secrets
gcloud secrets list

# View secret metadata (not the value!)
gcloud secrets describe dev_DATABASE_URL
```

## Security Notes

1. ✅ **Never commit** this file with real values to Git
2. ✅ **Use different** JWT secrets for dev and prod
3. ✅ **Use TEST Stripe keys** for dev, LIVE for prod
4. ✅ **Rotate secrets** periodically
5. ✅ **Limit access** to Secret Manager in GCP
6. ✅ **Enable audit logs** for secret access

## Next Steps

After filling in all values:
1. Upload secrets to GCP (see GCP_SETUP.md)
2. Update `cloudbuild.yaml` if any secret names changed
3. Test deployment to dev environment
4. Verify all services work correctly
5. Deploy to production
