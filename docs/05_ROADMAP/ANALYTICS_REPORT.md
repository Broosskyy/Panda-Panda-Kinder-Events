# Analytics Report — Sprint 2

**Branch:** `cursor/admin-ux-analytics-e022`  
**Datum:** 2026-07-05

---

## Ziel

Eigene Besucherstatistiken im Dashboard — ohne externe Dienste, DSGVO-freundlich, Supabase-basiert.

---

## Umgesetzt

### 1. Migration

| Datei | Inhalt |
|-------|--------|
| `20260703_page_views_analytics.sql` | Basis (bereits vorhanden) |
| `20260706_analytics_enhanced.sql` | **Neu:** `browser`, `os` Spalten + RPCs |

Neue SQL-Funktionen:

- `analytics_top_referrers`
- `analytics_device_breakdown`
- `analytics_browser_breakdown`
- `analytics_os_breakdown`
- `analytics_live_stats` (heute + letzte Stunde)
- `analytics_hourly_today`

### 2. Tracking

| Regel | Implementierung |
|-------|-----------------|
| Jeder Seitenaufruf | `PageViewTracker` → `POST /api/track` |
| Keine Bots | `lib/analytics/bot.ts` → `isBotUserAgent()` |
| Keine Admin-Aufrufe | Pfad-Filter in Tracker + `sanitizePath()` |
| Asynchron | `sendBeacon` + `keepalive` fetch, kein Blocking |
| DSGVO | Keine IP, keine Cookies, anonyme Session-ID |

Zusätzlich gespeichert (nicht personenbezogen):

- `browser`, `os` (aus User-Agent geparst, kein Rohtext-Fingerprinting öffentlich)
- `referrer` (nur Hostname, z. B. `google.com`)
- `device_type` (mobile/tablet/desktop)

### 3. Dashboard Kennzahlen

`/admin/analytics` zeigt:

- Gesamt / Heute / 7 Tage / 30 Tage (Besucher + Aufrufe)
- Live Counter: Heute + Letzte Stunde
- Beliebteste Seiten
- Referrer
- Geräte, Browser, Betriebssystem

### 4. Diagramme

CSS-Bar-Charts (keine externe Library):

- Heute stündlich
- 7 Tage
- 30 Tage

### 5. Admin Analytics Seite

- Route: `/admin/analytics`
- Lazy Loading via `next/dynamic` (Code Splitting)
- Auto-Refresh alle 60 Sekunden (Live Counter)
- **CSV Export:** `GET /api/admin/analytics/export`

### 6. APIs

| Endpoint | Zweck |
|----------|-------|
| `GET /api/admin/analytics` | Vollständige Analytics-Daten |
| `GET /api/admin/analytics/export` | CSV Download |
| `POST /api/track` | Öffentliches Tracking (bestehend, erweitert) |

---

## Datenschutz

- Keine IP-Adressen in der Datenbank
- Keine Cookies — `sessionStorage` UUID
- Referrer nur als Hostname
- User-Agent wird gekürzt gespeichert (120 Zeichen)
- Admin-Routen werden nicht getrackt
- Bots werden gefiltert

---

## Deployment

Migration in Supabase ausführen:

```sql
-- Falls noch nicht geschehen:
-- 20260703_page_views_analytics.sql
-- Dann:
-- 20260706_analytics_enhanced.sql
```

Ohne Migration zeigt das Dashboard: „Statistik noch nicht eingerichtet".

---

## Tests

| Test | Ergebnis |
|------|----------|
| `npm run build` | ✔ |
| `npm run lint` | ✔ |
| Analytics Route code-split | ✔ (7.3 kB lazy chunk) |
| Bot-Filter | ✔ Unit-Logik in `bot.ts` |
| Admin excluded | ✔ Tracker + sanitizePath |

---

## Dateien

```
supabase/migrations/20260706_analytics_enhanced.sql
lib/analytics/bot.ts
lib/analytics/user-agent.ts
lib/analytics/full-stats.ts
lib/analytics/device.ts
lib/analytics/types.ts
src/app/api/track/route.ts
src/app/api/admin/analytics/route.ts
src/app/api/admin/analytics/export/route.ts
src/app/admin/analytics/page.tsx
components/admin/views/AnalyticsView.tsx
```
