# Admin UI Bugfix — PWA Install, Mobile Menus & Customer Actions

## Summary

Targeted bugfixes for PWA installation reliability, mobile action menus, and customer detail button consistency. No features removed.

## 1. PWA Installation

### Problems fixed
- Install card X-button permanently hid the card via localStorage
- `beforeinstallprompt` could fire before `AdminPwaProvider` mounted (login screen)
- Settings only linked to dashboard without inline install UI
- Stale “installed” localStorage flag when not in standalone mode

### Changes
- **Session close (X):** `sessionStorage` only — card returns on next visit
- **“Nicht mehr anzeigen”:** separate `PWA_HIDE_STORAGE_KEY` in localStorage
- **Early capture:** `AdminPwaEarlyCapture` in admin layout stores prompt on `window.__pbPwaDeferredPrompt`
- **Installed detection:** `resolvePwaInstalled()` uses standalone mode as source of truth
- **Shared panel:** `AdminPwaInstallPanel` with status, iOS/Android/unsupported guides
- **Settings:** `AdminAppSettingsCard` under Einstellungen with install status, help, reinstall

### UX by platform
| Platform | Behavior |
|----------|----------|
| Chrome Android (prompt available) | Button „App installieren“ |
| iOS | Step-by-step „Teilen → Zum Home-Bildschirm“ |
| Desktop / no prompt | Chrome ⋮ manual guide + status check |
| Unsupported browser | Clear explanation |

## 2. Mobile Action Menus

### Problems fixed
- Popover dropdowns clipped/off-screen on mobile
- Menus overlapped bottom navigation

### Changes
- `AdminActionMenu` uses **bottom sheet** on viewports ≤767px (portal + backdrop)
- 200ms slide-up animation
- `max-width: calc(100vw - 24px)` on dropdowns and sheets
- 44px touch targets, icons left-aligned
- Danger actions at bottom, red styling
- Sheet positioned above bottom nav (`margin-bottom: calc(var(--admin-bottom-nav-height) + 0.5rem)`)
- Notification panel width aligned to same viewport constraint

## 3. Customer Detail Buttons

### Problems fixed
- Delete used `ghost` instead of `danger`
- Inconsistent mobile layout

### Changes
- **Speichern** → `primary`
- **Archivieren** → `secondary`
- **Löschen** → `danger` (red, full width on mobile)
- CSS grid: 2 columns on mobile, stacks on ≤360px
- Bottom padding avoids bottom nav overlap

## Files Changed

| Area | Files |
|------|-------|
| PWA | `lib/admin/pwa-install.ts`, `AdminPwaProvider.tsx`, `AdminPwaEarlyCapture.tsx`, `AdminPwaInstallPanel.tsx`, `DashboardPwaInstallCard.tsx`, `AdminAppSettingsCard.tsx`, `src/app/admin/layout.tsx` |
| Menus | `AdminActionMenu.tsx`, `globals.css` |
| Customers | `CustomersView.tsx`, `globals.css` |
| Settings | `SettingsView.tsx` |
| Tests | `admin-ui-bugfix-pwa-menu-customers-test.mjs`, updated mobile/critical tests |

## Verification

```bash
node scripts/admin-ui-bugfix-pwa-menu-customers-test.mjs  # 14 passed
node scripts/admin-critical-mobile-ux-action-bugfix-test.mjs  # 17 passed
node scripts/admin-mobile-nav-pwa-test.mjs  # 14 passed
npm run lint    # clean
npm run typecheck  # clean
npm run build   # success
```

## Regression Checklist

- [ ] Dashboard PWA card: install / close / don't show again
- [ ] Settings → Admin-App section visible with status
- [ ] Bookings/Reviews/Quotes „Mehr“ opens bottom sheet on mobile
- [ ] Customer detail: Save / Archive / Delete styling
- [ ] Bottom nav not covered by sheets
- [ ] Desktop popovers still work
- [ ] Viewports: 360px, 390px, 430px, tablet, desktop
