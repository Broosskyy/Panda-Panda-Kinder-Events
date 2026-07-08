# FINAL REMAINING BUGS HARD FIX REPORT

**Branch:** `cursor/remaining-bugs-hard-fix-dab0`  
**Datum:** 2026-07-08  
**Scope:** Gezielte Restfehler-Reparatur (keine neuen Features)

---

## Zusammenfassung

Alle sechs Fix-Bereiche wurden im Code adressiert. `npm run lint`, `npm run typecheck` und `npm run build` sind grün. Zusätzlich liefen statische Verifikationsskripte (`remaining-bugs-hard-fix-test.mjs`, Admin-PWA/Popup-Tests, Website-Mobile-Spacing-Tests).

**Hinweis zur UI-Verifikation:** In dieser Cloud-Agent-Umgebung war kein interaktiver Browser-Lauf für die Flows A–F möglich. Punkte mit sichtbarem UI-Verhalten sind daher als **Code-Fix erledigt, visuelle QA im Browser ausstehend** markiert — nicht als vollständig UI-getestet.

---

## 1. Transparente / durchsichtige Modals

| Feld | Inhalt |
|------|--------|
| **Gefunden** | Installationshilfe, Overlay-Modals und Action-Sheets konnten Hintergrundtext durchscheinen lassen; Panels nutzten teils `var(--admin-surface)` ohne harte Opazität, innere Karten hatten `/40`–`/80` Alpha-Hintergründe. |
| **Ursache** | Fehlende explizite undurchsichtige Panel-Farbe; `backdrop-filter` gehört nur auf Backdrops; innere Tailwind-Alpha-Klassen auf PWA-Hilfe-Inhalten. |
| **Fix** | Neues Token `--admin-panel-solid`; alle Overlay-Panels (`admin-pwa-help-sheet`, `admin-overlay-modal`, `admin-action-sheet`, `admin-onboarding-v2`, `admin-modal`) mit solidem Hintergrund, `backdrop-filter: none` auf Panels, `z-index`-Trennung Backdrop (0) / Panel (1); Header/Body der Sheets ebenfalls solid; PWA-Hilfe-Innenkarten auf `bg-bg-secondary` ohne Transparenz; Debug als `<details>` einklappbar. |
| **Getesteter Flow** | Statisch: CSS-Token + Panel-Regeln; `admin-pwa-action-popups-mobile-test.mjs` (8/8). Flow B (Installationshilfe öffnen) **nicht im Browser geprüft**. |
| **Status** | Code-Fix erledigt — **visuelle QA ausstehend** |

---

## 2. Öffentliches Hamburger-Menü CTA

| Feld | Inhalt |
|------|--------|
| **Gefunden** | Button „Unverbindlich anfragen“ im Mobile-Menü schloss das Menü nicht zuverlässig und scrollte nicht sauber zu `#kontakt`. |
| **Ursache** | `Button` mit `href` rendert `<a>` und verwarf `onClick`; bei offenem Menü blockiert `position: fixed` auf `body` normales Hash-Scrolling. |
| **Fix** | `handleMobileContactCta`: `preventDefault` → `closeMenu()` → 320ms Verzögerung → `scrollToPublicSection("kontakt")` auf Startseite, sonst `navigateToPublicSection`. Mobile-Nav-Hashes auf Startseite analog. Neue Helfer in `lib/public-href.ts`. `Button` übergibt `onClick` nun auch bei `href`. |
| **Getesteter Flow** | Statisch: `remaining-bugs-hard-fix-test.mjs`. Flow A **nicht im Browser geprüft**. |
| **Status** | Code-Fix erledigt — **visuelle QA ausstehend** |

---

## 3. PWA Install-Problem ehrlich lösen

| Feld | Inhalt |
|------|--------|
| **Gefunden** | Kombinierter Button-Text „Admin-App installieren / Hilfe“ wirkte wie ein toter Install-Button ohne `deferredPrompt`. |
| **Ursache** | UI unterschied nicht klar zwischen nativem Prompt und manueller Hilfe. |
| **Fix** | Primärbutton: `canInstall` → „Admin-App installieren“, sonst → „Installationshilfe öffnen“. Sekundär „Installationshilfe“ nur wenn `canInstall`. Statuszeile: „Chrome stellt aktuell keinen Installationsdialog bereit.“ Klare manuelle Anleitung + erweiterte `causeMessage` in `detectPwaInstallCause`. Debug einklappbar (`<details>`). Manifest/SW unverändert (bereits OK). |
| **Getesteter Flow** | Statisch: `remaining-bugs-hard-fix-test.mjs`, `admin-ui-bugfix-pwa-menu-customers-test.mjs`. Flow B **nicht im Browser geprüft**. |
| **Status** | Code-Fix erledigt — **visuelle QA ausstehend** |

