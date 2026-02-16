# GCP Secret Manager - Naming Convention

**Last Updated:** February 16, 2026
**Purpose:** Document consistent secret naming pattern for all environments

---

## Naming Convention

All secrets in GCP Secret Manager follow this pattern:

```
{environment}_{variable_name}
```

- **Development:** `dev_{variable_name}`
- **Production:** `prod_{variable_name}`

The variable name in the code (Go backend) uses the **unprefixed** name.

---

## Example

### In GCP Secret Manager:

**Development:**
```
dev_rate_limit_per_minute     → value: "200"
dev_cookie_domain             → value: ""
dev_database_url              → value: "postgresql://..."
```

**Production:**
```
prod_rate_limit_per_minute    → value: "100"
prod_cookie_domain            → value: ".helpmeclean.ro"
prod_database_url             → value: "postgresql://..."
```

### In Cloud Run Deployment:

```bash
# Development
--set-secrets "RATE_LIMIT_PER_MINUTE=dev_rate_limit_per_minute:latest"

# Production
--set-secrets "RATE_LIMIT_PER_MINUTE=prod_rate_limit_per_minute:latest"
```

### In Go Code:

```go
// Code uses unprefixed name - works for both dev and prod
limitPerMinute := os.Getenv("RATE_LIMIT_PER_MINUTE")
```

---

## All Secret Names

### Security Configuration (NEW - Phase 1-4)

| Environment Variable | Dev Secret | Prod Secret | Default Value |
|---------------------|------------|-------------|---------------|
| `ENVIRONMENT` | `dev_environment` | `prod_environment` | `development` / `production` |
| `PORT` | `dev_port` | `prod_port` | `8080` |
| `COOKIE_DOMAIN` | `dev_cookie_domain` | `prod_cookie_domain` | `` / `.helpmeclean.ro` |
| `RATE_LIMIT_PER_MINUTE` | `dev_rate_limit_per_minute` | `prod_rate_limit_per_minute` | `200` / `100` |
| `RATE_LIMIT_STRICT_PER_MINUTE` | `dev_rate_limit_strict_per_minute` | `prod_rate_limit_strict_per_minute` | `50` / `10` |
| `GRAPHQL_MAX_DEPTH` | `dev_graphql_max_depth` | `prod_graphql_max_depth` | `10` |
| `GRAPHQL_MAX_COMPLEXITY` | `dev_graphql_max_complexity` | `prod_graphql_max_complexity` | `100` |
| `MAX_FILE_SIZE` | `dev_max_file_size` | `prod_max_file_size` | `10485760` |
| `ERROR_STRICT_MODE` | `dev_error_strict_mode` | `prod_error_strict_mode` | `false` |

### Database

| Environment Variable | Dev Secret | Prod Secret |
|---------------------|------------|-------------|
| `DATABASE_URL` | `dev_database_url` | `prod_database_url` |

### Authentication

| Environment Variable | Dev Secret | Prod Secret |
|---------------------|------------|-------------|
| `JWT_SECRET` | `dev_jwt_secret` | `prod_jwt_secret` |
| `JWT_EXPIRY` | `dev_jwt_expiry` | `prod_jwt_expiry` |
| `GOOGLE_CLIENT_ID` | `dev_google_client_id` | `prod_google_client_id` |
| `GOOGLE_CLIENT_ID_IOS` | `dev_google_client_id_ios` | `prod_google_client_id_ios` |
| `GOOGLE_CLIENT_ID_ANDROID` | `dev_google_client_id_android` | `prod_google_client_id_android` |

### Stripe

| Environment Variable | Dev Secret | Prod Secret |
|---------------------|------------|-------------|
| `STRIPE_SECRET_KEY` | `dev_stripe_secret_key` | `prod_stripe_secret_key` |
| `STRIPE_WEBHOOK_SECRET` | `dev_stripe_webhook_secret` | `prod_stripe_webhook_secret` |
| `STRIPE_PUBLISHABLE_KEY` | `dev_stripe_publishable_key` | `prod_stripe_publishable_key` |
| `STRIPE_CONNECT_RETURN_URL` | `dev_stripe_connect_return_url` | `prod_stripe_connect_return_url` |
| `STRIPE_CONNECT_REFRESH_URL` | `dev_stripe_connect_refresh_url` | `prod_stripe_connect_refresh_url` |

### Factureaza.ro

| Environment Variable | Dev Secret | Prod Secret |
|---------------------|------------|-------------|
| `FACTUREAZA_API_URL` | `dev_factureaza_api_url` | `prod_factureaza_api_url` |
| `FACTUREAZA_API_KEY` | `dev_factureaza_api_key` | `prod_factureaza_api_key` |

### Platform Legal Entity (Production only)

| Environment Variable | Prod Secret |
|---------------------|-------------|
| `PLATFORM_COMPANY_NAME` | `prod_platform_company_name` |
| `PLATFORM_CUI` | `prod_platform_cui` |
| `PLATFORM_REG_NUMBER` | `prod_platform_reg_number` |
| `PLATFORM_ADDRESS` | `prod_platform_address` |
| `PLATFORM_CITY` | `prod_platform_city` |
| `PLATFORM_COUNTY` | `prod_platform_county` |
| `PLATFORM_IS_VAT_PAYER` | `prod_platform_is_vat_payer` |
| `PLATFORM_BANK_NAME` | `prod_platform_bank_name` |
| `PLATFORM_IBAN` | `prod_platform_iban` |

