# AI News Aggregation & Broadcasting Dashboard

A powerful, full-stack Next.js web application that automatically collects, deduplicates, and summarizes the latest AI news from across the internet (OpenAI, Google AI, TechCrunch, arXiv, etc.).

It features an intelligent backend built directly into Next.js API Routes, driven by a PostgreSQL database, and uses **Google Gemini** for AI summarization and social media broadcasting format generation.

## Features
- **Automated RSS/API Ingestion:** Pulls from 21+ configurable sources.
- **Smart Deduplication:** Avoids redundant news articles using cryptographic fingerprinting and semantic text similarity detection.
- **Gemini AI Summarization:** Automatically reads long articles and shrinks them down into bite-sized summaries.
- **Broadcast System:** Takes your favorite articles and automatically formats them for LinkedIn, Email Newsletters, WhatsApp, and Blogs.
- **Vercel & Render Ready:** Runs natively as a Next.js Full Stack Monorepo.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- A PostgreSQL Database (like a free tier from Neon.tech)
- Google Gemini API Key

### 2. Environment Variables
Create a new file named `.env.local` in the root folder of this repository, and add exactly two keys:
```env
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
GEMINI_API_KEY="your_google_gemini_api_key"
```

### 3. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard!

*(Note: The first time you run this, you will need to execute the schema migrations on your Postgres database to create the `sources`, `news_items`, and `favorites` tables).*

---

## 🌐 Deployment Instructions

This repository is pre-configured to be deployed as a monolithic full-stack app. **You do not need to split up the frontend and backend.**

### Option A: Deploy to Vercel (Recommended)
Vercel is the creator of Next.js and the absolute easiest way to host this.
1. Push this repository to GitHub.
2. In the Vercel Dashboard, click **Add New Project** and import your repository.
3. Leave "Root Directory" empty.
4. Go to the "Environment Variables" tab and paste your `DATABASE_URL` and `GEMINI_API_KEY`.
5. Click **Deploy**.

### Option B: Deploy to Render (Web Service)
If you prefer Render, you must deploy this as a **Web Service** (not a Static Site).
1. In the Render Dashboard, click **New > Web Service**.
2. Connect your GitHub repository.
3. Settings:
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Node` *(Render usually detects this automatically)*
   - **Build Command:** `npm run build` *(Render usually detects this automatically)*
   - **Start Command:** `npm start` *(Render usually detects this automatically)*
4. Under Environment variables, add `DATABASE_URL` and `GEMINI_API_KEY`.
5. Click **Create Web Service**.
