# PWA Installability Root Cause — Report

**Datum:** 2026-07-08  
**Branch:** `cursor/pwa-installability-root-cause-dab0`

---

## Exakte Ursache

**Chrome hat auf `/admin` das öffentliche Manifest geladen, nicht das Admin-Manifest.**

### Technischer Ablauf (verifiziert per `curl` auf gebautem `/admin` HTML)

**Vor dem Fix:**
```html
<link rel="manifest" href="/manifest.webmanifest"/>
```

Das öffentliche Manifest (`src/app/manifest.ts`, Next.js Metadata API) hatte:
- `display: "browser"` → **nicht installierbar**
- `start_url: "/"`, `scope: "/"` → passt nicht zum Admin-Pfad `/admin`

**Folge:** Chrome erfüllte die Installability-Kriterien nicht → `beforeinstallprompt` feuerte nicht → nur „Zum Startbildschirm hinzufügen“ bzw. gar kein echter Install-Prompt.

Die Admin-Layout-Metadaten (`manifest: "/admin/manifest.webmanifest"`) wurden durch **`src/app/manifest.ts`** überschrieben. Next.js injiziert diese Datei global auf **allen** Routen automatisch.

### Sekundäre Faktoren (behoben)

| Faktor | Auswirkung |
|--------|------------|
| SW-Registrierung erst in `useEffect` (nach Hydration) | Verzögerung bis `navigator.serviceWorker.controller` gesetzt |
| Middleware-Auth auf Manifest/SW (früher) | bereits in PR #111 behoben |
| Fehlende maskable 192×192 Icons | bereits in PR #111 behoben |

---

## DevTools / Lighthouse Prüfung

### Lokal nach Fix (`npm run build` + `npm run start`, Port 3012)

| Prüfung | Ergebnis |
|---------|----------|
| Admin HTML Manifest-Link | ✅ `href="/admin/manifest.webmanifest"` |
| `GET /admin/manifest.webmanifest` | ✅ 200, `Content-Type: application/manifest+json` |
| Manifest `display` | ✅ `standalone` |
| Manifest `start_url` | ✅ `http://localhost:3012/admin` (same-origin) |
| Manifest `scope` | ✅ `http://localhost:3012/admin/` |
| Manifest `id` | ✅ `http://localhost:3012/admin` |
| Icons 192/512 + maskable | ✅ im JSON, Dateien 200 OK |
| `GET /admin/sw.js` | ✅ 200, `Service-Worker-Allowed: /admin/` (next.config) |
| SW `fetch` handler | ✅ vorhanden |

### Lighthouse PWA / Chrome Android

**Nicht in dieser Agent-Umgebung ausgeführt** (kein Lighthouse CLI, kein Chrome Android Gerät).

Nach Deploy auf `pb-kinderevents.de` prüfen:
1. Chrome DevTools → Application → Manifest (keine roten Fehler)
2. Application → Service Workers (`/admin/sw.js` controlled)
3. Lighthouse → PWA / Installable
4. Chrome Android Menü → „App installieren“

---

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/app/manifest.ts` | **Gelöscht** — verursachte globales falsches Manifest-Link |
| `src/app/manifest.webmanifest/route.ts` | **Neu** — öffentliches Manifest nur als Route (display: browser), kein Auto-Link |
| `src/app/layout.tsx` | `manifest`-Metadatum entfernt |
| `src/app/admin/layout.tsx` | `generateMetadata()` mit Admin-Manifest |
| `src/app/admin/manifest.webmanifest/route.ts` | Absolute `id`/`start_url`/`scope` aus Request-Origin |
| `public/admin/pwa-capture.js` | Manifest-Link korrigieren + frühe SW-Registrierung + Reload |
| `public/admin/sw.js` | Cache `pb-admin-shell-v5` |
| `next.config.ts` | `Service-Worker-Allowed` Header für `/admin/sw.js` |
| `lib/admin/pwa-install.ts` | `auditChromeInstallBlockers`, Manifest-Link-Diagnose |
| `components/admin/AdminPwaInstallPanel.tsx` | Chrome-Blocker in Diagnose anzeigen |
| `components/admin/AdminPwaInstallHelpSheet.tsx` | Manifest-Link-Zeile in Debug |
| `scripts/pwa-installability-root-cause-test.mjs` | Statische Verifikation (9 Checks) |

---

## beforeinstallprompt

| Kriterium | Status |
|-----------|--------|
| Listener in `pwa-capture.js` (capture, beforeInteractive) | ✅ |
| Listener in `AdminPwaProvider` | ✅ |
| `event.preventDefault()` + `useRef` / `window.__pbPwaDeferredPrompt` | ✅ |
| `appinstalled` Listener | ✅ |
| `display-mode: standalone` Erkennung | ✅ |

---

## Admin-PWA separat

| Feld | Wert |
|------|------|
| Manifest | `/admin/manifest.webmanifest` |
| `id` | `{origin}/admin` |
| `scope` | `{origin}/admin/` |
| `start_url` | `{origin}/admin` |
| SW | `/admin/sw.js`, Scope `/admin/` |
| Öffentliche Website | eigenes Manifest (browser), **nicht** auf `/admin` verlinkt |

---

## Tests

```text
node scripts/pwa-installability-root-cause-test.mjs  → 9/9
npm run typecheck                                     → OK
npm run lint                                          → OK
npm run build                                         → OK
```

**Verifikation HTML nach Fix:**
```
rel="manifest" href="/admin/manifest.webmanifest"
```

---

## PWA STATUS

**Technischer Blocker behoben — Live-Bestätigung ausstehend**

| Frage | Antwort |
|-------|---------|
| Ursache identifiziert? | ✅ Falsches globales `app/manifest.ts` auf `/admin` |
| Fix deployed? | ⏳ Nach Merge/Deploy |
| Chrome zeigt jetzt „App installieren“? | **Nicht live verifiziert** — lokal sind alle Manifest/SW-Kriterien erfüllt |

Falls nach Deploy `beforeinstallprompt` weiterhin fehlt, verbleibende **ehrliche** Ursachen:
- Chrome-Engagement-Heuristik (mehrfacher Besuch)
- Prompt zuvor abgelehnt
- App bereits installiert
- In-App-Browser statt Chrome

Die Diagnose im Admin-Dashboard zeigt diese Fälle jetzt explizit unter „Chrome Installability“.
