# Admin PWA True Install Fix — Report

**Datum:** 2026-07-08  
**Branch:** `cursor/admin-pwa-true-install-fix-dab0`  
**Ziel:** Chrome Android soll „App installieren“ (echte PWA) anbieten — nicht nur „Zum Startbildschirm hinzufügen“.

---

## Ursache: Warum Chrome nur „Zum Startbildschirm hinzufügen“ zeigte

Chrome behandelt eine Web-App nur als **echt installierbare PWA**, wenn u. a. folgende Kriterien erfüllt sind:

1. **Manifest** öffentlich erreichbar (ohne Login-Redirect)
2. **Service Worker** öffentlich erreichbar und kontrolliert den Scope `/admin`
3. **Vollständige Icon-Suite** inkl. maskable 192×192 und 512×512
4. **HTTPS**, `display: standalone`, gültiger `start_url` / `scope`

### Identifizierte Blocker im Code

| # | Problem | Auswirkung |
|---|---------|------------|
| 1 | **Middleware** leitete `/admin/manifest.webmanifest` und `/admin/sw.js` ohne Session auf `/admin` (Login) um | Chrome konnte Manifest/SW nicht laden → nur Shortcut |
| 2 | **Fehlendes maskable 192×192 Icon** im Manifest | Chrome Android verlangt oft vollständige maskable-Icon-Suite |
| 3 | **Ungültiger SW-Fallback** auf `/admin-sw.js` mit `scope: "/admin/"` | SW an Root-Pfad kann nicht `/admin/` scopen → Registrierung fehlgeschlagen |
| 4 | **Diagnose/UI** behandelte Shortcut teils wie Erfolg | Irreführende Meldungen für Nutzer |

**Hauptursache:** Auth-Middleware blockierte PWA-Shell-Assets. Chrome sah kein gültiges Manifest und keinen kontrollierenden Service Worker → nur „Zum Startbildschirm hinzufügen“.

---

## 1. Manifest-Prüfung

**Route:** `src/app/admin/manifest.webmanifest/route.ts`

| Kriterium | Status |
|-----------|--------|
| Öffentlich ohne Login | ✅ (Middleware-Whitelist) |
| Content-Type `application/manifest+json` | ✅ |
| `name`: Panda-Bande Admin | ✅ |
| `short_name`: Panda Admin | ✅ |
| `start_url`: `/admin` | ✅ |
| `scope`: `/admin` | ✅ |
| `display`: standalone | ✅ |
| `orientation`: portrait-primary | ✅ |
| `theme_color` / `background_color` | ✅ (aus `BRAND`) |
| Icon 192×192 `purpose: any` | ✅ |
| Icon 512×512 `purpose: any` | ✅ |
| Icon maskable 192×192 | ✅ (neu) |
| Icon maskable 512×512 | ✅ |

---

## 2. Icon-Prüfung

**Assets:** `public/icons/`

| Datei | Status |
|-------|--------|
| `panda-icon-192.png` | ✅ vorhanden, öffentlich unter `/icons/` |
| `panda-icon-512.png` | ✅ |
| `panda-icon-maskable-192.png` | ✅ neu generiert |
| `panda-icon-maskable-512.png` | ✅ |
| Auth-geschützt | ❌ nein — `/icons/` im Middleware-Matcher ausgeschlossen |
| Version-Query `?v=8` | ✅ via `BRAND.iconVersion` |

Icons werden im Build via `scripts/generate-brand-assets.mjs` aus `Logo.png` erzeugt.

---

## 3. Service-Worker-Prüfung

**Datei:** `public/admin/sw.js`  
**Registrierung:** nur `/admin/sw.js` mit `scope: "/admin/"` (kein `/admin-sw.js`-Fallback mehr)

| Kriterium | Status |
|-----------|--------|
| Öffentlich ohne Login | ✅ |
| `Service-Worker-Allowed: /admin/` Header | ✅ (Middleware) |
| Cache-Version | `pb-admin-shell-v4` |
| Shell enthält Manifest + maskable Icons | ✅ |
| `clients.claim()` + `skipWaiting()` | ✅ |
| Fetch-Handler deckt `/admin` ab | ✅ |
| Auto-Reload wenn SW noch nicht kontrolliert | ✅ (`PWA_SW_RELOAD_KEY`) |

---

## 4. Scope-Prüfung

| Kriterium | Status |
|-----------|--------|
| Manifest-Link auf Admin-Seiten | ✅ (Admin-Layout) |
| `start_url` / `scope` = `/admin` | ✅ |
| Keine Cross-Domain-Redirects | ✅ |
| Login nur auf `/admin` (innerhalb Scope) | ✅ |
| Frühe `beforeinstallprompt`-Erfassung | ✅ (`public/admin/pwa-capture.js`) |

---

## 5. Auth / Redirect-Prüfung

**Änderung in `src/middleware.ts`:**

```ts
const PUBLIC_ADMIN_PWA_PATHS = [
  "/admin/manifest.webmanifest",
  "/admin/sw.js",
  "/admin-sw.js",
];
```

- PWA-Assets werden **vor** der Auth-Prüfung durchgelassen.
- Matcher schließt `admin/sw.js`, `admin-sw.js`, `admin/manifest.webmanifest` aus.
- Admin-Seiten selbst bleiben auth-geschützt (außer `/admin`, Passwort-Reset, Einladung).

---

## 6. beforeinstallprompt-Prüfung

**Implementierung:** `components/admin/AdminPwaProvider.tsx` + `lib/admin/pwa-install.ts`

