# 🚀 Deploy to GCP Cloud Run - Quick Start

## What I've Set Up For You

✅ **3 Deployment Scripts** (in `backend/scripts/`)
- `setup-gcp.sh` - One-time GCP setup (secrets, permissions, buckets)
- `run-migrations.sh` - Run database migrations on Neon
- `deploy.sh` - Manual deployment (optional, for testing)

✅ **2 Cloud Build Configs**
- `cloudbuild.yaml` - Auto-deploy from `development` branch
- `cloudbuild-prod.yaml` - Auto-deploy from `main` branch

✅ **Optimized Dockerfile**
- `Dockerfile.cloudrun` - Multi-stage build, <10MB image

✅ **Neon Databases Configured**
- Dev: `ep-late-waterfall-agcqcvau-pooler.c-2.eu-central-1.aws.neon.tech`
- Prod: `ep-odd-dawn-agcm1p89-pooler.c-2.eu-central-1.aws.neon.tech`

---

## 🎯 Deploy in 3 Steps (15 minutes)

### Step 1: Run GCP Setup Script (5 min)

This uploads all secrets from your `.env` file to GCP Secret Manager:

```bash
cd backend
./scripts/setup-gcp.sh
```

**What it does:**
- ✅ Enables required GCP APIs
- ✅ Creates Artifact Registry for Docker images
- ✅ Uploads all dev secrets (from your .env)
- ✅ Uploads all prod secrets (dummy data)
- ✅ Grants Cloud Build permissions
- ✅ Creates GCS buckets for file uploads
- ✅ Generates JWT secrets (saves them at the end!)

**⚠️ IMPORTANT:** Copy the JWT secrets shown at the end!

---

### Step 2: Run Database Migrations (2 min)

Migrate both Neon databases:

```bash
cd backend
./scripts/run-migrations.sh
```

**What it does:**
- ✅ Installs `golang-migrate` if needed
- ✅ Runs all `.sql` migrations on dev database
- ✅ Runs all `.sql` migrations on prod database

---

### Step 3: Connect GitHub & Deploy (8 min)

#### 3a. Connect Repository to Cloud Build

1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=help-me-clean-486919
2. Click **"Connect Repository"**
3. Select **"GitHub (Cloud Build GitHub App)"**
4. Authenticate with GitHub
5. Select repository: `your-username/help-me-clean`
6. Click **"Connect"**

#### 3b. Create Development Trigger

1. Click **"Create Trigger"**
2. Fill in:
   - **Name:** `deploy-backend-dev`
   - **Region:** `europe-west1`
   - **Event:** Push to a branch
   - **Source → Branch:** `^development$` (regex)
   - **Configuration:** Cloud Build configuration file
   - **Location:** `backend/cloudbuild.yaml`
3. Click **"Create"**

#### 3c. Create Production Trigger

1. Click **"Create Trigger"** again
2. Fill in:
   - **Name:** `deploy-backend-prod`
   - **Region:** `europe-west1`
   - **Event:** Push to a branch
   - **Source → Branch:** `^main$` (regex)
   - **Configuration:** Cloud Build configuration file
   - **Location:** `backend/cloudbuild-prod.yaml`
3. Click **"Create"**

#### 3d. Deploy!

**Option A: Trigger First Deploy (Manual)**
```bash
# Deploy dev
cd backend
./scripts/deploy.sh dev

# Deploy prod (optional, won't test it yet)
./scripts/deploy.sh prod
```

**Option B: Push to GitHub (Auto)**
```bash
# Commit all new files
git add .
git commit -m "feat: add GCP Cloud Run deployment"

# Deploy to dev
git push origin development

# Deploy to prod
git push origin main
```

---

## 🌐 Getting Your API URLs

After deployment completes (5-10 minutes), get your URLs:

```bash
# Development URL
gcloud run services describe helpmeclean-backend-dev \
  --region=europe-west1 \
  --project=help-me-clean-486919 \
  --format='value(status.url)'

# Production URL
gcloud run services describe helpmeclean-backend-prod \
  --region=europe-west1 \
  --project=help-me-clean-486919 \
  --format='value(status.url)'
```

URLs will look like:
```
Dev:  https://helpmeclean-backend-dev-XXXXXXXXXX-ew.a.run.app
Prod: https://helpmeclean-backend-prod-XXXXXXXXXX-ew.a.run.app
```

---

## ✅ Verify Deployment

Test your GraphQL endpoint:

```bash
# Get dev URL
DEV_URL=$(gcloud run services describe helpmeclean-backend-dev \
  --region=europe-west1 \
  --project=help-me-clean-486919 \
  --format='value(status.url)')

# Test health
curl $DEV_URL/health

# Test GraphQL (should return GraphQL error asking for query)
curl $DEV_URL/graphql
```

---

## 🔄 Automated Deployments (After Initial Setup)

Once triggers are set up, just push to GitHub:

```bash
# Make changes
git checkout development
git add .
git commit -m "feat: new feature"
git push origin development
# → Automatically builds and deploys to dev! ✅

# Deploy to production
git checkout main
git merge development
git push origin main
# → Automatically builds and deploys to prod! ✅
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# Development logs (live tail)
gcloud run services logs tail helpmeclean-backend-dev \
  --region=europe-west1 \
  --project=help-me-clean-486919

# Production logs
gcloud run services logs tail helpmeclean-backend-prod \
  --region=europe-west1 \
  --project=help-me-clean-486919
```

### Cloud Console
- **Logs:** https://console.cloud.google.com/logs?project=help-me-clean-486919
- **Cloud Run:** https://console.cloud.google.com/run?project=help-me-clean-486919
- **Cloud Build:** https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919
- **Secrets:** https://console.cloud.google.com/security/secret-manager?project=help-me-clean-486919

---

## 🔧 Updating Secrets Later

```bash
# Update a secret
echo -n "NEW_VALUE" | gcloud secrets versions add dev_DATABASE_URL --data-file=-

# Redeploy to pick up new secret
git commit --allow-empty -m "chore: update secrets"
git push origin development
```

---

## 💰 Cost Tracking

Monitor costs at: https://console.cloud.google.com/billing?project=help-me-clean-486919

**Expected Costs:**
- Dev (scales to zero): $0-5/month
- Prod (min 1 instance): $10-30/month
- **Total: ~$10-35/month**

---

## 🆘 Troubleshooting

### Build Fails
```bash
# View latest build log
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)' --project=help-me-clean-486919)
```

### Service Won't Start
```bash
# Check service logs
gcloud run services logs read helpmeclean-backend-dev \
  --region=europe-west1 \
  --project=help-me-clean-486919 \
  --limit=100
```

### Permission Denied
```bash
# Verify Cloud Build has correct roles
gcloud projects get-iam-policy help-me-clean-486919 \
  --flatten="bindings[].members" \
  --filter="bindings.members:*cloudbuild*"
```

---

## 📝 Next Steps After Deployment

1. ✅ Update frontend `.env` files with Cloud Run URLs
2. ✅ Test GraphQL queries from frontend
3. ✅ Set up Stripe webhooks with Cloud Run URL
4. ✅ Update CORS origins in cloudbuild.yaml
5. ✅ Set up custom domain (optional): `api.helpmeclean.ro`

---

## 🎉 You're Done!

Your backend is now:
- ✅ Running on GCP Cloud Run
- ✅ Auto-deploying from GitHub
- ✅ Using Neon PostgreSQL
- ✅ Secured with Secret Manager
- ✅ Scales automatically
- ✅ Costs optimized

**Start coding and let the automation handle deployment!** 🚀
