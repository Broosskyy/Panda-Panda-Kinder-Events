# Website Mobile Compactness + Header Fix Report

**Branch:** `cursor/website-mobile-compactness-header-e022`  
**Datum:** 2026-07-08  
**Scope:** Öffentliche Website — Mobile Layout, Header/Menü, Abstände, Sticky Buttons, Overflow

---

## 1. Gefundene Leerraum-Probleme

| Bereich | Problem |
|---------|---------|
| **Global** | `section-padding` 2rem, `section-header-gap` 1.75rem — zu luftig auf 360–430px |
| **Hero** | Große Abstände zwischen Rating, Headline, CTAs und Trust-Chips; Hero-Bild zu hoch |
| **Ablauf** | 5 Schritte vertikal zentriert mit großen Gaps; BrandMark-Sidebar zusätzlich auf Mobile |
| **Galerie** | Filter-Chips und Bilder (4:5) mit viel vertikalem Abstand |
| **Bewertungen** | Rating-Summary und Cards mit großem Margin/Gap |
| **Team** | 4:5 Bildflächen auch ohne Foto; große Section-Margins |
| **Blog/Aktuelles** | Swipe-Cards `86vw` verursachten seitlichen Überlauf |
| **FAQ** | `py-4` pro Item, große Panel-Abstände |
| **Kontakt** | Grid-Gap 2rem, Formular-Padding groß |
| **Footer** | `py-8` + großer Chrome-Abstand |
| **Sticky CTA** | 4.25rem Höhe, verdeckt Inhalte, kein Scroll-Hide |
| **WhatsApp FAB** | 3.5rem, überlappt Karten bei sichtbarem Sticky CTA |

---

## 2. Sektionen — Kompakter gemacht

### Global (`globals.css`)
- `section-padding`: **1.25rem** (Mobile) — ca. 37% weniger als zuvor
- `section-padding-lg`: **1.5rem** (Hero)
- `--section-header-gap`: **1.125rem** (Mobile)
- `--header-height`: **3.75rem** (Mobile)
- `section-content-gap`: **1.25rem**

### Hero
- Engere Margins bei Rating, Tagline, Subtitle, CTAs, Trust-Chips
- Hero-Bild max-height reduziert (`min(42vh, 17rem)`)

### Ablauf / Process
- Kompakte **horizontale Step-Cards** (Nummer + Icon + Text in einer Zeile)
- Gap zwischen Steps: **0.625rem**
- BrandMark-Sprechblase auf Mobile **ausgeblendet** (`hidden lg:block`)

### Galerie
- Filter näher an Überschrift (`margin-bottom: 0.75rem`)
- Bilder **3:4** statt 4:5 auf Mobile
- CTA-Abstand reduziert

### Bewertungen
- `.review-summary` kompakter (kleinere Sterne-Zahl, weniger Margin)
- Review-Cards mit reduziertem Padding und Zeilenhöhe

### Team
- Bildbereich **4:3** auf Mobile, max-height **11rem**
- Kleinere Initialen-Platzhalter
- Engere Card-Padding und Section-Margins

### Blog / Aktuelles
- Swipe-Card-Breite: `min(82vw, calc(100vw - 2 * padding - 0.5rem))` — kein Overflow

### FAQ
- Item-Padding `py-3`, kompaktere Panel-Typografie
- Plus/Minus-Button fixiert auf **2rem** mit zentrierter Ausrichtung

### Kontakt / Anfrage
- Grid-Gap **1.25rem**, Form-Padding reduziert
- `form-chrome-safe` mit angepasstem Bottom-Padding für Sticky Chrome

### Footer
- `py-6` auf Mobile, Grid-Gap **1.5rem**

**Geschätzte Scroll-Reduktion:** 30–45% auf typischen Mobile-Viewports (360–430px)

---

## 3. Header / Hamburger-Fixes

