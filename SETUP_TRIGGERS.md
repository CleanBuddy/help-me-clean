# Cloud Build Triggers Setup - Path-Based Filtering

This guide shows how to set up Cloud Build triggers that only run when backend files change.

---

## 🎯 Problem

Currently, ANY push triggers Cloud Build, even frontend-only changes. This wastes build time and resources.

## ✅ Solution

Configure triggers with `includedFiles` patterns to only watch the `backend/` directory.

---

## 🚀 Setup via gcloud CLI (Recommended)

### Step 1: Connect GitHub Repository

```bash
# Check if repository is already connected
gcloud builds repositories list \
  --project=help-me-clean-486919 \
  --region=europe-central2
```

If not connected, connect via Cloud Console:
https://console.cloud.google.com/cloud-build/triggers/connect?project=help-me-clean-486919

1. Click "Connect Repository"
2. Select GitHub
3. Authenticate and select: **CleanBuddy/help-me-clean**
4. Click "Connect"

### Step 2: Create Development Trigger

```bash
gcloud builds triggers create github \
  --name="backend-dev-trigger" \
  --project=help-me-clean-486919 \
  --region=europe-central2 \
  --repo-name="help-me-clean" \
  --repo-owner="CleanBuddy" \
  --branch-pattern="^development$" \
  --build-config="backend/cloudbuild.yaml" \
  --included-files="backend/**" \
  --description="Deploy backend to dev environment (triggers only on backend/ changes)"
```

**Key flags:**
- `--branch-pattern="^development$"` - Only the development branch
- `--build-config="backend/cloudbuild.yaml"` - Path to build config
- `--included-files="backend/**"` - **ONLY trigger on backend/ changes**

### Step 3: Create Production Trigger

```bash
gcloud builds triggers create github \
  --name="backend-prod-trigger" \
  --project=help-me-clean-486919 \
  --region=europe-central2 \
  --repo-name="help-me-clean" \
  --repo-owner="CleanBuddy" \
  --branch-pattern="^main$" \
  --build-config="backend/cloudbuild-prod.yaml" \
  --included-files="backend/**" \
  --description="Deploy backend to prod environment (triggers only on backend/ changes)"
```

### Step 4: Verify Triggers

```bash
# List all triggers
gcloud builds triggers list \
  --project=help-me-clean-486919 \
  --region=europe-central2

# Describe specific trigger
gcloud builds triggers describe backend-dev-trigger \
  --project=help-me-clean-486919 \
  --region=europe-central2 \
  --format=yaml
```

---

## 🌐 Setup via Cloud Console (Alternative)

### Step 1: Go to Cloud Build Triggers

Open: https://console.cloud.google.com/cloud-build/triggers?project=help-me-clean-486919

### Step 2: Connect Repository

1. Click **"Connect Repository"**
2. Select **GitHub**
3. Authenticate and select **CleanBuddy/help-me-clean**
4. Click **"Connect"**

### Step 3: Create Development Trigger

1. Click **"Create Trigger"**
2. Configure:
   ```
   Name:              backend-dev-trigger
   Description:       Deploy backend to dev (triggers only on backend/ changes)

   Event:             Push to a branch
   Repository:        CleanBuddy/help-me-clean
   Branch:            ^development$

   Configuration:     Cloud Build configuration file (yaml or json)
   Location:          backend/cloudbuild.yaml

   Filters (IMPORTANT):
   ✓ Included files:  backend/**
   ```
3. Click **"Create"**

### Step 4: Create Production Trigger

Same steps, but use:
```
Name:              backend-prod-trigger
Branch:            ^main$
Location:          backend/cloudbuild-prod.yaml
Included files:    backend/**
```

---

## 🧪 Testing

### Test 1: Frontend Change (Should NOT Trigger)

```bash
# Make a frontend-only change
cd web/packages/client-web
echo "// test" >> src/App.tsx

git add .
git commit -m "test: frontend only change"
git push origin development

# Check Cloud Build - should NOT trigger a build
# URL: https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919
```

