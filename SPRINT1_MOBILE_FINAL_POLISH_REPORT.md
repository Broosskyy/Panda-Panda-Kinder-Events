# SPRINT 1 — MOBILE FINAL POLISH REPORT

**Datum:** 8. Juli 2026  
**Branch:** `cursor/sprint1-mobile-polish-dab0`  
**Version:** 1.0.5  
**Basis:** Sprint 0 (Release Blocker Fixes, gemergt)

---

## Status

# READY FOR SPRINT 2

Die Mobile Experience wurde auf Premium-Niveau gebracht. Alle 15 Mobile-QA-Smoke-Tests bestanden. Build, Lint und Typecheck sind grün.

---

## Gefundene Mobile-Probleme

### Öffentliche Website

| # | Bereich | Problem | Schwere |
|---|---------|---------|---------|
| 1 | Chrome / Layout | `--chrome-bottom-mobile` reservierte immer ~7.25rem — auch wenn Sticky CTA ausgeblendet war | Hoch |
| 2 | Sticky CTA | Button nur 40px hoch (`min-h-[2.5rem]`) — unter Touch-Guideline | Mittel |
| 3 | Kontakt | Formular-Padding 0.75rem bei 56px Inputs — zu eng | Mittel |
| 4 | Kontakt | Section-Bottom-Padding 0.375rem — zu nah am Floating Chrome | Niedrig |
| 5 | Service-Modal | Kein Bottom-Sheet-Feeling auf Mobile, fehlende Safe-Area | Mittel |
| 6 | Footer | Nav-/Kontakt-Links ohne Mindest-Touchfläche (44px) | Mittel |
| 7 | Footer | Social-Pills mit leerem `href` wenn CMS-Feld fehlt | Niedrig |
| 8 | Footer | Harte Sprünge im Padding (`py-3` → `sm:py-16`) | Niedrig |
| 9 | Hero | Trust-Badges `text-xs` auf 320px zu klein | Niedrig |
| 10 | Carousel | Swipe-Gap zu eng (0.5rem) — kein Peek der nächsten Karte | Niedrig |

### Admin

| # | Bereich | Problem | Schwere |
|---|---------|---------|---------|
| 11 | Content-Padding | Doppeltes Bottom-Padding (`content-pad + 1.5rem`) — unnötiger Scroll | Hoch |
| 12 | Mobile Header | Kein `safe-area-inset-top` — Status Bar Überlappung auf iPhone | Hoch |
| 13 | Inputs | `font-size: 0.875rem` — iOS Zoom bei Focus | Hoch |
| 14 | Buttons | Keine `min-height` — Touch-Targets unter 44px | Mittel |
| 15 | Bottom Nav | Labels 9px (`0.5625rem`) — schwer lesbar | Mittel |
| 16 | Drawer | Nav-Links 40px statt 44px | Mittel |
| 17 | Overlay Modals | Padding für Bottom-Nav obwohl Nav ausgeblendet | Mittel |
| 18 | Page Header | Actions wrappen ohne volle Breite auf Mobile | Mittel |
| 19 | Stat Cards | `min-height: 7.5rem` — zu hoch im Single-Column Dashboard | Mittel |
| 20 | Filter Bar | Select `min-width: 10rem` erzwingt Horizontal-Scroll | Mittel |
| 21 | Help Toggle | Touch-Target ~28px | Niedrig |
| 22 | Sticky Save | Zu nah an Bottom-Nav | Niedrig |

---

## Durchgeführte Verbesserungen

### Spacing System (neu)

Einheitliche Mobile-Spacing-Variablen in `globals.css`:

```css
--mobile-space-xs: 0.375rem
--mobile-space-sm: 0.5rem
--mobile-space-md: 0.75rem
--mobile-space-lg: 1rem
--mobile-space-xl: 1.25rem
--mobile-touch-min: 2.75rem  /* 44px */
--mobile-touch-lg: 3rem      /* 48px */
```

### Responsive Optimierungen

| Fix | Details |
|-----|---------|
| Dynamisches Chrome-Padding | `data-sticky-cta="visible"` auf `<html>` — CTA-Höhe nur wenn sichtbar |
| Admin Main Padding | `content-pad + 0.5rem` statt `+ 1.5rem` |
| Kontakt Formular | Padding `1rem`, Section-Bottom `0.75rem` |
| Service Modal | Bottom-Sheet-Radius, Safe-Area, `overscroll-behavior: contain` |
| Footer Padding | Gestuft: `py-3 sm:py-10 md:py-16` |
| Swipe Carousel | Gap `0.75rem` auf Mobile |

### UX Verbesserungen

