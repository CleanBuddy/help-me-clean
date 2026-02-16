# Google Cloud Storage Setup Guide

This guide documents the required GCS configuration for the HelpMeClean.ro asset upload system.

## Prerequisites

- GCP project created (`helpmeclean-dev` for dev, `helpmeclean-prod` for production)
- Cloud Run service deployed
- Cloud Build enabled
- Secret Manager enabled

## 1. Create GCS Buckets

### Development Bucket
```bash
gsutil mb -p helpmeclean-dev -l europe-central2 gs://helpmeclean-dev-uploads

# Configure lifecycle (optional - auto-delete temp files after 24h)
cat > lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 1,
          "matchesPrefix": ["uploads/temp/"]
        }
      }
    ]
  }
}
EOF
gsutil lifecycle set lifecycle.json gs://helpmeclean-dev-uploads
```

### Production Bucket
```bash
gsutil mb -p helpmeclean-prod -l europe-central2 gs://helpmeclean-prod-uploads

# Configure lifecycle
gsutil lifecycle set lifecycle.json gs://helpmeclean-prod-uploads
```

## 2. Configure CORS (for direct uploads from frontend)

```bash
cat > cors.json <<EOF
[
  {
    "origin": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://helpmeclean.ro", "https://dashboard.helpmeclean.ro", "https://admin.helpmeclean.ro"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply to dev bucket
gsutil cors set cors.json gs://helpmeclean-dev-uploads

# Apply to prod bucket
gsutil cors set cors.json gs://helpmeclean-prod-uploads
```

## 3. Set IAM Permissions

### Get Service Account Emails

```bash
# Cloud Run service account (for file uploads)
DEV_SERVICE_ACCOUNT=$(gcloud run services describe helpmeclean-backend-dev --region=europe-central2 --format='value(spec.template.spec.serviceAccountName)' --project=helpmeclean-dev)
PROD_SERVICE_ACCOUNT=$(gcloud run services describe helpmeclean-backend-prod --region=europe-central2 --format='value(spec.template.spec.serviceAccountName)' --project=helpmeclean-prod)

# Cloud Build service account (for deployment)
PROJECT_NUMBER_DEV=$(gcloud projects describe helpmeclean-dev --format='value(projectNumber)')
PROJECT_NUMBER_PROD=$(gcloud projects describe helpmeclean-prod --format='value(projectNumber)')
CLOUDBUILD_SA_DEV=${PROJECT_NUMBER_DEV}@cloudbuild.gserviceaccount.com
CLOUDBUILD_SA_PROD=${PROJECT_NUMBER_PROD}@cloudbuild.gserviceaccount.com
```

### Grant Storage Permissions (Development)

```bash
# Cloud Run service account needs object admin for uploads
gsutil iam ch serviceAccount:${DEV_SERVICE_ACCOUNT}:roles/storage.objectAdmin gs://helpmeclean-dev-uploads

# Cloud Build service account needs object admin for deployment verification
gsutil iam ch serviceAccount:${CLOUDBUILD_SA_DEV}:roles/storage.objectAdmin gs://helpmeclean-dev-uploads
```

### Grant Storage Permissions (Production)

```bash
# Cloud Run service account needs object admin for uploads
gsutil iam ch serviceAccount:${PROD_SERVICE_ACCOUNT}:roles/storage.objectAdmin gs://helpmeclean-prod-uploads

# Cloud Build service account needs object admin for deployment verification
gsutil iam ch serviceAccount:${CLOUDBUILD_SA_PROD}:roles/storage.objectAdmin gs://helpmeclean-prod-uploads
```

## 4. Create Secret Manager Secrets

### Development Secrets

```bash
# GCS_BUCKET secret
echo -n "helpmeclean-dev-uploads" | gcloud secrets create dev_GCS_BUCKET \
  --data-file=- \
  --replication-policy=automatic \
  --project=helpmeclean-dev

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding dev_GCS_BUCKET \
  --member=serviceAccount:${DEV_SERVICE_ACCOUNT} \
  --role=roles/secretmanager.secretAccessor \
  --project=helpmeclean-dev
```

### Production Secrets

