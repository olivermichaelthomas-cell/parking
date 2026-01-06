# Mauritius Public Parking e-Coupon

A production-ready specification and starter implementation for replacing physical paper parking coupons in Mauritius with digital e-coupons. The project ships a mobile-first PWA (Next.js) plus a TypeScript/Express API with PostgreSQL, role-based access, audit trails for enforcement, and seed data for common roles/zones.

## Architecture

- **Frontend:** Next.js 14 (TypeScript) PWA-style UI with driver, officer, and admin flows.
- **Backend:** Express + TypeScript, JWT auth, Zod validation, PostgreSQL storage, notification sweep job, audit logs for officer lookups.
- **Database:** PostgreSQL with schema covering users, vehicles, zones, parking sessions, and officer lookups.
- **Deployment:** Docker Compose for local development; separate Dockerfiles for backend and frontend.

## Core Features

- Zone listing with pricing and enforcement limits (configurable via DB).
- Driver flow: add vehicle, start parking session, mock payment reference, view recent sessions.
- Officer portal: login and perform fast plate lookups with audit logging.
- Admin: basic CRUD to add zones via UI and API.
- Notification sweep: server logs reminders before expiry (configurable lead time).
- Validation: duration checks against max duration and enforcement windows; plate formatting and input validation via Zod.
- Seed data: Zone 1/2, admin (admin@parking.mu / AdminPass123!), officer (officer@parking.mu / OfficerPass123!).

## Running locally with Docker

1. Create `.env` files if needed (backend reads `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NOTIFICATION_MINUTES_BEFORE`). Defaults are set in `docker-compose.yml` for local use.
2. Build and start all services:
   ```bash
   docker-compose up --build
   ```
3. Backend available at http://localhost:3001, frontend at http://localhost:3000, Postgres at localhost:5432.

The backend container runs `npm run db:init` automatically to create tables and seed zones/admin/officer accounts.

## Running locally without Docker

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run db:init  # requires Postgres running with DATABASE_URL
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

## API Endpoints (MVP)

- `POST /auth/register`, `POST /auth/login`
- `GET /zones`
- `POST /vehicles`, `GET /vehicles` (auth)
- `POST /sessions/start`, `POST /sessions/extend`, `GET /sessions/mine` (auth)
- `GET /sessions/active?plate=XYZ` (officer/admin; logs officer_lookups)
- `POST /officer/lookups` (implicit via lookup endpoint)
- `POST /admin/zones`, `PUT /admin/zones/:id` (admin)

## Tests

Unit tests cover pricing and validity logic:
```bash
cd backend
npm test
```

## Project Structure

- `backend/` – Express API, services, DB scripts, Jest tests, Dockerfile
- `frontend/` – Next.js PWA, minimal mobile-first screens for drivers, officers, admins
- `docker-compose.yml` – local orchestration

## Roadmap / Next Steps

- Integrate real payment gateway and receipt delivery (email/SMS)
- Add push notifications and Service Worker for richer PWA offline behavior
- Improve officer experience with scan-ready interface and offline cache
- Add reporting dashboards for admins
