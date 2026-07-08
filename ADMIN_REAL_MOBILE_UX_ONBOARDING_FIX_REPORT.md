# Admin Real Mobile UX + Onboarding Fix Report

**Branch:** `cursor/admin-real-mobile-ux-onboarding-e022`  
**Date:** 2026-07-08

## Summary

Concrete mobile UX fixes across the Panda-Bande admin — not cosmetic polish. Content is no longer clipped by the bottom nav, wide tables are replaced with cards on mobile, CRM action walls are consolidated, help text is collapsed by default, and a role-based onboarding wizard runs after first login.

## 1. Mobile Bottom Navigation

- Increased `--admin-bottom-nav-height` and `--admin-mobile-content-pad` for reliable scroll padding at 360/390/430px.
- `admin-main` bottom padding increased so list ends stay readable above the nav.
- Bottom nav visually lighter (smaller shadow, compact labels).
- Active tab: accent color + top indicator bar; labels use ellipsis without clipping.
- Modal/onboarding overlays use `var(--admin-mobile-content-pad)` instead of hardcoded `6rem`.

**Files:** `src/app/globals.css`, `components/admin/AdminSidebar.tsx`

## 2. Floating Action Button

- Unchanged from prior branch: FAB remains **hidden on mobile** (`hidden md:flex`) and **dashboard-only** on desktop.
- No content overlap on mobile list/detail/form pages.

**Files:** `components/admin/AdminQuickActions.tsx`

## 3. Help Boxes

- `AdminPageHelp`: collapsed state shows **one short help line** (first bullet); full list only on expand.
- Page descriptions and “Sichtbar” hints hidden on small screens to save vertical space.
- `ErsteSchritteView`: tip block moved into collapsible `<details>`.

**Files:** `components/admin/ui/AdminHelpBlock.tsx`, `components/admin/ui/AdminLayout.tsx`, `components/admin/views/ErsteSchritteView.tsx`

## 4. Compact Pages

- Headers less verbose on mobile (description/where-visible hidden).
- Users roles overview collapsed via `<details>`.
- Email placeholder help collapsed by default (see §7).

## 5. Benutzer & Rollen Mobile

- **Mobile:** stacked user cards (`admin-user-card`) — name, email, role, status, last login, actions vertical.
- **Desktop:** table without `min-w-[720px]` — no horizontal scroll.
- No duplicate action buttons on mobile (streamlined to Öffnen / Bearbeiten / Aktivieren).

**Files:** `components/admin/views/UsersView.tsx`, `src/app/globals.css`

## 6. Rechnungen / Angebote Mobile

- New `AdminActionMenu`: **primary action on top** (Senden), further actions in **„Mehr“** dropdown.
- Delete / Stornieren in separated **danger section** of menu (existing `confirmDanger` confirmations unchanged).
- Full-width primary button on narrow viewports.

**Files:** `components/admin/ui/AdminActionMenu.tsx`, `components/admin/views/QuotesView.tsx`, `components/admin/views/InvoicesView.tsx`

## 7. Galerie / Team / E-Mail Mobile

- `EmailVariableHelp`: collapsible, searchable placeholder list.
- `EmailPreviewFrame`: bottom margin respects mobile nav padding.
- Team/Gallery: already card-based; header compaction from shared layout applies.

**Files:** `components/admin/email/EmailVariableHelp.tsx`, `components/admin/email/EmailPreviewFrame.tsx`

## 8. Onboarding / Tutorial

- **DB:** `admin_users.onboarding_completed_at` (`supabase/migrations/20260731_admin_onboarding.sql`).
- **API:** `GET/POST /api/admin/onboarding` — status, complete, restart.
- **Steps:** role/permission-filtered wizard (welcome → dashboard → anfragen → kunden → angebote → rechnungen → galerie → bewertungen → [super-admin: sicherheit, audit] → [readonly hint] → fertig).
- **UI:** `AdminOnboardingWizard` — Weiter, Zurück, Überspringen, Nicht erneut anzeigen.
- **Trigger:** auto-opens after first login when `onboarding_completed_at` is null.
- **Restart:** Einstellungen → „Tutorial erneut starten“.

**Files:** `lib/admin/onboarding.ts`, `lib/admin/onboarding-store.ts`, `components/admin/AdminOnboardingProvider.tsx`, `components/admin/AdminOnboardingWizard.tsx`, `components/admin/AdminGate.tsx`, `components/admin/views/SettingsView.tsx`

## 9. PWA Install Hint

- Already implemented on dashboard (`DashboardPwaInstallCard`) from prior branch — verified in tests.

## 10. Tests

```bash
npm run test:admin-real-mobile   # 26 checks
npm run test:admin-mobile        # prior PWA/nav checks
npm run lint
npm run typecheck
npm run build
```

All passed.

## Security

- Onboarding and all admin actions remain behind existing `requireAdmin` / permission checks.
- Role-based step filtering is client presentation only; server routes unchanged.

## Migration

Apply on Supabase:

```sql
-- supabase/migrations/20260731_admin_onboarding.sql
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
```

Existing users with `NULL` will see onboarding once; completing or skipping sets the timestamp.
