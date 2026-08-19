# Rental Depot — Web

A rental lease property application: an applicant-facing front end (browse, apply, upload, sign, track) and an operator-facing admin dashboard (triage, screen, decide, manage), built as one product on a shared data contract.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** with the "Rental Depot / Almanac" design tokens
- **Prisma → PostgreSQL (Neon.tech)** — wired in Phase 6
- **Cloudinary** for document/image hosting — wired in Phase 7
- Deploys to **Netlify** from GitHub

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values (already provided locally)
npm run dev                  # http://localhost:3000
```

## Project structure

```
src/
  app/                 # routes (applicant, admin, and /api/v1 endpoints)
    api/v1/            # versioned HTTP API — the contract for web + future mobile
  components/          # ui/ (design system), applicant/, admin/, layout/
  lib/
    types/             # THE DATA CONTRACT (entities + enums)
    data/              # DataStore interface (mock now, Prisma in Phase 6)
    mock/              # typed seed data + mock store
    api/               # response envelope + typed client
    money.ts           # money formatting (integer minor units)
```

## Architecture notes

- **API-first / mobile-ready.** All data access flows through the `DataStore`
  interface. Route handlers under `app/api/v1/*` expose it over HTTP for client
  components and the future mobile app. Server components read the store directly
  (no HTTP hop). Swapping the mock store for Prisma in Phase 6 changes no route
  handler and no API shape.
- **One data contract.** `src/lib/types` is the single source of truth; the
  Prisma schema is generated to match it.
- **Money** is integer minor units (centavos) + currency, never floats.
- **Compliance by design.** Consent, audit trail, and fair-housing-safe filtering
  are modelled from the start.

## Build phases

See `../../5 - Documentation/BUILD_PLAN.md`. This repo is Phase 0 (foundation).
