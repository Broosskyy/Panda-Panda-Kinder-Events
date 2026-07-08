# Admin Mobile Nav + PWA Install Fix

## Zusammenfassung

Mobile Bottom Navigation und PWA-Installation wurden überarbeitet. Inhalte werden nicht mehr von der Navigation verdeckt, der FAB stört auf Mobile nicht mehr, und die Admin-PWA wird direkt im Dashboard als Install-Karte angeboten.

**Branch:** `cursor/admin-mobile-nav-pwa-install-e022`

---

## 1. Mobile Bottom Navigation

### Problem
- Bottom Nav ~5rem hoch, Inhalte unten abgeschnitten
- Festes `padding-bottom: 7.5rem` nicht synchron mit Nav-Höhe
- Labels zu lang auf schmalen Displays (360–430px)
- Doppeltes Padding durch `dash-v2` extra bottom pad

### Lösung
- CSS-Variablen auf `.admin-shell`:
  - `--admin-bottom-nav-height: calc(3.25rem + safe-area)`
  - `--admin-mobile-content-pad` für einheitliches Spacing
- `.admin-main` scrollt intern (`overflow-y: auto`, `min-height: 0`)
- Kompaktere Bottom Nav (~3.25rem + safe-area)
- Kürzere `mobileLabel` in Navigation (Start, Angeb., Rechn.)
- `admin-bottom-nav-label` mit Ellipsis
- Sticky Save, Toasts, Kunden-Split nutzen dieselbe Variable

---

## 2. Floating Action Button

### Problem
- FAB verdeckte Inhalte auf Mobile
- Auf den meisten Seiten sichtbar, obwohl Dashboard Quick Actions hat

### Lösung
- **Mobile:** FAB komplett ausgeblendet (`hidden md:flex`)
- **Desktop:** nur auf `/admin` (Dashboard)
- Scroll-Verhalten: bei Scroll nach unten ausblenden, nach oben einblenden
- Position Desktop: unten rechts ohne Bottom-Nav-Konflikt

---

## 3. PWA Install im Dashboard

### Neue Komponenten
| Datei | Rolle |
|-------|-------|
| `AdminPwaProvider.tsx` | SW-Registrierung, `beforeinstallprompt`, localStorage |
| `DashboardPwaInstallCard.tsx` | Install-Karte im Dashboard |
| `DashboardPwaInstallHint.tsx` | Optionaler Hinweis in Hilfe-Accordion |
| `lib/admin/pwa-install.ts` | Standalone-Erkennung, iOS, Storage-Keys |

### Karte „Admin-App installieren“
- Sichtbar wenn: eingeloggt, `/admin`, nicht installiert, nicht dismissed
- **Chrome/Android:** Button „App installieren“ → `prompt()`
- **iOS:** Anleitung „Teilen → Zum Home-Bildschirm“
- Schließen speichert `pb-admin-pwa-install-dismissed` in localStorage
- Nach Installation: Karte ausgeblendet (`appinstalled` + Flag)

### Entfernt
- Floating `admin-pwa-install-banner` (verdeckte Bottom Nav)

---

## 4. PWA-Konfiguration (verifiziert)

| Eigenschaft | Wert |
|-------------|------|
| Manifest | `/admin/manifest.webmanifest` |
| `start_url` | `/admin` |
| `scope` | `/admin` |
| `display` | `standalone` |
| Name | Panda-Bande Admin |
| Icons | 192×192, 512×512 |
| Service Worker | `/admin-sw.js` (scope `/admin`) |
| Öffentliche Site | `display: browser` |

Logout sperrt PWA weiterhin via `lockAdminPwa()`.

---

## 5. Tests

```bash
npm run test:admin-mobile  # 14 Checks
npm run test:admin-ui      # 16 Checks
npm run lint               # ✓
npm run typecheck          # ✓
npm run build              # ✓
```

### Manuell empfohlen
- Chrome Android: Install-Karte + Installation
- iOS Safari: Home-Screen-Anleitung
- 360 / 390 / 430px: Scroll bis Seitenende ohne Abschneiden
- FAB nur Desktop-Dashboard
- Toasts über Bottom Nav

---

## Geänderte Dateien

- `src/app/globals.css` — Nav, Padding, FAB, Toast, PWA-Karte
- `components/admin/AdminGate.tsx` — `AdminPwaProvider`
- `components/admin/AdminPwaProvider.tsx` (neu)
- `components/admin/AdminPwaRegister.tsx` — nur `lockAdminPwa`
- `components/admin/AdminQuickActions.tsx`
- `components/admin/AdminSidebar.tsx` — mobile labels
- `components/admin/dashboard/DashboardPwaInstallCard.tsx` (neu)
- `components/admin/dashboard/DashboardPwaInstallHint.tsx` (neu)
- `components/admin/dashboard/DashboardViewV2.tsx`
- `components/admin/dashboard/DashboardHelpAccordion.tsx`
- `lib/admin/nav.ts`, `lib/admin/pwa-install.ts`, `lib/admin/use-scroll-visible.ts`
- `scripts/admin-mobile-nav-pwa-test.mjs`
