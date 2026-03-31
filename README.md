# CalBuddy

AI-powered academic planner for UC Berkeley students. Syncs your Canvas assignments, breaks them into focused tasks, and schedules them across your week — all pushed to Google Calendar.

---

## Overview

CalBuddy connects to bCourses (Canvas LMS), uses Claude AI to decompose assignments into execution-ready subtasks, and gives you a drag-and-drop weekly calendar with Google Calendar sync. Built specifically for Berkeley undergrads and grad students juggling multiple courses.

---

## Core Features

- **Canvas Sync** — imports all upcoming assignments from bCourses via your personal access token
- **AI Decomposition** — Claude Haiku breaks each assignment into categorized subtasks (readings, problem sets, discussions, pre-class work) with time estimates
- **Weekly Workspace** — drag-and-drop scheduler with time slots across the full week
- **Google Calendar Sync** — pushes scheduled tasks directly to your Google Calendar
- **Background Sync** — daily async sync via Upstash QStash; no page reload required
- **Settings** — manage your Canvas token, sync preferences, and task scheduling preferences

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite 6, React 18, React Router 7 |
| UI | Radix UI / shadcn, Tailwind CSS, Framer Motion |
| Auth | Supabase Google OAuth (provider token used for GCal) |
| Database | Supabase Postgres (RLS-enforced) |
| API | Vercel Serverless Functions (`api/`) |
| Queue | Upstash QStash (async Canvas sync jobs) |
| AI | Anthropic Claude Haiku |
| Deployment | Vercel |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/calbuddy.git
cd calbuddy
npm install
```

### 2. Supabase + Vercel integration

Use the [Vercel–Supabase integration](https://vercel.com/integrations/supabase) — it automatically injects `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into your project. No manual copy-paste needed.

Then run the database schema:

```bash
# In the Supabase SQL editor, run:
supabase/schema.sql
```

### 3. Add remaining environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `QSTASH_TOKEN` | [console.upstash.com/qstash](https://console.upstash.com/qstash) |
| `QSTASH_CURRENT_SIGNING_KEY` | same dashboard |
| `QSTASH_NEXT_SIGNING_KEY` | same dashboard |
| `CANVAS_WEBHOOK_SECRET` | any random string — used to verify Canvas webhook calls |

> Canvas personal access tokens are **per-user** — students enter their own token in the Settings page. There is no shared server-side Canvas token.

### 4. Google OAuth (via Supabase)

In **Supabase Dashboard → Authentication → Providers → Google**:

1. Enable Google provider
2. Add Client ID + Client Secret from [Google Cloud Console](https://console.cloud.google.com/)
3. Add OAuth scope: `https://www.googleapis.com/auth/calendar`
4. Add redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

In **Google Cloud Console → APIs → OAuth consent screen**, add scope:
`https://www.googleapis.com/auth/calendar.events`

### 5. Run locally

```bash
npm run dev
```

---

## Privacy

- Canvas tokens are stored encrypted in Supabase (`profiles.canvas_api_token`), scoped per user, and never logged
- Assignment data is sent to Anthropic for AI enrichment — content is not retained by Anthropic beyond the request
- Google Calendar access uses the OAuth provider token from your session — CalBuddy cannot read your existing calendar events, only write new ones
- All database rows are protected by Row Level Security — users can only access their own data

---

## Project Structure

```
api/                    Vercel serverless functions
  canvas/sync.ts        Enqueues a QStash sync job for the user
  qstash.ts             QStash receiver — runs the full Canvas → AI → DB pipeline
  webhooks/canvas.ts    Canvas webhook handler

src/
  app/
    pages/              Route-level components (Landing, Sync, Calendar, etc.)
    components/         Shared UI components
    context/            AuthContext (Supabase session + provider token)
  lib/
    canvas/client.ts    Paginated Canvas API client
    ai/anthropic.ts     Claude Haiku enrichment pipeline
    qstash/client.ts    QStash job enqueue helper
    database.ts         Supabase query helpers
    types.ts            Shared TypeScript types

supabase/
  schema.sql            Full database schema with RLS policies
```

---

## Deployment

Push to GitHub and connect to Vercel. With the Supabase integration active, all database environment variables are injected automatically. Add the remaining variables (Anthropic, QStash) in the Vercel project dashboard under **Settings → Environment Variables**.
