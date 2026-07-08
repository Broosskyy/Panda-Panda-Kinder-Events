# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is

`panda-bande-kinderevents` is a **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4** application: a German public marketing/booking website for a kids-events business, plus an `/admin` CMS/CRM (bookings, quotes, invoices, reviews, email, users with mandatory 2FA). Persistence is **Supabase** (self-hosted stack locally); transactional email is **Resend**. There is no separate backend — everything runs inside the Next.js app (RSC + API routes under `src/app/api`).

Package manager is **npm** (`package-lock.json`). The startup update script runs `npm ci`.

### Standard commands (see `package.json`)

- Dev server: `npm run dev` → http://localhost:3000 (env changes require a restart; Next.js does not hot-reload `.env.local`).
- Lint: `npm run lint` · Types: `npm run typecheck` · Build: `npm run build`.
- `npm run build` runs a `prebuild` that regenerates favicons/PWA icons from `public/assets/Logo.png` (`scripts/generate-brand-assets.mjs`); output is deterministic and already committed.
- Node script test harnesses exist under `scripts/` (e.g. `npm run test:crm`); there is no unit-test framework wired up.

### Environment variables

Local config lives in `.env.local` (gitignored, so it is NOT in the repo — it persists only via the VM snapshot). See `.env.example` for the full list. The app **degrades gracefully**: with no Supabase/Resend it serves the public site from static fallbacks, but the booking form (`/api/inquiry`) returns 503 and `/admin` login returns 503 (needs the `admin_users` table). For real end-to-end work, run local Supabase (below).

### Local Supabase (required for booking persistence + admin)

Docker (with `fuse-overlayfs` storage driver + legacy iptables) and the `supabase` CLI are preinstalled in the VM snapshot but are **services that do not auto-start**. To bring the stack up:

1. Start Docker if not running: `sudo dockerd` (run it in a background/tmux session; it does not run as a systemd service here).
2. Start Supabase from the repo root: `sudo supabase start` (API on `http://127.0.0.1:54321`, Postgres on `54322`, Studio on `54323`). Keys via `sudo supabase status -o env` — the local `ANON_KEY`/`SERVICE_ROLE_KEY` are the fixed Supabase demo JWTs and are already wired into `.env.local`.

**Non-obvious DB gotchas:**

- Migrations in `supabase/migrations/` use 8-digit date prefixes (e.g. `20260703_...`), NOT the CLI's 14-digit `YYYYMMDDHHMMSS` format, so `supabase start` / `supabase db reset` will not apply them cleanly. Apply the schema manually against the local DB in this order: first `supabase/schema.sql` (creates the base `booking_requests` / `reviews` tables), then every file in `supabase/migrations/` in sorted filename order, e.g. `docker exec -i supabase_db_workspace psql -U postgres -d postgres -v ON_ERROR_STOP=1 < <file>`.
- Because the SQL is applied as the `postgres` superuser, the PostgREST roles get **no grants**, so inserts fail with `42501 permission denied for table ...` (surfaces as a 500 from `/api/inquiry`). After applying SQL, grant them and reload PostgREST:
  ```sql
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
  NOTIFY pgrst, 'reload schema';
  ```
- The booking form has an anti-spam guard: the form must be open ≥3s before submit (`_formLoadedAt`), and `privacy: true` is required.

### Admin area

`/admin` needs Supabase and a bootstrapped first admin user (create via the on-screen setup wizard). 2FA (TOTP) is mandatory for all admin users, so admin login is a multi-step flow — plan for that when testing admin features. The legacy `ADMIN_PASSWORD` cookie login is deprecated/unused.
