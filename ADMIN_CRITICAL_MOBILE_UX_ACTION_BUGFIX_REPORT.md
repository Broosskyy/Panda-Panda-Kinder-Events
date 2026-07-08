# Admin Critical Mobile UX + Action Bugfix Report

**Branch:** `cursor/admin-critical-mobile-ux-action-bugfix-e022`  
**Date:** 2026-07-08

## Summary

Targeted fixes for reported production issues — not general polish. Bookings can now be archived/deleted with audit logs, PWA install card is always visible when not installed, reviews use primary + Mehr actions, onboarding shows reliably, and mobile shell refinements applied.

---

## 1. Anfragen löschen / archivieren

### Root cause
- No `DELETE` or archive API on `/api/admin/bookings`
- No `inquiries:delete` permission
- UI had no action menu for archive/delete

### Implemented
- Migration `20260732_booking_archive_delete.sql`: `archived_at` column + `inquiries:delete` permission (Super Admin + Admin)
- `PATCH` with `action: "archive"` / `"unarchive"` — requires `inquiries:write`
- `DELETE` — requires `inquiries:delete`, blocked when customer/quotes/invoices linked
- Audit log: `archive`, `unarchive`, `update`, `delete` in area `inquiries`
- UI: `AdminActionMenu` per card — primary Kunde/Zum Kunden, Mehr: Öffnen, Archivieren, Löschen (red, confirmed)
- Linked delete message: *„Diese Anfrage ist verknüpft und kann nicht gelöscht werden. Bitte archiviere sie stattdessen.“*
- Compact mobile layout: meta grid, collapsible message/notes, archived view filter

**Files:** `src/app/api/admin/bookings/route.ts`, `lib/admin/booking-lifecycle.ts`, `components/admin/views/BookingsView.tsx`

---

## 2. PWA Install-Karte im Dashboard

### Root cause
Card returned `null` when `beforeinstallprompt` not fired and not iOS — invisible on most desktop/Android dev sessions.

### Implemented
- `showInstallCard = !installed && !dismissed` — always shown when not installed
- Fallback UI when prompt unavailable: Chrome ⋮ → App installieren + **Installationsstatus prüfen**
- `probePwaStatus()` logs: `beforeInstallPrompt`, `manifestLoaded`, `serviceWorkerActive`, `standalone`, `installPromptAvailable`
- Dismissible; re-open via Dashboard help footer or **Einstellungen → Admin-App installieren**

**Files:** `components/admin/AdminPwaProvider.tsx`, `DashboardPwaInstallCard.tsx`, `DashboardPwaInstallHint.tsx`, `SettingsView.tsx`

---

## 3. Bewertungen Button-Struktur

### Implemented
- Primary: **Antwort speichern** (if draft changed) or **Freigeben** (if pending)
- **Mehr** menu: Bearbeiten, Verifizieren/entfernen, Zurückziehen, Löschen (red + audit hint)
- Reply field collapsible; request-email block collapsed in `<details>`
- No more 4-button wall

**Files:** `components/admin/views/ReviewsView.tsx`

---

## 4. Mobile Navigation

- Increased `--admin-mobile-content-pad` (+ safe area)
- `admin-main` bottom padding increased
- Labels unchanged (`Angeb.` / `Rechn.`) with ellipsis + active indicator

---

## 5. Drawer kompakter

- `AdminIdentityPanel` compact mode in drawer
- Smaller avatar, email truncate, ID only in expandable `<details>`
- Tighter drawer nav link spacing

**Files:** `AdminIdentityPanel.tsx`, `AdminSidebar.tsx`, `globals.css`

---

## 6. Hilfetexte eingeklappt

- `AdminPageHelp`: collapsed label **„Hilfe anzeigen“** (not first bullet)
- Bewertungsanfrage + Erste Schritte tips in `<details>`

---

## 7. Formulare / Listen mobile

- Anfragen: compact meta, collapsible message/notes, actions in Mehr menu
- Bewertungen: see §3
- E-Mail placeholder help already collapsible + searchable (prior branch)

---

## 8. Onboarding / Tutorial

### Root cause
- API failure set `completed: true` (fail-closed) → wizard never opened
- DB column missing in some envs → API errors

### Implemented
- Client fallback steps via `getClientOnboardingSteps()` when API fails
- `admin_security_settings` fallback store if `onboarding_completed_at` column missing
- Role-specific tracks: Super Admin (9), Admin (7), Mitarbeiter (5), Nur Lesen (4)
- Auto-open when `completed === false`; restart in Einstellungen

**Files:** `lib/admin/onboarding.ts`, `lib/admin/onboarding-store.ts`, `AdminOnboardingProvider.tsx`

---

## Migrations

```sql
-- 20260732_booking_archive_delete.sql
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS archived_at timestamptz;
-- + inquiries:delete permission for administrator + manager
```

---

## Tests

```bash
npm run test:admin-critical-mobile   # 17 checks
npm run test:admin-mobile
npm run test:admin-real-mobile
npm run lint && npm run typecheck && npm run build
```

All passed.

## Viewports

Verified statically for 360 / 390 / 430 / 768px patterns. Manual browser check recommended for PWA `beforeinstallprompt` on Android Chrome.
