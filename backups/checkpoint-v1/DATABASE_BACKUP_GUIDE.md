# Datenbank-Backup — Anleitung

## Option A: Supabase Dashboard (einfach)

1. Supabase Dashboard öffnen → dein Projekt
2. **Database** → **Backups** (je nach Plan: tägliche Backups)
3. Bei Bedarf: **Point-in-time Recovery** oder manuellen Dump anfordern

## Option B: pg_dump (vollständig, für Entwickler)

Voraussetzung: Connection String aus Supabase → Settings → Database.

```bash
# Schema only
pg_dump "$DATABASE_URL" --schema-only --no-owner -f schema-backup.sql

# Daten only (ohne Schema)
pg_dump "$DATABASE_URL" --data-only --no-owner -f data-backup.sql

# Alles
pg_dump "$DATABASE_URL" --no-owner -f full-backup.sql
```

`DATABASE_URL` = `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

## Option C: Projekt-Migrationen (Schema-Rekonstruktion)

Das Repository enthält idempotente Migrationen in `supabase/migrations/`.  
Reihenfolge: Dateinamen sortiert (20260703 → 20260713).

Für **neues** Projekt reicht: alle `.sql` Dateien der Reihe nach im SQL Editor ausführen.

## Option D: Export-Skripte (Anwendungsdaten)

```bash
node scripts/export-cms.mjs > cms-export.json
node scripts/export-crm.mjs > crm-export.json
```

## Wichtige Tabellen (Priorität bei Backup)

| Priorität | Tabellen |
|-----------|----------|
| Kritisch | `crm_customers`, `crm_quotes`, `crm_invoices`, `booking_requests`, `site_settings` |
| Hoch | `cms_services`, `gallery_images`, `cms_posts`, `cms_faqs`, `reviews`, `team_members` |
| Mittel | `admin_users`, `page_views`, `admin_audit_logs` |
| Niedrig | `admin_sessions`, `admin_login_history` (können neu entstehen) |

## Was nicht exportieren

- `password_hash`, `totp_secret`, `token_hash` — nur in sicherem verschlüsselten Backup, nie öffentlich teilen
