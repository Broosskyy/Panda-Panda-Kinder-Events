# FINAL RESPONSIVE CONSISTENCY REPORT

**Datum:** 2026-07-07  
**Branch:** `cursor/responsive-consistency-e022`

---

## Ziel

Die öffentliche Website soll auf allen Geräten gleichmäßig, hochwertig und aus einem Guss wirken — ohne die Desktop-Referenzqualität zu verschlechtern.

---

## Neues responsives Layout-System

### CSS-Tokens (`src/app/globals.css`)

| Token | Wert |
|-------|------|
| `--site-max-width` | 75rem (1200px) |
| `--site-padding-x` | 1rem → 1.5rem (640px+) → 2.5rem (768px+) |
| `--section-header-gap` | 2.5rem → 3.5rem → 5rem → 6rem |
| `--chrome-bottom-mobile` | 7.75rem (Platz für Sticky-CTA + WhatsApp) |

### Utility-Klassen

| Klasse | Zweck |
|--------|--------|
| `.section-container` | Einheitlicher Container: max-width, margin auto, horizontales Padding |
| `.section-container--narrow` | Schmale Inhalte (FAQ, Formulare) — max 48rem |
| `.section-header` | Einheitlicher Abstand unter Section-Headlines |
| `.section-prose` | Zentrierte Untertitel mit max-width 42rem |
| `.section-content-gap` | Einheitlicher Abstand zwischen Headline-Block und Content |
| `.swipe-bleed` | Carousel-Bleed synchron mit Container-Padding |
| `.swipe-bleed-reset-md` / `-lg` | Grid ab Tablet/Desktop, kein Bleed mehr |
| `.swipe-item-card` | Einheitliche Carousel-Kartenbreite: min(88vw, 20rem) |
| `.form-chrome-safe` | Extra Padding bei Formularen auf Mobile |

---

## Bereichs-Änderungen

| Bereich | Änderung |
|---------|----------|
| **Header** | Nutzt `.section-container` — gleiche horizontale Ausrichtung wie Sektionen |
| **Hero** | Mobile zentriert (bestehendes CSS), Bild neg. Margin nur ab `lg` |
| **PublicStats** | Von eigenem `max-w-5xl px-4` auf `Container` umgestellt |
| **Leistungen / Galerie / Aktuelles** | Einheitliche `swipe-item-card` + `swipe-bleed-reset-md` |
| **Bewertungen** | Carousel bis `lg`, Formular mit `section-container--narrow` |
| **Ablauf** | Mobile: Schritte zentriert via `.process-step-*` Klassen |
| **Über uns / Team** | Mobile: Fließtext zentriert via `.about-copy` |
| **FAQ** | `section-container--narrow` statt inline max-width |
| **Kontakt / Anfrage** | `form-chrome-safe` für Sticky-CTA-Abstand |
| **Footer** | Erhöhtes Mobile-Padding über `--chrome-bottom-mobile` |
| **WhatsApp** | Versteckt sich bei `#kontakt` / `#bewertung-form` (kein Überdecken von Sternen/Inputs) |
| **Aktuelles** | `public-main` + einheitlicher WhatsApp-FAB |

---

## Floating Chrome (Mobile)

- **Sticky CTA:** Versteckt sich bereits bei Kontakt- und Bewertungsformular
- **WhatsApp:** Neuer Hook `useHideNearFormSections` — gleiches Verhalten
- **`public-main`:** Erhöhtes `padding-bottom` auf Mobile
- **Footer:** Zusätzlicher Bottom-Padding auf Mobile

---

## Breakpoint-Abdeckung

Getestet via `scripts/responsive-consistency-test.mjs`:

| Viewport | Status |
|----------|--------|
| 360px | ✓ |
| 390px | ✓ |
| 430px | ✓ |
| 768px | ✓ |
| 1024px | ✓ |
| 1440px | ✓ |

---

## Verifikation

```bash
node scripts/responsive-consistency-test.mjs  # 22 passed
npm run lint                                 # OK
npm run typecheck                            # OK
npm run build                                # OK
```

---

## Desktop unverändert

- Keine Änderung an Desktop-Grid-Layouts (lg/xl Breakpoints)
- Hero negative margin nur ab `lg`
- Section-Padding-Skala ab 768px/1024px unverändert
- Keine neuen Features — nur Layout/CSS-Polish

---

## Geänderte Dateien (Auswahl)

- `src/app/globals.css` — Layout-System, Tokens, Mobile-Polish
- `components/ui/Container.tsx` — `.section-container`
- `components/ui/SectionHeading.tsx` — `.section-header`, `.section-prose`
- `components/layout/Header.tsx` — Container-Ausrichtung
- `components/layout/FloatingContactButtons.tsx` — Form-Hide-Hook
- `components/layout/WhatsAppFab.tsx` — Vereinheitlicht mit FloatingContactButtons
- `lib/hooks/useHideNearFormSections.ts` — Neu
- Alle öffentlichen Sektionen (Hero, Services, Process, Gallery, Testimonials, About, News, Faq, Contact, PublicStats)