| Verhalten | Status |
|-----------|--------|
| Listener früh registriert (inkl. `pwa-capture.js`) | ✅ |
| `event.preventDefault()` | ✅ |
| Prompt in `useRef` + Window-Backup | ✅ |
| `canInstall` nur wenn `deferredPrompt` vorhanden | ✅ |
| Button „Admin-App installieren“ nur bei `canInstall` | ✅ |
| Ohne Prompt: „Installationshilfe öffnen“ / klare Meldung | ✅ |
| `appinstalled` Listener | ✅ |
| `display-mode: standalone` Erkennung | ✅ |

---

## 7. Diagnose-Verbesserungen

**Neue Install-Modi** (`PwaInstallMode`):

- `true_installable` — echter Install-Prompt (Chrome, Edge, Samsung Internet)
- `manual_install_available` — manueller Weg, kein Fehler (Safari iOS, Firefox)
- `shortcut_only` — nur „Zum Startbildschirm hinzufügen“
- `sw_not_controlling` — SW kontrolliert `/admin` noch nicht
- `manifest_or_icons_error` — technische Blocker
- `installed` — bereits standalone
- `prompt_blocked` — Prompt zuvor abgelehnt
- `unsupported` — In-App-Browser o. ä.

**Browser-Erkennung** (`detectPwaBrowser`):

| Browser | Install-Weg | UI-Verhalten |
|---------|-------------|--------------|
| Chrome Android | `beforeinstallprompt` → „App installieren“ | Echter Prompt oder Shortcut-Warnung |
| Chrome Desktop | Install-Icon / Menü | Browser-spezifische Anleitung |
| Edge | Apps → Installieren | Browser-spezifische Anleitung |
| Safari iOS | Teilen → Zum Home-Bildschirm | **Kein Fehler** — manuelle Anleitung |
| Firefox | Manuell (kein zuverlässiger Prompt) | Browser-Anleitung, kein „PWA kaputt“ |
| Samsung Internet | Prompt oder Menü | Eigene Anleitung |

**UI:** `AdminPwaInstallPanel` und `AdminPwaInstallHelpSheet` zeigen browser-spezifische Status und Schritte.

---

## 8. Cache / Reset

**Aktion:** „PWA-Installationsstatus zurücksetzen“

Löscht nur:

- `pb-admin-pwa-install-hidden` / dismissed Flags
- `pb-admin-pwa-installed` Flag
- Session-Close / SW-Reload Flags
- Deferred-Prompt-Debug-Flags
- Admin-SW-Registrierungen + `pb-admin*` Cache-Einträge

**Keine** Nutzer-/CMS-Daten.

---

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/middleware.ts` | PWA-Asset-Whitelist, SW-Header, Matcher |
| `src/app/admin/manifest.webmanifest/route.ts` | maskable 192×192 Icon |
| `public/admin/sw.js` | v4 Cache, maskable Icons, kein admin-sw.js |
| `lib/brand.ts` | `iconMaskable192`, `iconVersion: "8"` |
| `lib/admin/pwa-install.ts` | Install-Modi, Diagnose, Reset, SW nur `/admin/sw.js` |
| `components/admin/AdminPwaProvider.tsx` | Reset inkl. Cache + SW-Neuregistrierung |
| `components/admin/AdminPwaInstallPanel.tsx` | Status A–F, Reset-Button |
| `components/admin/AdminPwaInstallHelpSheet.tsx` | Echte PWA vs. Verknüpfung Text |
| `scripts/generate-brand-assets.mjs` | maskable-192 Generierung |
| `public/icons/panda-icon-maskable-192.png` | Neues Asset |
| `scripts/admin-pwa-true-install-fix-test.mjs` | Statische Verifikation (9 Checks) |

---

## Tests (automatisiert)

```text
node scripts/admin-pwa-true-install-fix-test.mjs  → 9/9 passed
npm run typecheck                                 → OK
npm run lint                                      → OK
npm run build                                     → OK
npm run test                                      → nicht vorhanden
```

---

## Testflow Chrome Android (manuell — erforderlich nach Deploy)

1. Chrome Android öffnen
2. `https://pb-kinderevents.de/admin` direkt öffnen
3. Einloggen
4. Einmal neu laden (SW-Übernahme)
5. Prüfen:
   - Manifest 200 ohne Login-Redirect?
   - `navigator.serviceWorker.controller` gesetzt?
   - `beforeinstallprompt` gefeuert?
   - Chrome-Menü zeigt **„App installieren“**?
6. Dashboard → „Admin-App installieren“
7. Installation durchführen
8. App vom Homescreen öffnen:
   - Keine Browserleiste
   - `display-mode: standalone`
   - `/admin` korrekt
   - Auth/Logout funktioniert

**Hinweis:** Dieser Test konnte in der Cloud-Agent-Umgebung **nicht** auf einem echten Chrome-Android-Gerät gegen die Live-Domain ausgeführt werden.

---

## PWA STATUS

**2. Weiterhin blockiert bis Live-Test auf Chrome Android bestätigt**

Die technischen Blocker (Auth auf Manifest/SW, fehlendes maskable 192, ungültiger SW-Fallback) sind im Code behoben. **Erfolg („Echte Installation funktioniert“) kann erst nach Deploy und manuellem Chrome-Android-Test bestätigt werden**, wenn:

- Chrome **„App installieren“** zeigt (nicht nur „Zum Startbildschirm hinzufügen“)
- Installation funktioniert
- App startet standalone ohne Browserleiste

Bis dahin gilt: Fix deployed → Live-Test auf Gerät durchführen → diesen Report aktualisieren.