**Expected:** No backend build triggered

### Test 2: Backend Change (Should Trigger)

```bash
# Make a backend change
cd backend
echo "// test" >> cmd/server/main.go

git add .
git commit -m "test: backend change"
git push origin development

# Check Cloud Build - SHOULD trigger a build
```

**Expected:** Backend build triggered, deploys to helpmeclean-backend-dev

### Test 3: Both Changes (Should Trigger)

```bash
# Make changes to both
echo "// test" >> backend/cmd/server/main.go
echo "// test" >> web/packages/client-web/src/App.tsx

git add .
git commit -m "test: both frontend and backend changes"
git push origin development

# Check Cloud Build - SHOULD trigger (because backend/ changed)
```

**Expected:** Backend build triggered (includedFiles matches backend/**)

---

## 📊 Monitor Builds

### View Trigger History

```bash
# List recent builds for a trigger
gcloud builds list \
  --project=help-me-clean-486919 \
  --region=europe-central2 \
  --filter="trigger_id=backend-dev-trigger" \
  --limit=10
```

### View Build Logs

Cloud Console: https://console.cloud.google.com/cloud-build/builds?project=help-me-clean-486919

---

## 🔧 Update Existing Triggers

If you already have triggers set up without path filtering:

```bash
# Update development trigger
gcloud builds triggers update backend-dev-trigger \
  --project=help-me-clean-486919 \
  --region=europe-central2 \
  --included-files="backend/**"

# Update production trigger
gcloud builds triggers update backend-prod-trigger \
  --project=help-me-clean-486919 \
  --region=europe-central2 \
  --included-files="backend/**"
```

---

## 🗑️ Delete Triggers (If Needed)

```bash
# Delete development trigger
gcloud builds triggers delete backend-dev-trigger \
  --project=help-me-clean-486919 \
  --region=europe-central2

# Delete production trigger
gcloud builds triggers delete backend-prod-trigger \
  --project=help-me-clean-486919 \
  --region=europe-central2
```

---

## 📋 Pattern Syntax

The `includedFiles` pattern uses glob syntax:

| Pattern | Matches |
|---------|---------|
| `backend/**` | All files in backend/ (any depth) |
| `backend/*.go` | Only .go files in backend/ root |
| `backend/**/*.go` | All .go files in backend/ (any depth) |
| `*.md` | All .md files in repo root |

You can also use `ignoredFiles` to exclude files:

```bash
--ignored-files="**/*.md,**/*.txt"
```

---

## ⚠️ Important Notes

1. **GitHub Connection Required**: You must connect your GitHub repository first
2. **Path Relative to Root**: Patterns are relative to repository root
3. **Multiple Patterns**: Use comma-separated list: `"backend/**,Dockerfile"`
4. **Regex Branch Names**: Use `^main$` not just `main` to avoid matching `main-test`
5. **Regional Triggers**: Must match Cloud Run region (europe-central2)

---

## ✅ Benefits

After setup:
- ✅ Frontend changes don't trigger backend builds
- ✅ Saves build minutes and time
- ✅ Faster development workflow
- ✅ Clearer build history (only relevant builds)
- ✅ Backend changes still auto-deploy

---

## 🔄 Rollback Plan

If path filtering causes issues:

```bash
# Remove filtering (triggers on all changes again)
gcloud builds triggers update backend-dev-trigger \
  --project=help-me-clean-486919 \
  --region=europe-central2 \
  --clear-included-files

gcloud builds triggers update backend-prod-trigger \
  --project=help-me-clean-486919 \
  --region=europe-central2 \
  --clear-included-files
```

---

## 🎉 Result

Now you can work on frontend code without triggering unnecessary backend builds!

```
Push to development → frontend change only → ✅ No backend build
Push to development → backend change → ✅ Backend build triggered
Push to main → frontend change only → ✅ No backend build
Push to main → backend change → ✅ Backend build triggered
```
