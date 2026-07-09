# Admin PWA — Installed Status Detection Fix

**Datum:** 2026-07-09  
**Branch:** `cursor/pwa-installed-status-detection-dab0`

---

## Problem

Die Admin-PWA ließ sich installieren und erneut installieren nach Deinstallation — die Installation funktionierte.

**Fehler:** Nach Installation zeigte das CMS weiterhin „Technischer PWA-Fehler / Installation blockiert“, obwohl die App installiert war.

**Nicht geändert:** Manifest, Service-Worker-Logik (nur Status-Erkennung + UI).

---

## Root Cause

1. **`resolvePwaInstalled()` ignorierte `localStorage` und `appinstalled`-Flag**  
   Nur `display-mode: standalone` zählte. Im normalen Chrome-Tab nach Installation: kein Standalone → `isInstalled = false` → Fehler-UI.

2. **Fehlender `beforeinstallprompt` wurde als technischer Fehler gewertet**  
   Chrome liefert nach Installation keinen erneuten Prompt im Browser-Tab — das ist erwartetes Verhalten, kein Fehler.

3. **`!serviceWorkerControlling` löste `technical_error` aus**  
   Im Browser-Tab kontrolliert der SW oft nicht die Seite, obwohl die PWA installiert ist.

4. **Widersprüchliche Diagnose**  
   `serviceWorkerActive` basierte nur auf `reg?.active`, nicht auf `navigator.serviceWorker.controller` → „SW aktiv: fehlt“ bei „SW kontrolliert: OK“.

---

## Fix

### 1. Installed-State (mehrere Signale)

| Signal | Funktion |
|--------|----------|
| `display-mode: standalone/fullscreen/minimal-ui` | `isStandalonePwa()` |
| `navigator.standalone` (iOS) | `isStandalonePwa()` |
| `document.referrer` enthält `android-app://` | `isAndroidAppReferrer()` |
| `appinstalled` Event / `__pbPwaInstalledFired` | `readAppInstalledFiredFlag()` |
| `localStorage` `pb-admin-pwa-installed` | `readPwaInstalledFlag()` |

`resolvePwaInstalled()` und `hasPwaInstalledSignals()` nutzen alle Signale.

### 2. UI-Logik

| Zustand | Anzeige |
|---------|---------|
| Standalone / installiert | „Bereits installiert“ (grün) |
| Browser-Tab + Install-Flag | „Bereits installiert“ + Hinweis App-Icon |
| Kein Prompt, keine echten Blocker | Neutraler Text, **kein roter Fehler** |
| `beforeinstallprompt` vorhanden | Button „Admin-App installieren“ |
| Manifest/SW wirklich fehlt | Erst dann „Technischer PWA-Fehler“ |

Neuer Reality-Status: `unclear` statt `blocked_chrome` für unklare Fälle.

### 3. Diagnose

- `serviceWorkerActive = reg?.active || navigator.serviceWorker.controller`
- ProbeDetails: „Service Worker aktiv“ = OK wenn controlling
- Technische Blocker nur bei fehlendem Manifest/Icons/SW-Registrierung

### 4. Re-Install nach Deinstallation

- `beforeinstallprompt` löscht `pb-admin-pwa-installed` (Provider + pwa-capture.js)
- Install-Button erscheint wieder, sobald Chrome den Prompt liefert

---

## Geänderte Dateien

- `lib/admin/pwa-install.ts`
- `components/admin/AdminPwaProvider.tsx`
- `components/admin/AdminPwaInstallPanel.tsx`
- `components/admin/AdminPwaInstallHelpSheet.tsx`
- `public/admin/pwa-capture.js` (nur Install-Flag-Clear bei Prompt)
- `scripts/admin-pwa-installed-status-test.mjs` (neu)

---

## Tests

```text
node scripts/admin-pwa-installed-status-test.mjs  → 11/11
npm run typecheck  ✓
npm run lint       ✓
npm run build      ✓
```

---

## Akzeptanz

| Kriterium | Code |
|-----------|------|
| PWA standalone → „Bereits installiert“ | ✅ |
| Browser-Tab nach Install → kein roter Fehler | ✅ |
| Neutraler Hinweis wenn Prompt fehlt | ✅ |
| SW-Diagnose konsistent | ✅ |
| Deinstall → Prompt → Install wieder möglich | ✅ |
| Live-Screenshot | ⏳ Nutzer prüfen |
