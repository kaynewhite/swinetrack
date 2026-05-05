# SwineTrack — Farm-to-Market Swine Traceability System

## Project Overview
Full PERN stack (PostgreSQL/Neon + Express + React + Node.js) swine health traceability system for Laguna Province, Philippines. Features ARIMA + Random Forest predictive analytics, rule-based prescriptive recommendations, and role-based dashboards.

## Architecture

### Frontend (`frontend/`)
- React 18 + Vite + TypeScript + Tailwind CSS
- Clerk React SDK for authentication
- React Router v6 for routing
- Recharts for data visualization
- Framer Motion for animations
- Port: **5000**

### Backend (`backend/`)
- Express + TypeScript
- Clerk Express SDK middleware (JWT verification)
- pg (node-postgres) connected to Neon PostgreSQL
- ARIMA time-series forecasting engine
- Random Forest ensemble classifier
- Rule-based prescriptive analytics engine
- Port: **3001**
- Frontend Vite proxies `/api` → `localhost:3001`

## Authentication
- Uses Clerk (CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY secrets)
- After Clerk sign-in, user syncs to `users` table via `POST /api/users/sync`
- JWT Bearer token required on all protected routes
- `VITE_CLERK_PUBLISHABLE_KEY` is injected at runtime in the workflow command

## Database
- Neon PostgreSQL (NEON_DATABASE_URL secret — has `//` prefix, fixed in pool.ts)
- Schema auto-created on backend startup via `createSchema()`
- Tables: users, farms, disease_reports, forecasts, recommendations, permits, model_training_data, supply_data

## Roles & Routes
| Role | Login Route | Dashboard | Notes |
|------|------------|-----------|-------|
| Farm Owner | /farm-login, /farm-signup | /farm/* | Clerk-based auth |
| MAO Admin | /mao-login | /mao/* | Clerk-based auth |
| Veterinarian | /vet-login, /vet-signup | /vet/* | Clerk-based auth |
| PAO Monitor | /PAO-login (hidden) | /pao/* | Clerk-based auth, seeded DB account |

## Seeded Accounts
- **PAO**: `pao@swinetrack.laguna.gov.ph` (DB record only, sign in via Clerk at /PAO-login)

## Workflow
Single "Start application" workflow runs both services:
```
bash -c 'cd backend && npm run dev &' && cd frontend && VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY npm run dev
```

## Features Built
- ✅ Landing page with hero, features, role portals, stats
- ✅ Separate login/signup pages per role
- ✅ Farm Owner: Dashboard, Farm Registration, Disease Reporting, Map View, Permits, Profile
- ✅ MAO: Dashboard, Farm Management, Disease Cases, Map Monitoring, Permit Management, Prescriptive System (run ARIMA+RF forecast), Reports & Analytics, Training Data Input
- ✅ PAO: Dashboard, Supply Monitoring, Disease Overview, Map Monitoring, Reports
- ✅ Veterinarian: Dashboard, Field Inspections
- ✅ ARIMA (p=2,d=1,q=2) forecasting engine
- ✅ Random Forest ensemble disease risk classifier
- ✅ Rule-based prescriptive recommendations engine
- ✅ Full REST API with Clerk JWT auth on all protected endpoints

## Key Files
- `frontend/src/App.tsx` — all routes
- `frontend/src/main.tsx` — Clerk provider + BrowserRouter
- `frontend/src/lib/api.ts` — API client with Bearer token
- `frontend/src/lib/constants.ts` — municipalities, disease lists
- `frontend/src/components/shared/DashboardLayout.tsx` — sidebar layout
- `backend/src/index.ts` — Express entry + route mounting
- `backend/src/db/schema.ts` — full DB schema (auto-created)
- `backend/src/db/seed.ts` — PAO account seed
- `backend/src/analytics/arima.ts` — ARIMA implementation
- `backend/src/analytics/randomForest.ts` — RF classifier
- `backend/src/analytics/prescriptive.ts` — rule-based engine
- `backend/src/middleware/auth.ts` — Clerk middleware + requireRole

## Environment Variables / Secrets
- `CLERK_PUBLISHABLE_KEY` — Clerk publishable key (secret)
- `CLERK_SECRET_KEY` — Clerk secret key (secret)
- `NEON_DATABASE_URL` — Neon PostgreSQL connection string (secret, starts with `//`, fixed in pool.ts)
- `PORT` — 3001 (shared env var)
- `NODE_ENV` — development (shared env var)