```bash
# GCS_BUCKET secret
echo -n "helpmeclean-prod-uploads" | gcloud secrets create prod_GCS_BUCKET \
  --data-file=- \
  --replication-policy=automatic \
  --project=helpmeclean-prod

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding prod_GCS_BUCKET \
  --member=serviceAccount:${PROD_SERVICE_ACCOUNT} \
  --role=roles/secretmanager.secretAccessor \
  --project=helpmeclean-prod
```

## 5. Verify Configuration

### Test Bucket Access

```bash
# Test dev bucket
echo "test" | gsutil cp - gs://helpmeclean-dev-uploads/test.txt
gsutil ls gs://helpmeclean-dev-uploads/
gsutil rm gs://helpmeclean-dev-uploads/test.txt

# Test prod bucket
echo "test" | gsutil cp - gs://helpmeclean-prod-uploads/test.txt
gsutil ls gs://helpmeclean-prod-uploads/
gsutil rm gs://helpmeclean-prod-uploads/test.txt
```

### Verify Secret Access

```bash
# Verify dev secret
gcloud secrets versions access latest --secret=dev_GCS_BUCKET --project=helpmeclean-dev

# Verify prod secret
gcloud secrets versions access latest --secret=prod_GCS_BUCKET --project=helpmeclean-prod
```

## 6. Environment Variables in Cloud Run

The following environment variables are automatically configured via cloudbuild.yaml:

- `ENVIRONMENT`: "dev" or "production"
- `GCS_PROJECT_ID`: Set to `${PROJECT_ID}` (automatic)
- `GCS_BUCKET`: Loaded from Secret Manager (`dev_GCS_BUCKET` or `prod_GCS_BUCKET`)
- `GOOGLE_APPLICATION_CREDENTIALS`: Not needed (uses Workload Identity)

## Storage Structure

Files are organized in the GCS buckets as follows:

```
gs://helpmeclean-{env}-uploads/
├── uploads/
│   ├── clients/
│   │   └── {userId}/
│   │       └── avatars/
│   │           └── {uuid}_{filename}  # Public read
│   ├── companies/
│   │   └── {companyId}/
│   │       ├── logos/
│   │       │   └── {uuid}_{filename}  # Public read
│   │       └── documents/
│   │           └── {uuid}_{filename}  # Private, signed URLs
│   ├── cleaners/
│   │   └── {cleanerId}/
│   │       ├── avatars/
│   │       │   └── {uuid}_{filename}  # Public read
│   │       └── documents/
│   │           └── {uuid}_{filename}  # Private, signed URLs
│   └── temp/                          # Auto-delete after 24h
```

## Access Control

- **Public files** (avatars, logos): Object ACL set to `allUsers:READER`
- **Private files** (documents): No public ACL, access via signed URLs (1-hour expiration)

## Troubleshooting

### Permission Denied Errors

If you encounter permission errors:

1. Verify service account has `roles/storage.objectAdmin`:
   ```bash
   gsutil iam get gs://helpmeclean-dev-uploads
   ```

2. Check Cloud Run service account:
   ```bash
   gcloud run services describe helpmeclean-backend-dev --region=europe-central2 --format='value(spec.template.spec.serviceAccountName)'
   ```

3. Verify secret access:
   ```bash
   gcloud secrets get-iam-policy dev_GCS_BUCKET
   ```

### CORS Errors

If frontend uploads fail with CORS errors:

1. Verify CORS configuration:
   ```bash
   gsutil cors get gs://helpmeclean-dev-uploads
   ```

2. Update CORS with correct origins:
   ```bash
   gsutil cors set cors.json gs://helpmeclean-dev-uploads
   ```

### File Not Found Errors

If uploaded files return 404:

1. Check if file exists:
   ```bash
   gsutil ls -r gs://helpmeclean-dev-uploads/uploads/
   ```

2. Verify public ACL for public files:
   ```bash
   gsutil acl get gs://helpmeclean-dev-uploads/uploads/clients/{userId}/avatars/{file}
   ```

3. For private files, ensure using signed URLs:
   - Check backend logs for signed URL generation
   - Verify URL hasn't expired (1-hour TTL)

## Next Steps

After completing this setup:

1. Deploy backend with Cloud Build (automatically uses GCS)
2. Test avatar upload from frontend profile pages
3. Verify public URLs work for avatars/logos
4. Test document upload and signed URL generation
5. Implement Cloud Function for image optimization (see CLOUD_FUNCTION_SETUP.md)
