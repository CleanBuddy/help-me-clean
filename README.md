# HelpMeClean.ro MVP

Romania's first "Uber for cleaning" marketplace.

## Quick Start

### Prerequisites

- Go 1.22+
- Node.js 20+
- PostgreSQL 16
- Xcode (for iOS development)
- Android Studio (for Android development)

### Setup

1. **Clone & Install**

```bash
git clone <repo>
cd help-me-clean

# Backend
cd backend
make install
cp .env.example .env
# Edit .env with your credentials

# Web
cd ../web
npm install

# Mobile
cd ../mobile
npm install
```

2. **Database Setup**

```bash
# Start PostgreSQL (via Docker or local)
docker-compose up -d postgres

# Run migrations
cd backend
make migrate-up
```

3. **Generate Code**

```bash
# Backend
cd backend
make generate

# Web
cd ../web
npm run codegen
```

4. **Start Development Servers**

```bash
# Terminal 1: Backend
cd backend
make run

# Terminal 2: Web apps
cd web
npm run dev

# Terminal 3: Mobile apps
cd mobile
npm start
```

5. **Access Apps**

- Backend GraphQL Playground: http://localhost:8080/graphql
- Client Web: http://localhost:3000
- Company Dashboard: http://localhost:3001
- Admin Dashboard: http://localhost:3002
- Mobile: Scan QR code in Expo Go app

### iOS Development

```bash
cd ios
pod install
open HelpMeClean.xcworkspace
# Build & Run in Xcode
```

## Project Structure

```
help-me-clean/
├── backend/          # Go monolith (GraphQL + WebSocket)
├── web/              # Turborepo: 3 React apps
│   └── packages/
│       ├── client-web/          # Client booking app (:3000)
│       ├── company-dashboard/   # Company management (:3001)
│       ├── admin-dashboard/     # Platform admin (:3002)
│       └── shared/              # Shared GraphQL, Apollo, components
├── mobile/           # Turborepo: 2 Expo apps
│   └── packages/
│       ├── cleaner-app/         # Cleaner job management
│       ├── company-app/         # Company mobile dashboard
│       └── shared/              # Shared GraphQL, theme, utils
├── ios/              # SwiftUI native client app
├── CLAUDE.md         # AI development guide
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go + gqlgen + sqlc + PostgreSQL |
| Web | React + TypeScript + Vite + Shadcn/ui + TailwindCSS |
| Mobile | React Native (Expo) + NativeWind |
| iOS | SwiftUI + Apollo iOS |

## Documentation

- [CLAUDE.md](./CLAUDE.md) - AI development guide & agent assignments
- [help_me_clean.pdf](./help_me_clean.pdf) - Full MVP specification