### Storage & Services

| Environment Variable | Dev Secret | Prod Secret |
|---------------------|------------|-------------|
| `USE_LOCAL_STORAGE` | `dev_use_local_storage` | `prod_use_local_storage` |
| `GCS_BUCKET` | `dev_gcs_bucket` | `prod_gcs_bucket` |
| `GCS_PROJECT_ID` | `dev_gcs_project_id` | `prod_gcs_project_id` |
| `FIREBASE_PROJECT_ID` | `dev_firebase_project_id` | `prod_firebase_project_id` |

### CORS

| Environment Variable | Dev Secret | Prod Secret |
|---------------------|------------|-------------|
| `ALLOWED_ORIGINS` | `dev_allowed_origins` | `prod_allowed_origins` |

---

## Quick Setup

### 1. Create All Secrets (One-time Setup)

**Development:**
```bash
./setup-gcp-secrets-dev.sh
```

**Production:**
```bash
./setup-gcp-secrets-prod.sh
```

### 2. Grant Secret Access to Cloud Run

**Development:**
```bash
gcloud projects add-iam-policy-binding helpmeclean-dev \
  --member="serviceAccount:$(gcloud projects describe helpmeclean-dev --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Production:**
```bash
gcloud projects add-iam-policy-binding helpmeclean-prod \
  --member="serviceAccount:$(gcloud projects describe helpmeclean-prod --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy

**Development:**
```bash
./deploy-gcp-dev.sh
```

**Production:**
```bash
./deploy-gcp-prod.sh
```

---

## Managing Secrets

### View All Secrets

```bash
# Development
gcloud secrets list --project=helpmeclean-dev --filter="name:dev_*"

# Production
gcloud secrets list --project=helpmeclean-prod --filter="name:prod_*"
```

### Update a Secret

```bash
# Development
echo -n "new_value" | gcloud secrets versions add dev_rate_limit_per_minute --data-file=- --project=helpmeclean-dev

# Production
echo -n "new_value" | gcloud secrets versions add prod_rate_limit_per_minute --data-file=- --project=helpmeclean-prod
```

### View Secret Value

```bash
# Development
gcloud secrets versions access latest --secret=dev_rate_limit_per_minute --project=helpmeclean-dev

# Production
gcloud secrets versions access latest --secret=prod_rate_limit_per_minute --project=helpmeclean-prod
```

### Delete a Secret

```bash
# Development
gcloud secrets delete dev_old_secret --project=helpmeclean-dev

# Production
gcloud secrets delete prod_old_secret --project=helpmeclean-prod
```

---

## Benefits of This Approach

1. **Consistency:** All environments follow the same pattern
2. **Single Source of Truth:** All configuration in Secret Manager
3. **No Code Changes:** Update secrets without redeploying
4. **Security:** Secrets never in git or environment variables
5. **Audit Trail:** Secret Manager tracks all changes
6. **Easy Rollback:** Revert to previous secret version
7. **Separation:** Dev and prod secrets completely isolated

---

## Migration from Environment Variables

If you previously used `--set-env-vars`, migrate to secrets:

### Old Way (Environment Variables):
```bash
--set-env-vars "RATE_LIMIT_PER_MINUTE=100"
```

### New Way (Secrets):
```bash
# 1. Create secret
echo -n "100" | gcloud secrets create prod_rate_limit_per_minute --data-file=-

# 2. Use in deployment
--set-secrets "RATE_LIMIT_PER_MINUTE=prod_rate_limit_per_minute:latest"
```

---

## Secret Versioning

All secrets support versioning:

```bash
# Add new version
echo -n "new_value" | gcloud secrets versions add prod_rate_limit_per_minute --data-file=-

# List versions
gcloud secrets versions list prod_rate_limit_per_minute --project=helpmeclean-prod

# Access specific version
gcloud secrets versions access 2 --secret=prod_rate_limit_per_minute

# Use specific version in deployment (instead of :latest)
--set-secrets "RATE_LIMIT_PER_MINUTE=prod_rate_limit_per_minute:2"
```

---

## Troubleshooting

### Secret not found error

**Error:** `Secret [dev_rate_limit_per_minute] not found`

**Solution:**
```bash
# Verify secret exists
gcloud secrets list --project=helpmeclean-dev --filter="name:dev_rate_limit_per_minute"

# If not found, create it
./setup-gcp-secrets-dev.sh
```

### Permission denied error

**Error:** `Permission denied on secret`

**Solution:**
```bash
# Grant access to Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe helpmeclean-dev --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding dev_rate_limit_per_minute \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=helpmeclean-dev
```

---

**Last Updated:** February 16, 2026
**Related Documentation:**
- [GCP_ENVIRONMENT_VARIABLES.md](GCP_ENVIRONMENT_VARIABLES.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
