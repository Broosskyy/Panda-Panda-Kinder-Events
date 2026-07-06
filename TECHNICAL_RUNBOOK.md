# Technisches Runbook — Entwickler

**Panda-Bande · v1.0-checkpoint**

## Lokal starten

```bash
git clone <repo-url>
cd panda-bande-kinderevents
npm install
cp .env.example .env.local   # Werte eintragen
npm run dev                    # http://localhost:3000
```

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ja* | Supabase API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Ja* | Server-only DB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Client (wenig genutzt) |
| `RESEND_API_KEY` | Für E-Mail | Resend |
| `ADMIN_PASSWORD` | Legacy-Login | Bis erster `admin_users` |
| `NEXT_PUBLIC_SITE_URL` | Empfohlen | Passwort-Reset-Links |

\* Ohne Supabase: statische Fallbacks, kein CMS/CRM-Persistenz.

## Build & Qualität

```bash
npm run lint
npm run typecheck
npm run build
npm run test:crm
npm run export:cms    # JSON stdout
npm run export:crm
npm run live:verify   # gegen Produktion
```

## Deploy (Vercel)

1. Repo mit Vercel verbinden
2. Env Vars im Dashboard setzen (gleiche Namen wie `.env.local`)
3. Branch `main` → Production Deploy
4. Nach Deploy: `npm run live:verify` oder manuell `/admin` testen

## Supabase Migration

Neue Änderung: Datei `supabase/migrations/YYYYMMDD_beschreibung.sql`  
Idempotent schreiben (`IF NOT EXISTS`). In Supabase SQL Editor oder via CLI ausführen.

## Fehleranalyse

| Symptom | Prüfen |
|---------|--------|
| 500 auf Homepage | Server-Logs Vercel, `site_settings` Defaults |
| Admin 401 | Cookie, Session, `admin_users` |
| CMS speichert nicht | `SUPABASE_SERVICE_ROLE_KEY`, RLS |
| E-Mail fehlt | `RESEND_API_KEY`, Domain-Status in Admin |
| PDF leer | `lib/crm/pdf.ts`, Firmendaten in Einstellungen |

**Logs:** Vercel → Project → Logs (Functions). Lokal: Terminal bei `npm run dev`.

## Rollback

1. Vercel → Deployments → vorheriges Deployment → **Promote to Production**
2. DB: Supabase Backup restore oder Migration rückgängig (manuell, vorsichtig)

## Backup

- `backups/checkpoint-v1/`
- `npm run export:cms` / `export:crm`
- pg_dump (siehe DATABASE_BACKUP_GUIDE.md)

## Debugging Auth

- Legacy: Cookie `pb_admin_auth`, `ADMIN_PASSWORD`
- Multi-user: `pb_admin_session`, Tabellen `admin_sessions`, `admin_users`
- `GET /api/admin/login` → Session-Status JSON

## Architektur-Kurz

- Next.js 15 App Router, RSC + Client Components
- Alle DB-Zugriffe serverseitig via Service Role
- Admin UI: `AdminGate` → Views in `components/admin/views/`
- Permissions: `requireAdmin('permission:slug')` in API routes

## Häufige Fehler

- **Digest 1267400528:** RSC serialization — keine Funktionen/Icons an Client Components
- **Team 500:** Migration fehlt → `team_members` Tabelle
- **2FA legacy message:** Kein `admin_users` — Bootstrap oder Benutzer anlegen
