# Final Mobile Alignment Report

**Branch:** `cursor/final-mobile-alignment-e022`  
**Datum:** 2026-07-07  
**Ziel:** Öffentliche Landingpage-Sections auf Mobile optisch einheitlich zentrieren — ohne Desktop-Regression.

---

## Problem

Auf Mobile wirkten mehrere Bereiche links versetzt:
- Section-Headlines teils linksbündig, Untertexte zentriert
- Process-Timeline mit linkem Offset
- FAQ-/Blog-/Galerie-Karten nicht visuell mittig im Container
- Bewertungsformular: Sterne zu breit / von Floating-Buttons überlappt
- Galerie-Kategorien-Chips ungleichmäßig verteilt

---

## Lösung

### 1. SectionHeading (einheitlich zentriert auf Mobile)

- Neue Struktur: `.section-heading-row`, `.section-heading-core`, `.section-heading-line`
- Mobile: Titel + Untertitel immer `text-align: center`, `margin-inline: auto`
- Desktop (≥768px): Process/Reviews wieder linksbündig wo sinnvoll

### 2. Globale Mobile-Styles (`globals.css`)

| Bereich | Fix |
|---------|-----|
| **Section Headers** | Zentrierung für alle `.section-header--center` |
| **Process** | Timeline-Linie ausgeblendet, Steps zentriert |
| **About** | Bild + Kontaktkarte + Team-Überschrift zentriert |
| **Bewertungen** | Review-Cards zentriert; Formular-Shell `mx-auto` |
| **Sterne** | `.review-star-rating` zentriert, kleinere Buttons, mehr Bottom-Padding |
| **FAQ** | `.faq-list` zentriert; Frage links, Toggle rechts, kein Container-Shift |
| **Galerie** | `.gallery-filter-row` zentriert |
| **Carousels** | `scroll-padding-inline` + trailing spacer für symmetrisches Swipe |
| **CTAs** | `.section-content-gap` zentriert Kinder |
| **Chrome** | Mehr `padding-bottom` für Sticky CTA + Floating WhatsApp |

### 3. Komponenten-Anpassungen

- `Gallery.tsx` — Klasse `gallery-filter-row`
- `Faq.tsx` — Klasse `faq-list`
- `Testimonials.tsx` — `review-form-shell`, Stars `justify-center` auf Mobile
- `ReviewForm.tsx` — zentrierte Sterne + Titel auf Mobile
- `Process.tsx` — `pl-1` entfernt (linker Offset)
- `About.tsx` — `about-contact-card`, `id="unser-team"`

---

## Desktop

Alle Mobile-Regeln in `@media (max-width: 767px)` — Desktop-Layout unverändert.

---

## Geänderte Dateien

```
src/app/globals.css
components/ui/SectionHeading.tsx
components/ui/ReviewForm.tsx
components/sections/Process.tsx
components/sections/Gallery.tsx
components/sections/Faq.tsx
components/sections/Testimonials.tsx
components/sections/About.tsx
```

---

## Verifikation

```bash
npm run lint
npm run typecheck
npm run build
```

### Manuell (Mobile ≤767px)

- [ ] „So einfach geht's“ — Steps zentriert
- [ ] „Echte Momente“ — Headline + Chips zentriert
- [ ] „Stimmen von Familien“ — Headline + Cards zentriert
- [ ] Bewertungsformular — alle 5 Sterne sichtbar, nicht von WhatsApp verdeckt
- [ ] „Über die Panda-Bande“ — Bild + Text zentriert
- [ ] „Aktuelles“ / Blog-Karten — Headline zentriert, Carousel symmetrisch
- [ ] FAQ — Headline zentriert, Accordion mittig im Container
- [ ] Sticky CTA verdeckt keinen Formularinhalt
