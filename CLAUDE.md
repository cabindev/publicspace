# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Healthy Public Spaces** (`healthy-public-spaces`) — Next.js 15 app (App Router) in Thai.
Repo: https://github.com/cabindev/publicspace · Production: https://healthypublicspaces.com

## Tech stack

- **Next.js** 15 (App Router, Webpack) + **React** 18 + **TypeScript** 5
- **Supabase** as the only backend, via `@supabase/supabase-js` (JS client only — **no Prisma, no ORM, no direct `DATABASE_URL`**)
- **Tailwind CSS** 3
- **Node 26** required (see below)

## Structure

- `app/` — pages (`page.tsx` per route: home, healthy, dashboard, register, login, reports, auth/callback) and API routes under `app/api/` (`upload`, `reports`, `reports/[id]`, `user/role`)
- `lib/supabase/client.ts` — Supabase client factory (reads env, has hardcoded fallbacks to the publishable key)
- `lib/` — `auth.ts`, `env-validation.ts`, `imageUtils.ts`
- `server.js` — custom HTTP server used for Plesk deployment
- `app/layout.tsx` — root layout (`<html lang="th" suppressHydrationWarning>` — the suppress is needed because browser extensions mutate `<html>` and cause hydration warnings)

## Environment variables

Single **`.env`** file (gitignored — never commit; do not create `.env.local`). The app reads exactly **3** vars:

| Var | Notes |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | holds the **publishable** key (`sb_publishable_…`) — new-style key, public by design |
| `SUPABASE_SERVICE_ROLE_KEY` | holds the **secret** key (`sb_secret_…`) — server-only, never expose |

Uses Supabase's new-style API keys (`sb_publishable_` / `sb_secret_`), not the legacy `service_role` JWT.
There is **no** `DATABASE_URL` / `DIRECT_URL` — the app never connects to Postgres directly.

## Node version

Node **26** is required and pinned three ways (keep them in sync):

- `.node-version` → `26` — used by **nodenv** (the Plesk deploy server). Required, or npm postinstall scripts fail with `nodenv: node: command not found`.
- `.nvmrc` → `26.3.0` — used by **nvm** for local dev (`nvm use`).
- `package.json` `engines.node` → `>=26.0.0`.

## Deployment

Deployed on **Plesk** at `healthypublicspaces.com`, served via `server.js`. Plesk uses `nodenv`; the Node version must be set to 26 in the Plesk Node.js panel and matched by `.node-version`.

## Conventions

- Before any `git push`, scan tracked files for leaked secrets (`sb_secret_`, raw `service_role` JWTs). The publishable key and project ref are public and safe to commit; the secret key must only live in `.env`.
