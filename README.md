# AI News Aggregation & Broadcasting Dashboard (MVP)

Version 1.1 · Author: Shrashti Singhal · Culinda

## 🚀 Features
- **Smart Aggregation**: Fetches from 20+ high-signal AI sources (OpenAI, Google, arXiv, etc.).
- **Deduplication**: Fingerprint and semantic similarity check to keep your feed clean.
- **AI-Powered Insights**: Uses **Gemini 2.0 Flash Lite** for automatic summarization.
- **Broadcast Suite**: One-click sharing to LinkedIn, Email, WhatsApp, Blog, and Newsletter.
- **Admin Control**: Manual refresh and source management dashboard.
- **Persistent Storage**: Neon Postgres integration for all news and favorites.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, TypeScript.
- **Backend**: Node.js, Express, TypeScript, `node --watch` for development.
- **AI**: Google Generative AI (Gemini 2.0 Flash Lite).
- **Database**: Neon (PostgreSQL).

## Architecture
- Ingestion Layer: [sources.ts](file:///d:/ai%20news/backend/src/ingest/sources.ts) + [fetcher.ts](file:///d:/ai%20news/backend/src/ingest/fetcher.ts)
- Processing: normalization + fingerprint-based dedup
- Database: [001_init.sql](file:///d:/ai%20news/backend/src/migrations/001_init.sql)
- API Server: [server.ts](file:///d:/ai%20news/backend/src/server.ts)
- Dashboard UI: [page.tsx](file:///d:/ai%20news/frontend/src/app/page.tsx), [favorites/page.tsx](file:///d:/ai%20news/frontend/src/app/favorites/page.tsx)

Flow:
Sources → Fetcher → Normalize/Dedup → Postgres → API → Dashboard → Broadcast Logs

## Database Schema
- sources(id, name, url, type, active)
- news_items(id, source_id, title, summary, url, published_at, tags, is_duplicate, fingerprint, created_at)
- users(id, name, email, role)
- favorites(id, user_id, news_item_id, created_at)
- broadcast_logs(id, favorite_id, platform, status, timestamp)

Migration script: run `npm run migrate` in backend after DB is up.

## Endpoints (Backend)
- POST /ingest → fetch all sources and upsert news
- GET /news?q=...&source=... → list latest items
- POST /favorites/:newsId → save favorite (user_id=1)
- DELETE /favorites/:newsId → remove favorite
- GET /favorites → list favorites
- POST /broadcast/:favoriteId { platform } → simulate broadcast, logs it

## Getting Started (Docker)
Prereqs: Docker Desktop
1. docker compose up -d --build
2. Apply migration: `docker compose exec backend npm run migrate`
3. Open http://localhost:3000
4. Use Refresh on Feed to ingest; Favorite and broadcast in Favorites

## Getting Started (Local Dev)
1. Start Postgres locally (user: postgres, pass: postgres, db: ainews)
2. Backend:
   - cd backend
   - set DATABASE_URL=postgres://postgres:postgres@localhost:5432/ainews
   - npm run migrate
   - npm run dev
3. Frontend:
   - cd frontend
   - set NEXT_PUBLIC_API_URL=http://localhost:4000
   - npm run dev

## Deployment
- Dockerfiles included for backend and frontend
- Compose maps ports: 3000 (frontend), 4000 (backend), 5432 (db)
- Can be adapted to Render/Fly.io/AWS; use managed Postgres and set DATABASE_URL

## Notes
- Dedup heuristic: sha256 of normalized title + hostname
- Broadcast simulated with audit log writes; integrate real APIs later
- Admin panel optional; extensible via /ingest and sources registry