---

## 4. Admin Mehr-Menü / Dropdown / Bottom Sheet

| Feld | Inhalt |
|------|--------|
| **Gefunden** | Mehr-Menüs teilweise transparent, falsch geschichtet, Z-Index unter Bottom-Nav. |
| **Ursache** | Action-Sheet `z-index: 190` unter Overlay-Modals; Panel-Hintergrund nicht explizit opaque; Dropdown nutzte `var(--admin-surface)`. |
| **Fix** | Action-Sheet-Root `z-index: 220`; Panel/Dropdown auf `--admin-panel-solid`; Header/Body solid; Bottom-Nav-Hiding via bestehendes `data-admin-action-sheet` beibehalten. |
| **Getesteter Flow** | Statisch: `admin-ui-bugfix-pwa-menu-customers-test.mjs` (Sheet 200ms, Popover safe). Flows C + D **nicht im Browser geprüft**. |
| **Status** | Code-Fix erledigt — **visuelle QA ausstehend** |

---

## 5. Footer / Sticky CTA / WhatsApp

| Feld | Inhalt |
|------|--------|
| **Gefunden** | Zu viel Leerraum unten; WhatsApp-Button-Konflikt mit Sticky CTA (feste `7rem`-Position überschrieb Mobile-Regeln). |
| **Ursache** | `.floating-contact-stack` Base-Rule (`bottom: 7rem`) kam nach Mobile-Media-Query und gewann die Kaskade; großzügiges `--chrome-bottom-mobile`-Padding. |
| **Fix** | WhatsApp nutzt `var(--chrome-bottom-mobile)`; Sticky CTA Hintergrund solid (`var(--color-bg-card)`, kein Blur); reduzierte Gaps/Paddings für Footer/Kontaktformular; `--floating-contact-gap` von 0.5rem → 0.375rem. |
| **Getesteter Flow** | Statisch: `website-mobile-spacing-test.mjs` (15/15). Flow E **nicht im Browser geprüft**. |
| **Status** | Code-Fix erledigt — **visuelle QA ausstehend** |

---

## 6. Öffentliche Seiten-Overflow

| Feld | Inhalt |
|------|--------|
| **Gefunden** | Horizontales Scrollen / abgeschnittene Slider-Cards (Blog, Bewertungen, Galerie). |
| **Ursache** | `max-width: 100vw` und `100vw`-basierte Card-Breiten (Scrollbar-Breite → Overflow); `.swipe-bleed` ohne Overflow-Clip. |
| **Fix** | `100vw` → `100%` für Bleed/Cards; `.swipe-bleed { max-width: 100%; overflow: hidden }`; `html`/`body` behalten `overflow-x: clip`. |
| **Getesteter Flow** | Statisch: `remaining-bugs-hard-fix-test.mjs`. Flow F **nicht im Browser geprüft**. |
| **Status** | Code-Fix erledigt — **visuelle QA ausstehend** |

---

## Build & QA-Befehle

```bash
npm run lint        # ✓ grün
npm run typecheck   # ✓ grün
npm run build       # ✓ grün
node scripts/remaining-bugs-hard-fix-test.mjs  # 8/8
```

---

## Geänderte Dateien (Kern)

- `src/app/globals.css` — Solid panels, chrome spacing, overflow, action-sheet z-index
- `components/layout/Header.tsx` — Mobile CTA + Nav scroll handler
- `lib/public-href.ts` — `scrollToPublicSection`, `navigateToPublicSection`
- `components/ui/Button.tsx` — `onClick` auf `<a>`-Variante
- `components/admin/AdminPwaInstallPanel.tsx` — ehrliche Button-/Status-Logik
- `components/admin/AdminPwaInstallHelpSheet.tsx` — solide Karten, einklappbare Diagnose
- `lib/admin/pwa-install.ts` — klare Chrome-Meldung
- `scripts/remaining-bugs-hard-fix-test.mjs` — statische Verifikation

---

## Empfohlene manuelle Checks (Browser)

| Flow | Erwartung |
|------|-----------|
| A | Hamburger → „Unverbindlich anfragen“ → Menü zu → Scroll zu `#kontakt` |
| B | Admin → Einstellungen → Admin-App → Installationshilfe → solides Modal |
| C | Admin → Rechnungen → Mehr → solides Sheet, klickbare Aktionen |
| D | Admin → Einladungen → Mehr → solides Sheet |
| E | Mobile Startseite scrollen → kein übermäßiger Leerraum, nichts verdeckt |
| F | Desktop Slider/Galerie/Blog → kein horizontaler Overflow |