| Fix | Details |
|-----|---------|
| Scroll-Lock | `position: fixed` + Scroll-Position-Restore (iOS-sicher) |
| `data-mobile-menu-open` | Auf `<html>` für Overflow-Kontrolle |
| Focus-Trap | Tab-Zyklus innerhalb des Drawers |
| ESC | Schließt Menü, Fokus zurück auf Hamburger |
| Outside-Click | Backdrop schließt Menü |
| Route-Click | Nav-Links schließen Menü |
| Hamburger | `invisible` + `pointer-events-none` + `tabIndex=-1` wenn offen |
| Panel | `.mobile-nav-panel` mit Slide-In-Animation (kein toter `#mobile-nav-panel`-CSS mehr) |
| Layout | Kompaktere Header-Höhe (`site-header-bar`, h-11 Buttons) |
| Drawer | `max-w 20rem`, Safe-Area-Padding, `overscroll-contain` |

---

## 4. Sticky Button Fixes

- Höhe: `--sticky-cta-bar-height: 3.25rem`, Button `min-height: 2.5rem`
- **Scroll-Down:** `sticky-cta-bar--scroll-hidden` (translateY + opacity)
- **Scroll-Up:** Wieder sichtbar
- **Formular:** Ausgeblendet bei `#kontakt` / `#bewertung-form` (IntersectionObserver)
- Safe-Area: `env(safe-area-inset-bottom)` beibehalten

---

## 5. WhatsApp Button Fixes

- Größe: `--floating-contact-size: 3rem`, Icon `h-5 w-5`
- Position: `--above-cta` Modifier wenn Sticky CTA sichtbar
- Hook erweitert: reagiert auf `sticky-cta-bar--scroll-hidden` und `data-sticky-cta-visible`
- Formular-Bereich: weiterhin via `useHideNearFormSections` ausgeblendet

---

## 6. Mobile Overflow Fixes

- `swipe-bleed { max-width: 100vw }`
- Swipe-Cards viewport-gebunden
- `body` / `html`: `overflow-x: clip` (bestehend, beibehalten)
- Sticky Chrome: `--chrome-bottom-mobile` neu berechnet (kleinere FAB + CTA)

---

## 7. Geänderte Dateien

- `src/app/globals.css`
- `components/layout/Header.tsx`
- `components/layout/StickyCtaBar.tsx`
- `components/layout/FloatingContactButtons.tsx`
- `components/layout/Footer.tsx`
- `components/sections/Hero.tsx`
- `components/sections/Process.tsx`
- `components/sections/Gallery.tsx`
- `components/sections/About.tsx`
- `components/sections/Testimonials.tsx`
- `components/sections/Faq.tsx`
- `components/sections/Contact.tsx`
- `components/ui/TeamMemberImage.tsx`
- `lib/hooks/useFloatingContactAboveCta.ts`
- `scripts/website-mobile-compactness-test.mjs`
- `scripts/website-mobile-spacing-test.mjs`
- `package.json`

---

## 8. Verifikation

```bash
node scripts/website-mobile-compactness-test.mjs
node scripts/website-mobile-spacing-test.mjs
npm run lint
npm run typecheck
npm run build
```

Breakpoints manuell geprüft (statisch): **360px, 390px, 430px** — Mobile-Regeln via `@media (max-width: 767px)`.

---

## 9. Offene Punkte

- **Visueller QA auf echten Geräten** (iOS Safari Scroll-Lock, Android Chrome) empfohlen
- **Sticky CTA Schwellwert** (360px Scroll-Start) kann nach Live-Feedback feinjustiert werden
- **Process Step-Cards** auf sehr kleinen Screens (<340px) ggf. noch feinere Typografie
- **Cookie-Banner** + Sticky CTA gleichzeitig sichtbar — bereits positioniert, aber auf kleinen Screens manuell prüfen

---

## 10. Nicht geändert (bewusst)

- Keine Admin-Funktionen
- Keine Inhalte gelöscht
- Keine Datenbankstruktur
- Desktop-Layout unverändert (ab ≥768px)
