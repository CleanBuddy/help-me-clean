# Quick Start - HelpMeClean.ro

Get started with local development in minutes!

## Prerequisites

- Go 1.22+
- Node.js 18+
- PostgreSQL or Neon database URL

## 1. Clone & Setup

```bash
git clone <repo-url>
cd help-me-clean
```

## 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Update .env with your database URL and API keys
# Storage automatically uses ./uploads for local dev

# Run migrations
make migrate-up

# Start backend
make run
```

You should see:
```
📁 Using local file storage: ./uploads
💡 Set GOOGLE_APPLICATION_CREDENTIALS to use GCS instead
Server running on http://localhost:8080
```

## 3. Web Setup

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Web platform will be available at: **http://localhost:3000**

## 4. Access the Platform

- **Client:** http://localhost:3000
- **Company:** http://localhost:3000/firma
- **Admin:** http://localhost:3000/admin
- **GraphQL:** http://localhost:8080/query

## File Storage

**Local Development:** Files are stored in `backend/uploads/` and served at `/uploads/*`

**Production:** Automatically uses Google Cloud Storage (configured via environment variables)

## Next Steps

- See [CLAUDE.md](CLAUDE.md) for development guidelines
- See [README.md](README.md) for architecture details
- Run tests: `cd backend && make test` or `cd web && npm test`

That's it! You're ready to develop! 🚀
