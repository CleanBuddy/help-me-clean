# 🚀 Test Automated Deployments - Ready to Go!

## ✅ What's Been Set Up

| Component | Status | Details |
|-----------|--------|---------|
| **Main Branch** | ✅ Updated | All deployment configs committed |
| **Development Branch** | ✅ Created | Ready for auto-deploy testing |
| **Test Commit** | ✅ Ready | Pending push to trigger deployment |
| **GCP Setup** | ✅ Complete | Secrets, permissions, buckets |
| **Manual Deploy** | ✅ Tested | Dev backend is live |

## 🎯 Next Steps (3 minutes)

### Step 1: Connect GitHub to Cloud Build (Web Console)

**You need to do this once via the web console:**

1. Open: https://console.cloud.google.com/cloud-build/triggers?project=help-me-clean-486919

2. Click **"Connect Repository"**

3. Select **"GitHub (Cloud Build GitHub App)"**

4. Authenticate and select: **CleanBuddy/help-me-clean**

5. Click **"Connect"**

---

### Step 2: Create Cloud Build Triggers

After connecting, create two triggers:

#### Development Trigger
```
Name: deploy-backend-dev
Region: europe-west1
Event: Push to a branch
Branch: ^development$
Config: backend/cloudbuild.yaml
```

#### Production Trigger
```
Name: deploy-backend-prod
Region: europe-west1
Event: Push to a branch
Branch: ^main$
Config: backend/cloudbuild-prod.yaml
```

**Detailed instructions:** See [SETUP_TRIGGERS.md](./SETUP_TRIGGERS.md)

---

### Step 3: Test Development Deployment

Once triggers are set up, run this:

```bash
# Push to development branch (triggers auto-deploy)
git push origin development
```

**Watch the build live:**
https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919

You should see:
1. ✅ Build triggered automatically
2. ✅ Docker image built
3. ✅ Deployed to `helpmeclean-backend-dev`

---

### Step 4: Test Production Deployment

```bash
# Merge development to main
git checkout main
git merge development
git push origin main
```

**Watch the build:**
https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919

You should see:
1. ✅ Build triggered automatically
2. ✅ Docker image built
3. ✅ Deployed to `helpmeclean-backend-prod`

---

## 📊 Expected Results

### After Development Push

**Build Time:** ~4-5 minutes

**New Deployment:**
- Service: `helpmeclean-backend-dev`
- URL: https://helpmeclean-backend-dev-hkunbdxbkq-ew.a.run.app
- GraphQL: https://helpmeclean-backend-dev-hkunbdxbkq-ew.a.run.app/graphql

### After Main Push

**Build Time:** ~4-5 minutes

**New Deployment:**
- Service: `helpmeclean-backend-prod`
- URL: https://helpmeclean-backend-prod-XXXXXXXXXX-ew.a.run.app
- GraphQL: https://helpmeclean-backend-prod-XXXXXXXXXX-ew.a.run.app/graphql

---

## 🔍 Verify Triggers Work

### Check Trigger Status
```bash
gcloud builds triggers list \
  --region=europe-west1 \
  --project=help-me-clean-486919
```

### View Latest Builds
```bash
gcloud builds list \
  --limit=5 \
  --project=help-me-clean-486919
```

### Monitor Build Logs
```bash
# Get latest build
BUILD_ID=$(gcloud builds list --limit=1 --format='value(id)' --project=help-me-clean-486919)

# Stream logs
gcloud builds log $BUILD_ID --project=help-me-clean-486919 --stream
```

---

## 🎉 After Successful Test

You'll have:

### ✅ Fully Automated CI/CD
```
Push to development → Auto-deploy to dev backend
Push to main        → Auto-deploy to prod backend
```

### ✅ Two Live Backends
```
Dev:  https://helpmeclean-backend-dev-hkunbdxbkq-ew.a.run.app
Prod: https://helpmeclean-backend-prod-XXXXXXXXXX-ew.a.run.app
```

### ✅ Complete Workflow
```
1. Develop on 'development' branch
2. Test on dev backend automatically
3. Merge to 'main' when ready
4. Deploy to prod automatically
5. Zero manual deployment steps!
```

---

## 📝 Quick Reference

### Current State

**Branches:**
- `main` - Production deploys
- `development` - Development deploys

**Live Services:**
- Dev backend: ✅ LIVE (manual deploy)
- Prod backend: ⏳ Pending first auto-deploy

**Pending:**
- Connect GitHub repo to Cloud Build (web console)
- Create two Cloud Build triggers
- Test automated deploys

### Commands Cheat Sheet

```bash
# Work on development
git checkout development
git add .
git commit -m "feat: new feature"
git push origin development  # Auto-deploys to dev!

# Deploy to production
git checkout main
git merge development
git push origin main  # Auto-deploys to prod!

# View deployments
gcloud builds list --project=help-me-clean-486919

# View service URLs
gcloud run services list \
  --region=europe-west1 \
  --project=help-me-clean-486919
```

---

## 🆘 Need Help?

1. **Detailed trigger setup:** [SETUP_TRIGGERS.md](./SETUP_TRIGGERS.md)
2. **Complete deployment guide:** [DEPLOY_NOW.md](./DEPLOY_NOW.md)
3. **GCP setup details:** [backend/GCP_SETUP.md](./backend/GCP_SETUP.md)
4. **Cloud Build dashboard:** https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919
5. **Cloud Run dashboard:** https://console.cloud.google.com/run?project=help-me-clean-486919

---

## ⚡ Ready to Test!

1. **Connect GitHub** (web console - 2 min)
2. **Create triggers** (web console - 2 min)
3. **Push to development** (1 command)
4. **Watch it deploy!** 🚀

Your backend will auto-deploy on every commit! 🎉
