# Service Worker Scope — Final Fix Report

**Datum:** 2026-07-09  
**Branch:** `cursor/service-worker-ready-root-cause-dab0`  
**Vorgänger:** `SERVICE_WORKER_READY_ROOT_CAUSE_REPORT.md`

---

## Problem (Root Cause)

`navigator.serviceWorker.ready` hing auf der Admin-Login-URL, obwohl der Service Worker registriert und **activated** war.

| Lookup | URL | Ergebnis vor Fix |
|--------|-----|------------------|
| `getRegistration("/admin/")` | mit Slash | Registration gefunden |
| `getRegistration("/admin")` | ohne Slash | **null** |
| `navigator.serviceWorker.ready` | Dokument-URL `/admin` | **Timeout** |

Ursache: Next.js leitete `/admin/` → `/admin` (308), Manifest-`start_url` war `/admin`, SW-Scope war `/admin/`. Chrome ordnet `ready` der **Dokument-URL** zu — `/admin` ohne Slash passte nicht zum Scope.

---

## Lösung

**Eine kanonische Admin-URL: `/admin/` (mit trailing slash)**

### 1. Zentrale Konstanten (`lib/admin/routes.ts`)

```typescript
export const ADMIN_HOME_PATH = "/admin/";
export const ADMIN_SW_SCOPE = "/admin/";
export const ADMIN_SW_SCRIPT_PATH = "/admin/sw.js";
export const ADMIN_MANIFEST_PATH = "/admin/manifest.webmanifest";
export const ADMIN_PWA_CAPTURE_PATH = "/admin/pwa-capture.js";
```

### 2. Next.js `trailingSlash: true`

Alle Routen nutzen konsistent trailing slashes. `/admin` wird automatisch zu `/admin/`.

### 3. Middleware (`src/middleware.ts`)

- Legacy-Redirect: `/admin` → `/admin/` (308)
- Login-Ziel: `ADMIN_HOME_PATH` (`/admin/`)
- Öffentlich ohne Session: `ADMIN_PWA_CAPTURE_PATH` hinzugefügt (Bootstrap-Skript lädt wieder als JS)

### 4. Manifest (`src/app/admin/manifest.webmanifest/route.ts`)

- `start_url`: `${origin}/admin/`
- `scope`: `${origin}/admin/`
- `id`: `${origin}/admin/`

### 5. Service Worker (`public/admin/sw.js`)

- Cache-Version: `pb-admin-shell-v8`
- Shell-Precache: `/admin/` statt `/admin`
- Offline-Fallback: `caches.match("/admin/")`

### 6. Push / Diagnose

- Neues Modul: `lib/admin/push/service-worker.ts` — zentrale `ensureAdminServiceWorkerReady()` mit `ADMIN_SW_SCOPE`
- `client.ts`, `activate-flow.ts`, `debug-state.ts` nutzen Route-Konstanten
- `pwa-install.ts`, `AdminPwaRegister.tsx` — `getRegistration(ADMIN_SW_SCOPE)`

### 7. UI-Links vereinheitlicht

Dashboard-Links und Logout-Ziel auf `ADMIN_HOME_PATH` (`/admin/`):

- `lib/admin/nav.ts`, `lib/admin/onboarding.ts`
- `AdminSidebar`, `AdminLoginForm`, `AdminInviteAcceptForm`, `AdminQuickActions`, `ErsteSchritteView`

---

## Verifikation (empirisch, Chrome Headless)

```bash
npm run build && PORT=3015 npm run start
node scripts/sw-ready-verify.mjs http://localhost:3015
```

### Ergebnis nach Fix

**`/admin/` (kanonisch):**

```json
{
  "href": "http://localhost:3015/admin/",
  "pathname": "/admin/",
  "regSlash": "activated",
  "controller": "http://localhost:3015/admin/sw.js",
  "readyResolved": true,
  "readyMs": 0
}
```

**`/admin` (Legacy):** 308 → `/admin/` → gleiches Ergebnis, `readyResolved: true`

**HTTP-Checks:**

| Request | Status |
|---------|--------|
| `GET /admin` | 308 → `/admin/` |
| `GET /admin/pwa-capture.js` | 200 OK (JavaScript) |
| Manifest `start_url` | `http://localhost:3015/admin/` |

---

## Akzeptanzkriterien

| Kriterium | Status |
|-----------|--------|
| `navigator.serviceWorker.ready` ohne Timeout auf `/admin/` | ✅ verifiziert (0 ms) |
| `navigator.serviceWorker.controller` gesetzt | ✅ verifiziert |
| Eine kanonische Admin-URL | ✅ `/admin/` |
| Manifest / SW / Middleware / Push einheitlich | ✅ |
| `npm run lint` | ✅ |
| `npm run typecheck` | ✅ |
| `npm run build` | ✅ |
| `npm run test:admin-pwa-scope` | ✅ 8/8 |
| `npm run test:admin-pwa-push` | ✅ 30/30 |

### Push-End-to-End (Android / iOS)

Server-seitige Push-Logik unverändert (VAPID, DB, Inquiry-Hook). Client-Blockade (`ready`-Timeout) ist behoben — folgende Schritte sind auf echten Geräten nach Deploy zu bestätigen:

- [ ] Browser-Subscription wird erstellt
- [ ] Subscription in DB gespeichert
- [ ] Status „Gerät registriert“
- [ ] Test-Push funktioniert
- [ ] Neue Anfrage löst Push aus
- [ ] Klick öffnet `/admin/anfragen`

---

## Geänderte Dateien (Auswahl)

| Bereich | Dateien |
|---------|---------|
| Konstanten | `lib/admin/routes.ts` (neu) |
| Routing | `next.config.ts`, `src/middleware.ts` |
| Manifest | `src/app/admin/manifest.webmanifest/route.ts` |
| SW | `public/admin/sw.js`, `public/admin-sw.js` |
| Push | `lib/admin/push/service-worker.ts` (neu), `client.ts`, `activate-flow.ts`, `debug-state.ts` |
| PWA | `lib/admin/pwa-install.ts`, `lib/admin/nav.ts` |
| UI | `AdminSidebar`, `AdminLoginForm`, `AdminInviteAcceptForm`, `AdminQuickActions`, `ErsteSchritteView`, `AdminGate`, `admin/layout.tsx` |
| Tests | `scripts/admin-pwa-scope-fix-test.mjs` (neu), diverse Test-Skripte aktualisiert |

---

## Hinweis für Deploy-Test

1. PWA vom Home-Bildschirm öffnen (startet jetzt `/admin/`)
2. Einstellungen → Push → „Gerät registrieren“
3. Diagnose: `Service Worker ready` = ja (kein 15s-Timeout)
4. Test-Push senden
5. Neue Anfrage über Website-Formular → Push auf Gerät
