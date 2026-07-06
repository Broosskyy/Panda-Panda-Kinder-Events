# Projektstruktur — Panda-Bande

**Version:** v1.0-checkpoint

## Übersicht

```
panda-bande-kinderevents/
├── src/app/              # Seiten & API (Next.js App Router)
├── components/           # React-Komponenten (öffentlich + Admin)
├── lib/                  # Geschäftslogik, Datenbank-Zugriff
├── public/               # Statische Dateien (Logo, Bilder)
├── supabase/migrations/  # Datenbank-Schema (SQL)
├── scripts/              # Hilfsskripte (Test, Export)
├── backups/checkpoint-v1/ # Backup-Anleitungen
├── docs/                 # Historische Sprint-Dokumentation
└── *.md                  # Checkpoint- & Handbuch-Dateien (Root)
```

---

## `src/app/` — Seiten und APIs

| Pfad | Was | Anfassen wenn … |
|------|-----|-----------------|
| `page.tsx` | Startseite | Layout/Sektionen der Homepage |
| `layout.tsx` | Root-Layout, Fonts | Globales Seiten-Grundgerüst |
| `aktuelles/` | Blog/News | Beitrags-Routing |
| `impressum/`, `datenschutz/`, `agb/` | Rechtliches | Rechtstexte |
| `admin/` | Admin-UI-Seiten | Neue Admin-Bereiche |
| `api/` | Server-APIs | Neue Endpunkte, Auth |
| `middleware.ts` | Sicherheits-Header | CSP, Admin-Pfade |

**Nicht anfassen ohne Grund:** `globals.css` (Design-Tokens), `middleware.ts` (Sicherheit).

---

## `components/`

| Ordner | Inhalt | Wann anfassen? |
|--------|--------|----------------|
| `sections/` | Homepage-Abschnitte (Hero, FAQ, …) | Öffentliches Design/Layout |
| `layout/` | Header, Footer, Cookie-Banner | Navigation, Footer |
| `ui/` | Buttons, Cards, Formulare | Wiederverwendbare UI |
| `admin/views/` | Admin-Bildschirme | Admin-Funktionen erweitern |
| `admin/ui/` | Admin-Designsystem | Admin-Formulare |
| `analytics/` | Tracking | Besucherstatistik |

---

## `lib/` — Wichtigste Module

| Ordner/Datei | Zweck |
|--------------|--------|
| `cms/` | Website-Inhalte laden/speichern |
| `crm/` | Kunden, Angebote, Rechnungen, PDF |
| `auth/` | Login, 2FA, Rollen, Audit |
| `admin/` | Navigation, Dashboard-Helfer |
| `analytics/` | Seitenaufrufe auswerten |
| `email/` | Resend, Absender |
| `team/` | Öffentliches Team |
| `supabase/admin.ts` | Datenbank-Verbindung (Server) |
| `admin-route.ts` | API-Schutz (`requireAdmin`) |

**Vorsicht:** `auth/`, `admin-route.ts` — Sicherheitskritisch.

---

## `supabase/migrations/`

SQL-Dateien in **chronologischer Reihenfolge** (Dateiname).  
Neue DB-Änderungen: **neue** Migration anlegen, nicht alte ändern.

| Migration | Inhalt |
|-----------|--------|
| `20260703_cms_v080.sql` | CMS-Grundtabellen |
| `20260703_page_views_analytics.sql` | Analytics |
| `20260704_storage_buckets_public.sql` | Storage-Buckets |
| `20260707_crm_business.sql` | CRM |
| `20260708_team_members.sql` | Team |
| `20260712_security_admin_v1.sql` | Admin-Auth, Rollen |
| `20260713_team_users_cleanup.sql` | Team-Benutzer-Verknüpfung |

---

## `public/`

Statische Assets: Logo, Illustrationen, Sprint-PDFs.  
Wird direkt unter `/assets/...` ausgeliefert.

---

## `scripts/`

| Skript | Befehl |
|--------|--------|
| `crm-test.mjs` | `npm run test:crm` |
| `export-cms.mjs` | `npm run export:cms` |
| `export-crm.mjs` | `npm run export:crm` |
| `live-verify.mjs` | `npm run live:verify` |

---

## API-Routen (Auszug)

**Öffentlich:** `/api/inquiry`, `/api/reviews`, `/api/track`  
**Admin:** `/api/admin/*` (Login, CMS, CRM, Security) — siehe `TECHNICAL_RUNBOOK.md`

---

## Konfiguration

| Datei | Zweck |
|-------|--------|
| `.env.example` | Vorlage für Secrets |
| `next.config.ts` | Next.js |
| `tsconfig.json` | TypeScript-Pfade (`@/lib`, `@/components`) |
| `package.json` | Abhängigkeiten, Scripts |

---

## Was man besser nicht ändert

- Bestehende Migrationen (nur neue hinzufügen)
- `lib/auth/` ohne Sicherheitsreview
- Produktions-`.env` in Git
- `middleware.ts` CSP ohne Test
