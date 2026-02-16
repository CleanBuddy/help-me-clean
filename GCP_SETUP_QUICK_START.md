# GCP Deployment Quick Start

## Non-Interactive Setup (Recommended for CI/CD)

### 1. Create Development Secrets File

```bash
cp .env.gcp-secrets-dev.example .env.gcp-secrets-dev
```

Edit `.env.gcp-secrets-dev` and fill in your actual development values:
- Database URL from Neon
- Google OAuth client IDs
- Stripe test keys
- Factureaza.ro sandbox API key

### 2. Create Production Secrets File

```bash
cp .env.gcp-secrets-prod.example .env.gcp-secrets-prod
```

Edit `.env.gcp-secrets-prod` and fill in your actual **production** values:
- Production database URL
- Production Google OAuth client IDs
- Stripe **LIVE** keys (sk_live_...)
- Factureaza.ro production API key
- Platform legal entity information

### 3. Authenticate with GCP

```bash
gcloud auth login
gcloud config set project help-me-clean
```

### 4. Run Non-Interactive Setup

**Development:**
```bash
./setup-gcp-secrets-dev-auto.sh
```

**Production:**
```bash
./setup-gcp-secrets-prod-auto.sh
```

### 5. Grant Secret Manager Access

```bash
PROJECT_NUMBER=$(gcloud projects describe help-me-clean --format='value(projectNumber)')
gcloud projects add-iam-policy-binding help-me-clean \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 6. Deploy Services

**Development:**
```bash
./deploy-gcp-dev.sh
```

**Production:**
```bash
./deploy-gcp-prod.sh
```

---

## Interactive Setup (Original Method)

If you prefer interactive prompts for each secret:

```bash
./setup-gcp-secrets-dev.sh   # Interactive development setup
./setup-gcp-secrets-prod.sh  # Interactive production setup
```

---

## Verify Deployment

```bash
# Get service URLs
gcloud run services describe helpmeclean-backend-dev --region europe-west1 --format='value(status.url)'
gcloud run services describe helpmeclean-backend-prod --region europe-west1 --format='value(status.url)'

# Test health endpoints
curl https://helpmeclean-backend-dev-xxxxx.run.app/health
curl https://helpmeclean-backend-prod-xxxxx.run.app/health
```

---

## Update a Secret

```bash
# Edit the .env file
vim .env.gcp-secrets-dev

# Re-run the setup script (only updates changed secrets)
./setup-gcp-secrets-dev-auto.sh

# Redeploy the service to pick up changes
./deploy-gcp-dev.sh
```

---

## Security Notes

- **Never commit** `.env.gcp-secrets-dev` or `.env.gcp-secrets-prod` to git
- Both files are in `.gitignore` for safety
- Use Stripe **test** keys for dev, **live** keys for prod
- JWT secrets are auto-generated if left empty
- Validate production secrets before running prod setup script

---

## Troubleshooting

### "Permission denied" error
Grant Secret Manager access (see step 5 above)

### "Secret already exists" warning
This is normal - the script updates existing secrets with new versions

### "gcloud not found"
Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install

### Production script fails with "TEST Stripe key"
The script validates that production uses live keys. Update `.env.gcp-secrets-prod` with `sk_live_...` keys.
