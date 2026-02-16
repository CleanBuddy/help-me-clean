# 🚀 HelpMeClean Deployment Summary

Complete deployment setup for HelpMeClean MVP - Backend on GCP, Frontend on Vercel.

---

## 📊 Current Deployment Status

| Component | Status | Environment | URL |
|-----------|--------|-------------|-----|
| **Backend Dev** | ✅ LIVE | europe-central2 | https://helpmeclean-backend-dev-hkunbdxbkq-lm.a.run.app |
| **Backend Prod** | ⏳ Ready | europe-central2 | Deploy with `./backend/scripts/deploy.sh prod` |
| **Frontend Dev** | ⏳ Setup | Vercel Preview | Deploy from `development` branch |
| **Frontend Prod** | ⏳ Setup | Vercel Production | Deploy from `main` branch |
| **Database Dev** | ✅ Migrated | Neon | 16 migrations applied |
| **Database Prod** | ✅ Migrated | Neon | 16 migrations applied |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Vercel)                                      │
│  ┌────────────────────────┐  ┌────────────────────────┐│
│  │ Preview (development)  │  │ Production (main)      ││
│  │ Uses: Dev Backend      │  │ Uses: Prod Backend     ││
│  └────────────────────────┘  └────────────────────────┘│
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
                ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (GCP Cloud Run - europe-central2)              │
│  ┌────────────────────────┐  ┌────────────────────────┐│
│  │ Dev Environment        │  │ Prod Environment       ││
│  │ Min instances: 0       │  │ Min instances: 1       ││
│  │ Stripe: TEST keys      │  │ Stripe: LIVE keys      ││
│  └────────────────────────┘  └────────────────────────┘│
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
                ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│  DATABASE (Neon PostgreSQL)                             │
│  ┌────────────────────────┐  ┌────────────────────────┐│
│  │ Dev Database           │  │ Prod Database          ││
│  │ 16 migrations          │  │ 16 migrations          ││
│  └────────────────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Git Workflow → Automatic Deployment

### Development Workflow
```bash
git checkout development
# Make changes...
git add .
git commit -m "feat: new feature"
git push origin development

# Triggers:
# ✅ Cloud Build → Deploys backend to dev (if triggers set up)
# ✅ Vercel → Deploys frontend to preview
```

### Production Workflow
```bash
git checkout main
git merge development
git push origin main

# Triggers:
# ✅ Cloud Build → Deploys backend to prod (if triggers set up)
# ✅ Vercel → Deploys frontend to production
```

---

## 📝 Branch → Environment Mapping

| Git Branch | Backend Deploy | Frontend Deploy | Stripe Keys |
|------------|---------------|-----------------|-------------|
| `development` | helpmeclean-backend-dev | Preview URL | TEST |
| `main` | helpmeclean-backend-prod | Production URL | LIVE |

---

## 🚀 Quick Deploy Commands

### Backend

```bash
cd backend

# Deploy to dev
./scripts/deploy.sh dev

# Deploy to prod
./scripts/deploy.sh prod
```

### Frontend

**Option 1: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import `CleanBuddy/help-me-clean`
3. Configure (see VERCEL_DEPLOYMENT.md)
4. Deploy!

**Option 2: Via Git Push**
```bash
# Already configured! Just push:
git push origin development  # → Preview
git push origin main          # → Production
```

---

## 📁 Deployment Configuration Files

### Backend (GCP Cloud Run)
```
backend/
├── Dockerfile.cloudrun           # Optimized production build
├── cloudbuild.yaml               # Dev deployment (development branch)
├── cloudbuild-prod.yaml          # Prod deployment (main branch)
├── scripts/
│   ├── setup-gcp.sh              # One-time GCP setup
│   ├── run-migrations.sh         # Database migrations
│   └── deploy.sh                 # Manual deployment
└── .gcloudignore                 # Files to exclude from build
```

### Frontend (Vercel)
```
web/packages/client-web/
├── vercel.json                   # Vercel configuration
├── .env.development              # Dev environment variables
├── .env.production               # Prod environment variables
└── .vercelignore                 # Files to exclude from build
```

---

## 🔐 Environment Variables

### Backend (GCP Secret Manager)

**Development:**
- `dev_DATABASE_URL` - Neon dev database
- `dev_JWT_SECRET` - JWT signing key
- `dev_GOOGLE_CLIENT_ID` - Google OAuth
- `dev_STRIPE_SECRET_KEY` - Stripe TEST key
- `dev_STRIPE_PUBLISHABLE_KEY` - Stripe TEST public key
- ... (see backend/SECRETS_TEMPLATE.md)

