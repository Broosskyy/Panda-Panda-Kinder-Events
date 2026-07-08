# Admin PWA Install — Real Technical Fix Report

**Date:** 2026-07-08  
**Branch:** `cursor/admin-pwa-install-real-fix-e022`

## Problem

The admin app was not recognized as installable in Chrome Android. The install menu option was missing, and buttons like “Installationsstatus prüfen”, “Installationshilfe anzeigen”, and “Installationskarte erneut anzeigen” had no visible effect.

## Root causes

1. **Service worker registered too late** — only after login inside `AdminPwaProvider`, while Chrome needs an active SW on `/admin` for installability.
2. **Incomplete PWA shell** — manifest/icons not precached; SW cache version outdated.
3. **Manifest gaps** — `short_name` was `PB Admin` instead of `Panda Admin`; no `id` field.
4. **UI disconnected from reality** — buttons did not reflect `beforeinstallprompt` availability; status check showed no details; help actions duplicated without clear behavior.

## Technical fixes

### Manifest (`src/app/admin/manifest.webmanifest/route.ts`)
- `id: "/admin"`
- `short_name: "Panda Admin"`
- `start_url: "/admin"`, `scope: "/admin"`, `display: "standalone"` (unchanged, verified)
- `Content-Type: application/manifest+json`

### Service worker (`public/admin-sw.js`)
- Cache bumped to `pb-admin-shell-v2`
- Precaches: `/admin`, manifest, offline page, 192/512 icons
- Runtime cache for admin assets
- `skipWaiting()` + `clients.claim()` preserved

### Early registration (`AdminPwaEarlyCapture.tsx`)
- Registers SW on **every** `/admin` page (including login)
- Captures `beforeinstallprompt` before provider mounts
- Dispatches custom events for provider sync

### PWA utilities (`lib/admin/pwa-install.ts`)
- `probePwaInstallability()` — checks manifest, icons, SW, HTTPS, install prompt
- `registerAdminServiceWorker()` — shared registration with ready wait
- Status labels: Installierbar, Nicht installierbar, Bereits installiert, Browser nicht unterstützt, Manifest/Icon/SW fehlt

### Provider (`AdminPwaProvider.tsx`)
- Install feedback: started / accepted / dismissed / unavailable
- `openInstallHelp` / `closeInstallHelp` for bottom sheet
- `reopenInstallCard` only when `sessionClosed`
- Re-probes after SW registration and prompt events

### UI
- **`AdminPwaInstallPanel`** — primary “App installieren” only when prompt available; otherwise “Installationshilfe öffnen”; status check shows probe details
- **`AdminPwaInstallHelpSheet`** — bottom sheet with Chrome/iOS steps + technical hints
- **`AdminAppSettingsCard`** — simplified; “Installationskarte erneut anzeigen” only when card was closed this session

## PWA checklist

| Criterion | Status |
|-----------|--------|
| Manifest reachable | ✓ `/admin/manifest.webmanifest` |
| Content-Type | ✓ `application/manifest+json` |
| start_url / scope | ✓ `/admin` |
| display standalone | ✓ |
| name / short_name | ✓ Panda-Bande Admin / Panda Admin |
| Icons 192 + 512 | ✓ generated via `prebuild` |
| Service worker | ✓ `/admin-sw.js`, scope `/admin` |
| SW early registration | ✓ layout-level |
| beforeinstallprompt | ✓ captured + `prompt()` on install |
| HTTPS | ✓ required in production |

## Verification

```bash
npm run test:admin-pwa-install   # 15/15
npm run test:admin-mobile        # 14/14
npm run test:admin-ui-bugfix     # 14/14
npm run test:security            # 36/36
npm run lint                     # ✓
npm run typecheck                # ✓
npm run build                    # ✓
```

**Mobile breakpoints:** 360px, 390px, 430px (help sheet responsive styles).

## Manual QA (Chrome Android)

1. Open `/admin`, log in
2. DevTools → Application → Manifest: valid, icons load
3. Application → Service Workers: active, scope `/admin`
4. If `beforeinstallprompt` fires: “App installieren” triggers native dialog
5. If not: “Installationshilfe öffnen” shows bottom sheet with manual steps
6. “Installationsstatus prüfen” shows manifest/SW/icon/HTTPS details

## Files changed

- `lib/admin/pwa-install.ts`
- `components/admin/AdminPwaEarlyCapture.tsx`
- `components/admin/AdminPwaProvider.tsx`
- `components/admin/AdminPwaInstallPanel.tsx`
- `components/admin/AdminPwaInstallHelpSheet.tsx` (new)
- `components/admin/AdminAppSettingsCard.tsx`
- `components/admin/dashboard/DashboardPwaInstallHint.tsx`
- `src/app/admin/manifest.webmanifest/route.ts`
- `public/admin-sw.js`
- `src/app/globals.css`
- `scripts/admin-pwa-install-real-fix-test.mjs` (new)
- `scripts/admin-mobile-nav-pwa-test.mjs`
- `scripts/admin-ui-bugfix-pwa-menu-customers-test.mjs`
- `scripts/security-audit-pwa-test.mjs`
- `package.json`
