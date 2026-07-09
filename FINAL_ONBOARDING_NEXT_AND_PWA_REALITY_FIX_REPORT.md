# Final Onboarding + PWA Reality Fix — Report

**Datum:** 2026-07-09  
**Branch:** `cursor/final-onboarding-pwa-reality-dab0`

---

## Ausgangslage (echter Zustand laut Nutzer)

| Bereich | Status |
|---------|--------|
| Leistungen öffentlich | ✅ Funktioniert — **nicht angefasst** |
| Onboarding Schritt 1 | ❌ „Weiter“ fehlte |
| PWA Installation | ❌ Kein echter „App installieren“-Dialog |

---

## 1. Onboarding: Weiter-Button

### Ursache

Der Footer nutzte `AdminButton` in einem instabilen Grid/Flex-Layout (`--single` auf Schritt 1, `sticky` Footer in `overflow:hidden` Panel). Auf Mobile 390px wurde der Primary-Button **„Weiter“** visuell verdrängt oder nicht zuverlässig gerendert, während „Zurück“ (disabled), „Überspringen“ und „Nicht erneut anzeigen“ sichtbar blieben.

### Fix

| Änderung | Datei |
|----------|-------|
| Footer neu: **obere Zeile** `[Zurück] [Weiter/Fertig]`, **untere Zeile** `[Überspringen] [Nicht erneut anzeigen]` | `AdminOnboardingWizard.tsx` |
| Native `<button>` mit dedizierten Klassen (`admin-onboarding-v2-btn-next`) statt `AdminButton` | `AdminOnboardingWizard.tsx` |
| Schritt 1: Zurück **disabled**, Weiter **rechts sichtbar** | `AdminOnboardingWizard.tsx` |
| Panel: CSS Grid `auto auto 1fr auto` — Footer immer eigene Zeile, nicht scrollbar | `globals.css` |
| Footer: feste 2-Spalten-Grids `minmax(0,1fr) minmax(0,1fr)` | `globals.css` |

### Akzeptanz Onboarding

| Kriterium | Code-Status | Browser-Screenshot |
|-----------|-------------|-------------------|
| Weiter auf Schritt 1 sichtbar | ✅ Struktur + CSS | ⚠️ Nicht im Agent verifiziert |
| Weiter klickbar | ✅ `onClick` → Schritt 2 | ⚠️ Manuell prüfen |
| Layout 2+2 Zeilen | ✅ | ⚠️ Manuell 390px |

**Onboarding erst nach Browser-Screenshot als erledigt markieren.**

---

## 2. PWA: Install-Prompt

### Bekannte Root Cause (PR #113)

`src/app/manifest.ts` injizierte auf **allen** Routen `/manifest.webmanifest` (`display: browser`) — blockierte echte Admin-PWA. **Fix bereits in Branch-Historie**, hier verstärkt:

| Maßnahme | Zweck |
|----------|-------|
| `app/manifest.ts` gelöscht, Route-only | Kein falsches Manifest auf `/admin` |
| Admin `generateMetadata()` → `/admin/manifest.webmanifest` | Korrektes Admin-Manifest |
| `pwa-capture.js` korrigiert Manifest-Link + frühe SW-Registrierung | Vor React |
| Legacy `admin-sw.js` Registrierungen entfernen | Alte SW-Scopes bereinigen |
| SW Cache **v6**, Icons **v9**, Reload-Key **v2** | Cache-Bust nach Deploy |
| `resetPwaInstallCaches()` → alle SW + `pb-admin*` Caches löschen | Admin-Reset-Aktion |
| UI: `BLOCKED BY CHROME / MANUAL VERIFICATION NEEDED` | Ehrlicher Status |

### Lokal verifiziert (Build)

```
<link rel="manifest" href="/admin/manifest.webmanifest"/>
GET /admin/manifest.webmanifest → 200, display: standalone
```

### PWA STATUS

**BLOCKED BY CHROME / MANUAL VERIFICATION NEEDED** (bis Live-Bestätigung)

| Prüfung | Ergebnis |
|---------|----------|
| Admin-Manifest im HTML | ✅ lokal |
| `display: standalone` | ✅ |
| SW v6 + Legacy-Cleanup | ✅ Code |
| `beforeinstallprompt` auf pb-kinderevents.de | ❌ **Nicht im Agent getestet** |
| Chrome zeigt „App installieren“ | ❌ **Nicht bestätigt** |

**PWA erst erledigt, wenn Chrome Android „App installieren“ zeigt ODER ein verbleibender technischer Blocker in DevTools benannt ist.**

Nach Deploy auf Produktion:
1. Admin → „PWA-Installationsstatus zurücksetzen“
2. Seite hart neu laden
3. Chrome DevTools → Application → Manifest (keine Fehler)
4. Service Worker kontrolliert `/admin`
5. Chrome-Menü prüfen

---

## Geänderte Dateien

- `components/admin/AdminOnboardingWizard.tsx`
- `src/app/globals.css`
- `lib/admin/pwa-install.ts`
- `lib/brand.ts`
- `public/admin/pwa-capture.js`
- `public/admin/sw.js`
- `components/admin/AdminPwaInstallPanel.tsx`
- `scripts/final-onboarding-pwa-reality-test.mjs` (neu)

**Nicht geändert:** Leistungen, öffentliche Services, Header-Navigation

---

## Tests

```text
node scripts/final-onboarding-pwa-reality-test.mjs  → 10/10
npm run typecheck                                    → OK
npm run lint                                         → OK
npm run build                                        → OK
```

---

## Abschluss

| Task | Erledigt? |
|------|-----------|
| Onboarding Weiter sichtbar (Code) | ✅ |
| Onboarding Weiter (Live-Screenshot) | ⏳ Nutzer prüfen |
| PWA technische Blocker (falsches Manifest) | ✅ (Code + lokal) |
| PWA „App installieren“ live | ❌ MANUAL VERIFICATION NEEDED |
