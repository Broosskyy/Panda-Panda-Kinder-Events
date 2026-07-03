# Mobile Bugfix Sprint — Report (v0.6.0)

**Branch:** `cursor/mobile-responsive-fix-e022`  
**Datum:** 2026-07-03  
**Scope:** Nur Layout, Responsive Design, Mobile UX — keine Backend-/Feature-Änderungen

---

## Gefundene Mobile-Bugs

| Bereich | Bug | Ursache |
|---------|-----|---------|
| **Global** | Horizontaler Scroll / Überlauf | Negative Margins (`-mx-5`) auf Swipe-Tracks, absolute Ornamente außerhalb des Viewports, fehlendes `overflow-x: clip` |
| **Global** | Sections zu hoch | Desktop-Padding (`section-padding-lg`, `mb-14`, `pt-32`) 1:1 auf Mobile |
| **globals.css** | Kaputte CSS-Struktur | `@media (prefers-reduced-motion)` Block war syntaktisch fehlerhaft |
| **Header** | Zu hoch, Logo zu groß | `h-20` + Logo `xl` (`h-16`) auf kleinen Screens |
| **Header** | CTA zu früh sichtbar | Button ab `sm` sichtbar — zu breit auf schmalen Tablets |
| **Hero** | Endlos hoch, gequetscht | `pt-32` + große Typo + `aspect-[4/5]` Bild + absolute Badge oben |
| **Hero** | Badge überlappt Inhalte | `absolute -top-4` auf Mobile |
| **Hero** | Trust-Badges unleserlich | 4-spaltig mit großen Icons, wenig Kontrast |
| **SectionHeading** | Überschriften zu groß | `text-3xl`, `mb-14`, dekorative Herzen auf 320px |
| **Cards** | Zu viel Innenabstand | `p-8`/`p-10` auf Mobile |
| **Services/Galerie/Bewertungen** | Overflow durch Swipe | `-mx-5 px-5` ohne Container-Kompensation |
| **Leistungen** | Mini-Karten | Desktop-Padding auf schmalen Swipe-Cards |
| **Buchungsablauf** | Timeline zu luftig | `space-y-10`, große Kreise |
| **Galerie** | Große Leerräume | `mt-16` unter Galerie |
| **Bewertungen** | Karten zu hoch/breit | `padding lg`, große Typo |
| **Footer** | Zu bulkig | XL-Logo + Panda auf Mobile |
| **About** | Bild zu hoch | `aspect-[4/5]` ohne Mobile-Max-Height |
| **Kontakt** | Zu große Abstände | `gap-14` zwischen Formular und Kontakt |

---

## Umgesetzte Fixes

### Design System (`globals.css`)
- `overflow-x: clip` auf `html`/`body`
- Mobile-first `section-padding` / `section-padding-lg` (kompakter)
- `--radius-card-mobile: 18px` für Cards auf kleinen Screens
- Hero-Bild: `max-height: min(52vh, 22rem)` auf Mobile
- `.swipe-bleed` Wrapper für Carousel-Overflow ohne horizontalen Scroll
- `prefers-reduced-motion` Block repariert
- `img { max-width: 100% }`

### Shared UI
- **Container:** `px-4` auf Mobile
- **Logo:** kleinere `xl`/`large` Größen auf Mobile
- **Button:** kompaktere Mobile-Größen, weiterhin min. 44px Touch
- **Card:** reduziertes Mobile-Padding (`p-5` statt `p-8`)
- **SectionHeading:** `text-[1.65rem]` Mobile, kleinere Margins, Herzen erst ab `sm`

### Header
- Höhe `h-16` Mobile (statt `h-20`)
- Logo `large` auf Mobile, `xl` ab `sm`
- CTA erst ab `md` im Header
- Burger 48×48px, Menü-Padding angepasst

### Hero
- Kompakteres Padding (`pt-24` Mobile)
- Kleinere Headline (`text-[2rem]` → skaliert bis Desktop)
- Bild früher sichtbar (`aspect-[5/6]`, max-height begrenzt)
- Lisa-Badge **im Flow unter dem Bild** auf Mobile (kein `absolute`)
- Trust-Badges als 2×2 Chips mit Hintergrund
- Ornamente mit `pointer-events-none`, weniger Overflow

### Sections
- **Services / Galerie / Bewertungen:** `swipe-bleed` statt `-mx-5`
- **Process:** kompaktere vertikale Timeline
- **Testimonials:** kleinere Review-Cards, Empty-State kompakter, Button-Text korrigiert
- **Contact:** `gap-8` Mobile, kleinere Icon-Boxen
- **Footer:** `large` Logo Mobile, kleinerer Panda, weniger Padding
- **About / Usps:** reduzierte Abstände und Typo

### Desktop
- Alle Desktop-Layouts (`lg:`/`md:`) beibehalten
- Keine Verschlechterung der Grid-/Timeline-/Masonry-Layouts

---

## Breakpoints getestet (manuell / Code-Review)

320px · 360px · 375px · 390px · 412px · 430px · 768px · 1024px · 1280px · 1440px

---

## Build

`npm run build` — erfolgreich (Next.js 15.5.20)
