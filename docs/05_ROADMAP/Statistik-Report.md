# Statistik-Report — Admin Dashboard (Sprint B2)

**Datum:** 2026-07-03  
**Branch:** `cursor/admin-stats-e022`  
**Version:** 0.8.2

---

## Ziel

Im Admin-Dashboard wichtige Kennzahlen zu Besuchern, Seitenaufrufen und CMS-Daten anzeigen — datenschutzfreundlich und ohne bestehende Funktionen zu beeinträchtigen.

---

## Vercel Analytics — Prüfung

| Kriterium | Ergebnis |
|-----------|----------|
| Paket `@vercel/analytics` installiert | ❌ Nein |
| Nur auf Vercel-Hosting nutzbar | ⚠️ Ja |
| Programmatische API fürs eigene Admin-Dashboard | ❌ Eingeschränkt |
| Cookie-frei / vollständige Datenkontrolle | ❌ Externer Dienst |

**Entscheidung:** Eigenes anonymes Tracking über Supabase — volle Kontrolle, DSGVO-freundlicher, funktioniert unabhängig vom Hoster.

> Kein Google Analytics. Keine externen Tracking-Dienste.

---

## Technische Umsetzung

### Datenbank
Migration: `supabase/migrations/20260703_page_views_analytics.sql`

Tabelle `page_views`:
- `id`, `created_at`, `path`, `referrer`, `user_agent`, `device_type`, `session_id`
- **Keine IP-Adresse**
- RLS: kein öffentlicher DB-Zugriff

SQL-Funktionen:
- `analytics_distinct_sessions` — Besucher zählen
- `analytics_page_view_count` — Seitenaufrufe
- `analytics_daily_stats` — Diagramme 7/30 Tage
- `analytics_top_pages` — meistbesuchte Seiten

### Tracking
- Client: `PageViewTracker` (sessionStorage, **kein Cookie**)
- API: `POST /api/track` (serverseitig, anonymisiert)
- Admin- und API-Pfade werden **nicht** getrackt
- Deduplizierung: gleiche Seite max. 1× pro 30 Sekunden

### Admin Dashboard
Neue Kennzahlen:
- Gesamtbesucher, heute, 7 Tage, 30 Tage
- Seitenaufrufe gesamt, heute, 7/30 Tage
- Balkendiagramme 7 und 30 Tage
- Tabelle meistbesuchte Seiten
- Anfragen gesamt / neu / bestätigt
- Bewertungen gesamt / offen / freigegeben
- Galerie-Bilder und Beiträge gesamt

---

## Datenschutz

| Aspekt | Umsetzung |
|--------|-----------|
| IP-Adresse | ❌ wird nicht gespeichert |
| Cookies | ❌ keine Tracking-Cookies |
| Session-ID | Zufällige UUID in `sessionStorage` (nur Sitzung) |
| Personenbezug | Kein Name, keine E-Mail, kein Login-Tracking |
| Referrer | Nur Pfad, keine Query-Parameter |
| User-Agent | Auf 120 Zeichen gekürzt |
| Admin-Bereich | Wird nicht getrackt |

### Rechtlicher Hinweis
Das Tracking ist **anonymisiert und cookie-frei**. Trotzdem empfiehlt sich ein kurzer Hinweis in der Datenschutzerklärung, z. B.:

> „Wir erfassen anonymisierte Nutzungsstatistiken (besuchte Seiten, Gerätetyp), um unsere Website zu verbessern. Es werden keine IP-Adressen gespeichert und keine Tracking-Cookies gesetzt.“

**Kein Cookie-Banner erforderlich**, solange keine Cookies/LocalStorage für Tracking über die technisch notwendige Session hinaus gesetzt werden. `sessionStorage` für eine anonyme Session-ID ist nach aktueller Praxis oft als technisch notwendig einstufbar — bei Unsicherheit Rechtsberatung einholen.

---

## Deployment

1. Migration in Supabase SQL Editor ausführen
2. Deploy — Tracking startet automatisch auf öffentlichen Seiten
3. Admin → Dashboard zeigt Statistiken nach ersten Besuchen

---

## Download

| Format | Link |
|--------|------|
| **PDF** | [Statistik-Report.pdf](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/cursor/admin-stats-e022/public/downloads/sprint-reports/Statistik-Report.pdf) |
| **Markdown** | [Statistik-Report.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/cursor/admin-stats-e022/docs/05_ROADMAP/Statistik-Report.md) |