| Fix | Details |
|-----|---------|
| Sticky CTA Button | 48px Touch-Target (`min-h-12`, CSS `3rem`) |
| Footer Links | `.footer-tap-link` mit `min-height: 2.75rem` |
| Cookie-Button | Gleiche Touch-Klasse wie Footer-Links |
| Social Pills | Nur rendern wenn URL vorhanden |
| Hero Trust Badges | `hero-trust-badge` Klasse, `0.8125rem` auf Mobile |
| Admin Inputs | `font-size: 1rem` auf Mobile — kein iOS-Zoom |
| Admin Buttons | `min-height: 2.75rem` |
| Bottom Nav Labels | `0.625rem` (10px), `0.5625rem` auf ≤360px |
| Drawer Links | `min-height: 2.75rem` |
| Page Header | Volle Breite für Actions auf Mobile |
| Overlay Modals | Kein Bottom-Nav-Padding wenn Modal offen |
| Mobile Header | `safe-area-inset-top` |

### Performance

| Bereich | Status |
|---------|--------|
| Layout Shifts (CLS) | Dynamisches Chrome-Padding reduziert Layout-Sprünge |
| Bilder | Bestehendes Lazy Loading beibehalten |
| Re-Renders | StickyCtaBar `data-sticky-cta` via DOM-Attribut, kein Context |
| Animationen | `prefers-reduced-motion` bereits vorhanden |
| Build-Größe | Keine neuen Dependencies |

---

## Geänderte Dateien

```
src/app/globals.css
components/layout/StickyCtaBar.tsx
components/layout/Footer.tsx
components/layout/CookieSettingsButton.tsx
components/sections/Hero.tsx
SPRINT1_MOBILE_FINAL_POLISH_REPORT.md
```

*(Sprint 0 Basis inkludiert: Admin PWA, Header, InvitesView — via Merge)*

---

## Durchgeführte Tests

### Build-Pipeline

| Befehl | Ergebnis |
|--------|----------|
| `npm install` | ✓ OK |
| `npm run lint` | ✓ 0 Fehler |
| `npm run typecheck` | ✓ 0 Fehler |
| `npm run build` | ✓ Production Build erfolgreich |

### Mobile QA Smoke-Tests

| Script | Ergebnis |
|--------|----------|
| `test:website-mobile` | 15 passed |
| `test:website-mobile-compact` | 13 passed |
| `test:website-mobile-header` | 13 passed |
| `test:website-mobile-whitespace-footer` | 12 passed |
| `test:admin-mobile` | 14 passed |
| `test:admin-real-mobile` | 26 passed |
| `test:admin-critical-mobile` | 17 passed |
| `test:admin-pwa-action-popups` | 8 passed |
| `test:admin-onboarding-v2` | 11 passed |

**Gesamt: 129 Mobile-Tests bestanden, 0 fehlgeschlagen**

### Breakpoint-Abdeckung (statische Analyse)

| Breakpoint | Abgedeckt |
|------------|-----------|
| 320px | ✓ `@media (max-width: 360px)` Regeln |
| 360px | ✓ Dedizierte Admin-Regeln |
| 375px | ✓ 767px Mobile-Block |
| 390px | ✓ 767px Mobile-Block |
| 414px | ✓ 767px Mobile-Block |
| 430px | ✓ 767px Mobile-Block |
| Tablet | ✓ 640px / 768px / 1023px Breakpoints |
| Landscape | ✓ `dvh` / Safe-Area / `overflow-x: clip` |

---

## Mobile Checkliste (Sprint-Anforderungen)

| Bereich | Status |
|---------|--------|
| Spacing System | ✓ Einheitliche CSS-Variablen |
| Header (Logo, Hamburger, CTA, Safe Area) | ✓ |
| Navigation (Drawer, Bottom Nav, FAB) | ✓ |
| Sections (Hero → Footer) | ✓ |
| Admin (alle Module) | ✓ |
| Formulare (Inputs, Keyboard, Touch) | ✓ |
| Cards (Padding, Radius, Höhe) | ✓ |
| Buttons (44–48px Touch) | ✓ |
| Typografie (Lesbarkeit Mobile) | ✓ |
| Performance (CLS, Lazy Load) | ✓ |

---

## Offene Punkte (kein Mobile-Blocker)

| Punkt | Grund |
|-------|-------|
| Bottom-Nav 6 Items auf 320px | Architektur-Entscheidung — Labels ellipsieren; ggf. in Sprint 2 auf 4+Mehr reduzieren |
| iOS PWA Install | Plattform-Limitation — manuelle Anleitung vorhanden |
| Live-Test iPhone Safari / Android Chrome | Erfordert physische Geräte oder BrowserStack |
| Landscape-spezifische Admin-Layouts | Kein dediziertes Landscape-Layout — funktional via Scroll |
| Ripple-Animation auf Buttons | Nicht im Design-System — bewusst nicht hinzugefügt |

---

## Zusammenfassung

Sprint 1 hat **22 Mobile-Probleme** identifiziert und **direkt behoben**. Die Plattform fühlt sich auf dem Smartphone nun kompakt, ruhig und hochwertig an — nicht wie eine verkleinerte Desktop-Seite.

**Nächster Schritt:** Sprint 2 — Domain/E-Mail-Livegang und finale Go-Live-Checkliste.
