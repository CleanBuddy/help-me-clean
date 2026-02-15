# GCP Cloud Run Deployment - Ready to Deploy! 🚀

## ✅ Everything is Configured

Your GCP project: **help-me-clean-486919**

### Files Created

```
backend/
├── Dockerfile.cloudrun              # Optimized production build
├── .gcloudignore                    # Build exclusions
├── cloudbuild.yaml                  # Dev auto-deploy (development branch)
├── cloudbuild-prod.yaml             # Prod auto-deploy (main branch)
├── scripts/
│   ├── setup-gcp.sh                 # One-time GCP setup
│   ├── run-migrations.sh            # Database migrations
│   └── deploy.sh                    # Manual deployment (optional)
├── GCP_SETUP.md                     # Detailed setup guide
├── SECRETS_TEMPLATE.md              # All environment variables
├── DEPLOYMENT_CHECKLIST.md          # Quick checklist
└── README_GCP.md                    # This file
```

### Databases Configured

- **Dev:** `ep-late-waterfall-agcqcvau-pooler.c-2.eu-central-1.aws.neon.tech`
- **Prod:** `ep-odd-dawn-agcm1p89-pooler.c-2.eu-central-1.aws.neon.tech`
- **Status:** Empty (migrations ready to run)

### Secrets Configured

All from your `.env` file:
- ✅ Google OAuth credentials
- ✅ Stripe TEST keys (dev)
- ✅ Database URLs (Neon)
- ✅ JWT secrets (will be auto-generated)
- ✅ Dummy production secrets

## 🚀 Deploy in 3 Commands

```bash
# 1. Setup GCP (one-time)
cd backend
./scripts/setup-gcp.sh

# 2. Run migrations
./scripts/run-migrations.sh

# 3. Deploy to dev
./scripts/deploy.sh dev
```

## 📖 Full Guide

See: [DEPLOY_NOW.md](../DEPLOY_NOW.md) in project root

## 🔗 Quick Links

- [GCP Console](https://console.cloud.google.com/welcome?project=help-me-clean-486919)
- [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers?project=help-me-clean-486919)
- [Cloud Run Services](https://console.cloud.google.com/run?project=help-me-clean-486919)
- [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=help-me-clean-486919)
- [Logs](https://console.cloud.google.com/logs?project=help-me-clean-486919)

## 💰 Expected Costs

| Environment | Cost/Month | Notes |
|-------------|------------|-------|
| Dev | $0-5 | Scales to zero |
| Prod | $10-30 | Min 1 instance |
| **Total** | **$10-35** | MVP pricing |

## 🎯 After First Deploy

Your API URLs will be:
```
Dev:  https://helpmeclean-backend-dev-XXXXXXXXXX-ew.a.run.app
Prod: https://helpmeclean-backend-prod-XXXXXXXXXX-ew.a.run.app
```

Update these in your frontend `.env` files!

## ⚡ Automated Workflow

```
Push to development → Auto-deploy to dev backend
Push to main        → Auto-deploy to prod backend
```

No manual deployment needed after initial setup!
