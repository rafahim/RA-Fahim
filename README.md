# RA Fahim — 3D Creator Portfolio (Next.js)

A full-stack portfolio site with a public 3D-creator showcase and a
Supabase-backed admin panel, built with **Next.js (App Router)**,
**TypeScript**, **Tailwind CSS**, **Framer Motion**, **Supabase**, and
**Cloudinary**.

> This project was migrated from a Vite + React SPA to Next.js. The
> public design, all animations, and every admin feature were preserved
> — only the framework, routing, and auth plumbing changed. See
> `MIGRATION_REPORT.md` for the full list of what changed and why.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS**
- **Framer Motion** for animations
- **Supabase** (Postgres + Auth) via `@supabase/ssr`
- **Cloudinary** for image hosting (signed uploads, admin-only deletes)
- **Vercel** for hosting

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | Where it's used | Safe in browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes (RLS enforces access) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin verification (`/api/cloudinary/*`, middleware) | **No — server only** |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Signing uploads server-side | **No — server only** |
| `CLOUDINARY_API_SECRET` | Signing uploads server-side | **No — server only** |

Only variables prefixed `NEXT_PUBLIC_` are ever sent to the browser —
that's a Next.js guarantee. Everything else stays on the server.

### 3. Supabase setup

This app expects the **existing** Supabase project/database to already
have the schema in `supabase/migrations/`. If you're pointing at a fresh
project, apply those migrations (via the Supabase SQL editor or CLI) and
make sure Row Level Security policies are in place before going live.

An admin user must exist in the `admin_users` table (referencing a real
Supabase Auth user) to be able to sign in to `/admin`.

### 4. Cloudinary setup

No new Cloudinary account is needed — this app signs uploads and deletes
server-side using `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`, so any
existing Cloudinary account works as long as the cloud name and keys are
set correctly.

### 5. Local development

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the admin panel.

### 6. Production build

```bash
npm run build
npm start
```

## Project structure

```
app/                    Next.js App Router routes
  page.tsx              Public homepage
  admin/                 Admin routes (login, dashboard, projects, etc.)
  api/cloudinary/        Route Handlers for signed uploads + deletes
components/             Shared UI (buttons, inputs, toasts, animations)
sections/                Public homepage sections (Hero, About, Projects...)
admin/                   Admin-only layout, pages, and feature components
lib/                     Supabase browser/server clients, env helpers
lib/server/              Server-only helpers (Cloudinary signing, admin auth)
services/                Typed Supabase data-access functions
hooks/                   Data-fetching and auth hooks
types/                   Shared TypeScript types (incl. generated DB types)
supabase/migrations/     SQL migrations for the existing database schema
middleware.ts            Refreshes the Supabase session + guards /admin/*
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it in Vercel.
3. Add the environment variables from the table above in the Vercel
   project settings (Production + Preview).
4. Deploy — Vercel auto-detects Next.js, no extra configuration needed.

Every route (including `/admin/projects/[id]/edit`) works on direct
load/refresh since routing is handled natively by the App Router — no
SPA-fallback rewrites are required.

## Admin login

Admin accounts are provisioned directly in the database
(`admin_users` table referencing a Supabase Auth user) — there is no
public sign-up flow. To create the first admin:

1. Create a user in Supabase Auth (dashboard or `supabase.auth.admin.createUser`).
2. Insert a row into `admin_users` with that user's `id`.
3. Sign in at `/admin/login`.
