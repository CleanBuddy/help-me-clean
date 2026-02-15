# GCP Deployment Checklist

Quick checklist to get your backend running on GCP Cloud Run.

## 📋 Information I Need From You

### 1. Database URLs (Neon) ✅

Please provide:
```
Dev Database URL: postgresql://...
Prod Database URL: postgresql://...
```

### 2. JWT Secrets ✅

Generate two different random strings (min 32 chars):
```bash
# Generate with: openssl rand -base64 48
Dev JWT Secret:
Prod JWT Secret:
```

### 3. Google OAuth ✅
```
Google Client ID (Web):
Google Client ID (iOS):
Google Client ID (Android):
```

### 4. Stripe Keys ✅
```
# Development (TEST keys)
Dev Stripe Secret Key (sk_test_xxx):
Dev Stripe Publishable Key (pk_test_xxx):
Dev Stripe Webhook Secret (whsec_xxx):

# Production (LIVE keys)
Prod Stripe Secret Key (sk_live_xxx):
Prod Stripe Publishable Key (pk_live_xxx):
Prod Stripe Webhook Secret (whsec_xxx):
```

### 5. Factureaza.ro ✅
```
Factureaza API Key:
```

### 6. Firebase Service Accounts ✅

Download JSON files from Firebase Console:
- `firebase-dev-key.json`
- `firebase-prod-key.json`

### 7. Platform Company Details ✅

Confirm or update:
```
Company Name: HelpMeClean SRL
CUI: RO12345678
Reg Number: J40/1234/2024
Address: Str. Exemplu nr. 1
City: Bucuresti
County: Bucuresti
Is VAT Payer: true
Bank: ING Bank
IBAN: RO49AAAA1B31007593840000
```

## 🚀 Deployment Steps

### Phase 1: GCP Project Setup (15 minutes)

- [ ] 1. Create GCP project `helpmeclean`
- [ ] 2. Enable APIs (Cloud Run, Cloud Build, Artifact Registry, Secret Manager)
- [ ] 3. Create Artifact Registry repository
- [ ] 4. Connect GitHub repository to Cloud Build

### Phase 2: Upload Secrets (10 minutes)

- [ ] 5. Upload all development secrets to Secret Manager
- [ ] 6. Upload all production secrets to Secret Manager
- [ ] 7. Grant Cloud Build access to secrets

### Phase 3: Configure Triggers (5 minutes)

- [ ] 8. Create Cloud Build trigger for `development` branch
- [ ] 9. Create Cloud Build trigger for `main` branch

### Phase 4: Deploy! (10 minutes)

- [ ] 10. Push to `development` → auto-deploys dev backend
- [ ] 11. Push to `main` → auto-deploys prod backend
- [ ] 12. Get Cloud Run URLs
- [ ] 13. Test GraphQL endpoints

### Phase 5: Post-Deployment (15 minutes)

- [ ] 14. Update frontend `.env` files with Cloud Run URLs
- [ ] 15. Set up Stripe webhooks with Cloud Run URLs
- [ ] 16. Create GCS buckets for file uploads
- [ ] 17. Configure custom domains (optional)

## 📁 Files Created

I've created these files for you:

```
backend/
├── Dockerfile.cloudrun          # Optimized Docker build
├── .gcloudignore               # Ignore unnecessary files
├── cloudbuild.yaml             # Dev deployment config
├── cloudbuild-prod.yaml        # Prod deployment config
├── GCP_SETUP.md                # Complete setup guide
├── SECRETS_TEMPLATE.md         # All env vars needed
└── DEPLOYMENT_CHECKLIST.md     # This file
```

## 🎯 What Happens After Setup

### Automated Workflow

```
1. You commit code to development branch
   ↓
2. GitHub triggers Cloud Build
   ↓
3. Cloud Build builds Docker image
   ↓
4. Pushes to Artifact Registry
   ↓
5. Deploys to helpmeclean-backend-dev
   ↓
6. Dev backend is live! 🎉

Same for main → production
```

### URLs You'll Get

```
Dev:  https://helpmeclean-backend-dev-xxx-ew.a.run.app
Prod: https://helpmeclean-backend-prod-xxx-ew.a.run.app
```

## 💰 Expected Costs

| Environment | Monthly Cost | Notes |
|-------------|--------------|-------|
| **Development** | $0-5 | Scales to zero when idle |
| **Production** | $10-30 | Min 1 instance (no cold starts) |
| **Total** | $10-35/mo | Perfect for MVP/demo |

## ⚡ Quick Commands Reference

```bash
# View dev logs
gcloud run services logs read helpmeclean-backend-dev --region=europe-west1

# View prod logs
gcloud run services logs read helpmeclean-backend-prod --region=europe-west1

# Get dev URL
gcloud run services describe helpmeclean-backend-dev \
  --region=europe-west1 --format='value(status.url)'

# Get prod URL
gcloud run services describe helpmeclean-backend-prod \
  --region=europe-west1 --format='value(status.url)'

# Manual deploy (if needed)
gcloud builds submit --config=backend/cloudbuild.yaml backend/

# Update a secret
echo -n "NEW_VALUE" | gcloud secrets versions add dev_DATABASE_URL --data-file=-
```

## 🆘 Need Help?

1. **Read:** [GCP_SETUP.md](./GCP_SETUP.md) - Complete guide
2. **Read:** [SECRETS_TEMPLATE.md](./SECRETS_TEMPLATE.md) - All env vars
3. **Check:** Cloud Build logs at https://console.cloud.google.com/cloud-build
4. **Check:** Cloud Run logs at https://console.cloud.google.com/run

## ✅ Ready to Start?

Provide me with the information from section "📋 Information I Need From You" and I'll help you deploy!
