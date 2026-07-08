# Admin Dashboard V2 Report

**Date:** 2026-07-08  
**Branch:** `cursor/admin-dashboard-v2-e022`

## Summary

Dashboard redesigned for a compact, personal, enterprise-style admin experience — inspired by Stripe, Notion, Linear, and Vercel.

## What Changed

### 1. Hero
- Avatar initials, name, role from session (`AdminSessionProvider`)
- Last login, session duration, last activity from server (`admin_users` + `admin_sessions`)
- Skeleton until identity is ready — no placeholder names

### 2. Status chips (max 4)
- System status, open leads, open invoices, new reviews, email test mode
- Semantic colors: green / yellow / red / blue / gray

### 3. Help
- Long role hints moved into collapsible **„Hilfe & Einführung“** accordion (closed by default)

### 4. Heute wichtig (max 5 cards)
- Live data: inquiries, invoices, reviews, leads, system warnings
- Permission-filtered, no dummy counts

### 5. Schnellaktionen
- Fixed set: Anfrage, Kunde, Angebot, Rechnung, Galerie, Website
- **Alle Module** → `/admin/module`

### 6. Favorites (per user)
- **Anpassen** mode: pin + reorder today cards and quick actions
- Saved server-side via `PUT /api/admin/dashboard/preferences` (`admin_security_settings`)

### 7. Statistik
- Compact responsive grid (2–3 columns): visitors, inquiries, quotes, invoices, reviews, customers

### 8. Aktivitäten
- Last 5 items only
- **Alle Aktivitäten anzeigen** → audit log (if `audit:read`)

### 9. Floating button
- Hidden on `/admin` and `/admin/module` (quick actions on dashboard instead)

### 10. Module
- Removed from dashboard
- New page: `/admin/module`

### 11–16. UX / Performance
- Modular widget components under `components/admin/dashboard/`
- `dash-v2-*` CSS in `globals.css`
- Mobile bottom padding for nav safe area
- No identity flash (session skeleton first)

## Architecture

```
DashboardViewV2
├── DashboardHero
├── DashboardStatusChips
├── DashboardHelpAccordion
├── DashboardTodaySection
├── DashboardQuickActionsSection
├── DashboardStatsGrid
└── DashboardActivitySection

API: GET /api/admin/dashboard → { v2, preferences }
API: PUT /api/admin/dashboard/preferences
```

## Files

| Area | Path |
|------|------|
| Main view | `components/admin/dashboard/DashboardViewV2.tsx` |
| Builders | `lib/admin/dashboard-v2/build-payload.ts` |
| Preferences | `lib/admin/dashboard-preferences.ts` |
| Modules page | `src/app/admin/module/page.tsx` |
| Styles | `src/app/globals.css` (dash-v2 section) |

## Verification

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Follow-up (prepared, not in scope)

- Drag & drop widget reorder
- Hide/show individual widgets via `hiddenWidgets` preference
- Dedicated „all activity“ feed page (currently audit log link)