**Production:**
- `prod_DATABASE_URL` - Neon prod database
- `prod_JWT_SECRET` - JWT signing key (different!)
- `prod_GOOGLE_CLIENT_ID` - Google OAuth
- `prod_STRIPE_SECRET_KEY` - Stripe LIVE key
- `prod_STRIPE_PUBLISHABLE_KEY` - Stripe LIVE public key
- ... (see backend/SECRETS_TEMPLATE.md)

### Frontend (Vercel Dashboard)

**Preview (development branch):**
```
VITE_GRAPHQL_ENDPOINT=https://helpmeclean-backend-dev-hkunbdxbkq-lm.a.run.app/graphql
VITE_GOOGLE_CLIENT_ID=794597417467-hks5884pvd1ihthpoid6ad0nasanm459.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SzzgVAjjzKXeJfowxwRwJ6Pdt7VDf4E2XUqT69Fwo2li16by4RbGYMMp4KsiR46VmI7B2etnGS7rYesgtLHoj1M007Tomkwhv
```

**Production (main branch):**
```
VITE_GRAPHQL_ENDPOINT=https://helpmeclean-backend-prod-XXXXXXXXXX-lm.a.run.app/graphql
VITE_GOOGLE_CLIENT_ID=794597417467-hks5884pvd1ihthpoid6ad0nasanm459.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 💰 Monthly Costs

| Service | Environment | Cost |
|---------|-------------|------|
| GCP Cloud Run Dev | Scales to zero | $0-5 |
| GCP Cloud Run Prod | Min 1 instance | $10-30 |
| Neon Dev | Free tier | $0 |
| Neon Prod | Free tier | $0 |
| Vercel | Free tier | $0 |
| **Total** | | **$10-35/month** |

---

## 📖 Documentation

- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - Initial GCP setup guide
- **[backend/GCP_SETUP.md](backend/GCP_SETUP.md)** - Detailed GCP configuration
- **[SETUP_TRIGGERS.md](SETUP_TRIGGERS.md)** - Cloud Build triggers with path filtering
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Vercel deployment guide
- **[backend/SECRETS_TEMPLATE.md](backend/SECRETS_TEMPLATE.md)** - All environment variables

---

## ✅ Deployment Checklist

### One-Time Setup

**Backend:**
- [x] GCP project created
- [x] Artifact Registry created (europe-central2)
- [x] Secrets uploaded to Secret Manager
- [x] IAM permissions granted
- [x] GCS buckets created
- [x] Database migrations run
- [x] Dev backend deployed
- [ ] Prod backend deployed
- [ ] Cloud Build triggers set up

**Frontend:**
- [x] Vercel configuration files created
- [x] Environment variables documented
- [ ] Vercel project created
- [ ] GitHub connected to Vercel
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured

### Testing

- [ ] Test dev backend GraphQL: https://helpmeclean-backend-dev-hkunbdxbkq-lm.a.run.app/graphql
- [ ] Test prod backend GraphQL (after deployment)
- [ ] Test dev frontend deployment
- [ ] Test prod frontend deployment
- [ ] Test booking flow end-to-end
- [ ] Test Google OAuth login
- [ ] Test Stripe payments (test mode)
- [ ] Test all user dashboards (client, cleaner, company, admin)

---

## 🆘 Support & Troubleshooting

### Backend Issues
See: [backend/GCP_SETUP.md](backend/GCP_SETUP.md) - Troubleshooting section

### Frontend Issues
See: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Troubleshooting section

### Cloud Build Logs
https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919

### Cloud Run Logs
```bash
# Dev
gcloud run services logs read helpmeclean-backend-dev \
  --region=europe-central2 \
  --project=help-me-clean-486919

# Prod
gcloud run services logs read helpmeclean-backend-prod \
  --region=europe-central2 \
  --project=help-me-clean-486919
```

---

## 🎯 Next Steps

1. **Deploy Production Backend**
   ```bash
   cd backend && ./scripts/deploy.sh prod
   ```

2. **Deploy Frontend to Vercel**
   - Follow [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
   - Set up environment variables for both environments

3. **Set Up Cloud Build Triggers** (Optional, for auto-deploy)
   - Follow [SETUP_TRIGGERS.md](SETUP_TRIGGERS.md)

4. **Configure Custom Domain**
   - helpmeclean.ro → Vercel
   - api.helpmeclean.ro → GCP Cloud Run (optional)

5. **Update Production Stripe Keys**
   - Get live keys from Stripe dashboard
   - Update GCP secrets and Vercel env vars

6. **Test Everything End-to-End**
   - Booking flow
   - Payment processing
   - All user dashboards

---

## 🎉 You're Ready!

Your infrastructure is set up for:
- ✅ Automatic deployments
- ✅ Separate dev/prod environments
- ✅ Cost-optimized hosting
- ✅ Global CDN (frontend)
- ✅ Scalable backend
- ✅ Secure secret management

**Time to build and launch!** 🚀
