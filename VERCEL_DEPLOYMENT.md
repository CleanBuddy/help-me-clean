# Vercel Deployment Guide - HelpMeClean Web App

## 🎯 Overview

Deploy the unified React app (handles all user types: client, cleaner, company, admin) to Vercel.

---

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Go to Vercel

Open: https://vercel.com/new

### Step 2: Import Repository

1. Click **"Import Git Repository"**
2. Select **CleanBuddy/help-me-clean**
3. Click **"Import"**

### Step 3: Configure Project

```yaml
Project Name:     helpmeclean
Root Directory:   web/packages/client-web
Framework:        Vite
Build Command:    npm run build
Output Directory: dist
Install Command:  npm install
```

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

#### Development Environment
```
VITE_GRAPHQL_ENDPOINT=https://helpmeclean-backend-dev-hkunbdxbkq-lm.a.run.app/graphql
VITE_GOOGLE_CLIENT_ID=794597417467-hks5884pvd1ihthpoid6ad0nasanm459.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SzzgVAjjzKXeJfowxwRwJ6Pdt7VDf4E2XUqT69Fwo2li16by4RbGYMMp4KsiR46VmI7B2etnGS7rYesgtLHoj1M007Tomkwhv
```

#### Production Environment
```
VITE_GRAPHQL_ENDPOINT=https://helpmeclean-backend-prod-XXXXXXXXXX-lm.a.run.app/graphql
VITE_GOOGLE_CLIENT_ID=794597417467-hks5884pvd1ihthpoid6ad0nasanm459.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Step 5: Deploy!

Click **"Deploy"** → Wait 2-3 minutes → Done! 🎉

---

## 🌐 URLs After Deployment

**Development Preview:**
```
https://helpmeclean-git-development-cleanbuddy.vercel.app
```

**Production:**
```
https://helpmeclean.vercel.app
```

**Custom Domain (after DNS setup):**
```
https://helpmeclean.ro
```

---

## 🔄 Automated Deployments

After initial setup:

```bash
# Deploy to preview
git push origin development
# → Auto-deploys to preview URL

# Deploy to production
git checkout main
git merge development
git push origin main
# → Auto-deploys to production URL
```

---

## 📱 All User Types in One App

The app automatically routes to the correct dashboard:

```
/                   → Public homepage
/booking            → Guest booking flow
/login              → Login page
/client/*           → Client dashboard
/cleaner/*          → Cleaner dashboard
/company/*          → Company dashboard
/admin/*            → Admin dashboard
```

All users access the same domain!

---

## 🔧 Update Backend URL Later

When you deploy production backend:

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Update `VITE_GRAPHQL_ENDPOINT` for production
3. Trigger redeployment (push or manual redeploy)

---

## 💰 Cost

**Vercel Hobby (Free):**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Preview deployments
- ✅ Auto SSL
- ✅ Global CDN

**Cost: $0/month** (plenty for MVP!)

---

## 🎨 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Project → Settings → Domains
2. Add `helpmeclean.ro`
3. Vercel gives you DNS records

### Step 2: Update DNS

Add these records at your domain registrar:

```
Type  Name  Value
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

### Step 3: Wait for DNS Propagation (5-30 min)

Vercel automatically provisions SSL certificate.

---

## 📊 Monitor Deployment

### View Logs

Vercel Dashboard → Project → Deployments → Click deployment → View logs

### View Analytics

Vercel Dashboard → Project → Analytics

---

## 🔄 Environment-Based Routing

The app uses:
- **Development branch** → Preview URL (uses dev backend)
- **Main branch** → Production URL (uses prod backend)

Environment variables are automatically selected based on the branch!

---

## 🚨 Troubleshooting

### Build Fails

**Check build logs** in Vercel dashboard.

Common issues:
- Missing environment variables
- TypeScript errors
- Dependency issues

Fix: Update environment variables or fix code, push again.

### 404 on Routes

The `vercel.json` file has rewrite rules for SPA routing.

If you get 404s, ensure `vercel.json` is committed.

### API Connection Issues

Check:
1. Backend is running: https://helpmeclean-backend-dev-hkunbdxbkq-lm.a.run.app/graphql
2. CORS is configured correctly in backend
3. Environment variable `VITE_GRAPHQL_ENDPOINT` is correct

---

## ✅ Post-Deployment Checklist

- [ ] Verify homepage loads
- [ ] Test booking flow (guest)
- [ ] Test login (Google OAuth)
- [ ] Test client dashboard
- [ ] Test cleaner dashboard
- [ ] Test company dashboard
- [ ] Test admin dashboard
- [ ] Verify GraphQL connection
- [ ] Test on mobile
- [ ] Check performance (Lighthouse)

---

## 🎉 You're Live!

Your app is now:
- ✅ Deployed on Vercel (free!)
- ✅ Connected to GCP backend
- ✅ Auto-deploying on push
- ✅ Globally distributed via CDN
- ✅ SSL enabled
- ✅ All user types supported

**Ready for investor demo!** 🚀
