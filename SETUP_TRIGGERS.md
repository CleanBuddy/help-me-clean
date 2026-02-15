# Set Up Cloud Build Triggers - Step by Step

## ✅ Prerequisites Done
- ✅ Development branch created and pushed
- ✅ Main branch updated with deployment configs
- ✅ All secrets uploaded to GCP

## 📋 Steps to Enable Auto-Deploy

### Option 1: Web Console (Recommended - 5 minutes)

#### Step 1: Connect GitHub Repository

1. Open: https://console.cloud.google.com/cloud-build/triggers?project=help-me-clean-486919
2. Click **"Connect Repository"**
3. Select **"GitHub (Cloud Build GitHub App)"**
4. Click **"Continue"**
5. Authenticate with GitHub (if needed)
6. Select repository: **CleanBuddy/help-me-clean**
7. Check the box to agree to terms
8. Click **"Connect"**

#### Step 2: Create Development Trigger

1. Click **"Create Trigger"**
2. Fill in:
   - **Name:** `deploy-backend-dev`
   - **Description:** `Auto-deploy backend to dev on push to development branch`
   - **Region:** `europe-west1`
   - **Event:** Push to a branch
   - **Source → Repository:** `CleanBuddy/help-me-clean (GitHub App)`
   - **Source → Branch:** `^development$` (regex pattern)
   - **Configuration:**
     - Type: `Cloud Build configuration file (yaml or json)`
     - Location: `backend/cloudbuild.yaml`
3. Click **"Create"**

#### Step 3: Create Production Trigger

1. Click **"Create Trigger"** again
2. Fill in:
   - **Name:** `deploy-backend-prod`
   - **Description:** `Auto-deploy backend to prod on push to main branch`
   - **Region:** `europe-west1`
   - **Event:** Push to a branch
   - **Source → Repository:** `CleanBuddy/help-me-clean (GitHub App)`
   - **Source → Branch:** `^main$` (regex pattern)
   - **Configuration:**
     - Type: `Cloud Build configuration file (yaml or json)`
     - Location: `backend/cloudbuild-prod.yaml`
3. Click **"Create"**

---

### Option 2: Command Line (After GitHub is Connected)

Once you've connected the repository via the web console, you can create triggers via CLI:

```bash
# Get the repository resource name first
REPO_NAME=$(gcloud builds repositories list \
  --connection=CleanBuddy-help-me-clean \
  --region=europe-west1 \
  --project=help-me-clean-486919 \
  --format='value(name)' 2>/dev/null || echo "")

# Create dev trigger
gcloud builds triggers create github \
  --name=deploy-backend-dev \
  --description="Auto-deploy backend to dev on push to development branch" \
  --region=europe-west1 \
  --repo-name=CleanBuddy/help-me-clean \
  --repo-owner=CleanBuddy \
  --branch-pattern=^development$ \
  --build-config=backend/cloudbuild.yaml \
  --project=help-me-clean-486919

# Create prod trigger
gcloud builds triggers create github \
  --name=deploy-backend-prod \
  --description="Auto-deploy backend to prod on push to main branch" \
  --region=europe-west1 \
  --repo-name=CleanBuddy/help-me-clean \
  --repo-owner=CleanBuddy \
  --branch-pattern=^main$ \
  --build-config=backend/cloudbuild-prod.yaml \
  --project=help-me-clean-486919
```

---

## 🧪 Test the Auto-Deploy

### Test Development Deploy

```bash
# Make a small change
git checkout development
echo "# Test deployment" >> backend/README_GCP.md
git add backend/README_GCP.md
git commit -m "test: trigger dev deployment"
git push origin development
```

**Watch the build:**
https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919

### Test Production Deploy

```bash
# Merge to main
git checkout main
git merge development
git push origin main
```

**Watch the build:**
https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919

---

## 🔍 Verify Triggers Are Set Up

```bash
# List all triggers
gcloud builds triggers list \
  --region=europe-west1 \
  --project=help-me-clean-486919
```

Expected output:
```
NAME                  REGION         TRIGGER_TYPE  SOURCE_REPO              BRANCH_PATTERN
deploy-backend-dev    europe-west1   GITHUB        CleanBuddy/help-me-clean ^development$
deploy-backend-prod   europe-west1   GITHUB        CleanBuddy/help-me-clean ^main$
```

---

## 📊 Monitor Deployments

### Cloud Build Dashboard
https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919

### Cloud Run Services
- Dev: https://console.cloud.google.com/run/detail/europe-west1/helpmeclean-backend-dev?project=help-me-clean-486919
- Prod: https://console.cloud.google.com/run/detail/europe-west1/helpmeclean-backend-prod?project=help-me-clean-486919

### Logs
```bash
# View Cloud Build logs
gcloud builds log <BUILD_ID> --project=help-me-clean-486919

# View Cloud Run logs (dev)
gcloud run services logs read helpmeclean-backend-dev \
  --region=europe-west1 \
  --project=help-me-clean-486919

# View Cloud Run logs (prod)
gcloud run services logs read helpmeclean-backend-prod \
  --region=europe-west1 \
  --project=help-me-clean-486919
```

---

## 🎯 Workflow After Setup

```
┌─────────────────────────────────────────────────┐
│  Development Workflow                           │
└─────────────────────────────────────────────────┘

1. Work on features in development branch
   → git checkout development
   → make changes
   → git commit -m "feat: new feature"
   → git push origin development

2. Cloud Build automatically:
   → Builds Docker image
   → Pushes to Artifact Registry
   → Deploys to helpmeclean-backend-dev

3. Test on dev backend:
   → https://helpmeclean-backend-dev-hkunbdxbkq-ew.a.run.app

4. When ready for production:
   → git checkout main
   → git merge development
   → git push origin main

5. Cloud Build automatically:
   → Builds Docker image
   → Pushes to Artifact Registry
   → Deploys to helpmeclean-backend-prod
```

---

## 🚨 Troubleshooting

### Trigger not firing?

1. Check webhook is installed:
   - Go to GitHub repo → Settings → Webhooks
   - Should see Cloud Build webhook

2. Check trigger configuration:
   - Branch pattern matches your branch name
   - Config file path is correct

3. Check build history:
   - https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919
   - Look for failed or skipped builds

### Build failing?

Check the logs:
```bash
# Get latest build ID
BUILD_ID=$(gcloud builds list --limit=1 --format='value(id)' --project=help-me-clean-486919)

# View logs
gcloud builds log $BUILD_ID --project=help-me-clean-486919
```

Common issues:
- Secrets not accessible → Check IAM permissions
- Docker build fails → Check Dockerfile syntax
- Deploy fails → Check Cloud Run quotas

---

## ✅ Next Steps After Triggers Are Set Up

1. ✅ Test dev deployment by pushing to development
2. ✅ Test prod deployment by pushing to main
3. ✅ Update frontend `.env` files with backend URLs
4. ✅ Set up Stripe webhooks with your Cloud Run URLs
5. ✅ Monitor logs and metrics

Your backend will now auto-deploy on every push! 🎉
