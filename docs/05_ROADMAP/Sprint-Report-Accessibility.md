# Sprint Report — Accessibility / Barrierefreiheit

**Datum:** 2026-07-02  
**Branch:** `cursor/accessibility-sprint-e022`  
**Version:** 0.4.0

---

## Ziel

Die Panda-Bande Website auf Mobile und Desktop besser nutzbar, lesbarer und zugänglicher machen — ohne neue Features und ohne bestehende Funktionen zu entfernen. Ziel: Lighthouse Accessibility Score 95+.

## Audit-Ergebnisse (vor Sprint)

| Problem | Schwere | Bereich |
|---------|---------|---------|
| Text-muted (#7a7a7a) unter WCAG AA Kontrast | Hoch | Body, Labels, Footer |
| Kein sichtbarer Focus-State global | Hoch | Tastaturbedienung |
| Kein Skip-Link | Mittel | Navigation |
| FAQ ohne aria-controls | Mittel | ARIA |
| Formulare ohne aria-invalid/describedby | Mittel | Formulare |
| Kein prefers-reduced-motion | Mittel | Motion |
| Mobile Trust-Badges text-xs | Niedrig | Schriftgrößen |
| Footer white/60 zu wenig Kontrast | Mittel | Footer |
| Gold-Sterne (#d4a843) schwacher Kontrast | Niedrig | Bewertungen |

## Umgesetzte Verbesserungen

### 1. Farben & Kontraste
- `--color-text-secondary` → `#3d3d3d` (dunkler, besser lesbar)
- `--color-text-muted` → `#575757` (WCAG AA auf Beige-Hintergrund)
- `--color-text-placeholder` → `#6b6b6b` (neu)
- `--color-accent-gold` → `#b8922e` (dunkleres Gold für Sterne)
- Footer: `text-white/80` und `text-white/90` statt `/60`
- Unfilled Sterne: `text-text-muted/50` statt hellem Border

### 2. Schriftgrößen
- Body `font-size: 1rem` + `line-height: 1.6` global
- Button-Text: `text-base` (16px) statt `text-sm`
- Formularlabels: `text-base` statt `text-sm`
- Hero Trust-Badges: `text-sm` minimum auf Mobile
- Footer-Links: `text-base`

### 3. Touchflächen (min. 44×44px)
- Buttons: `min-h-12` / `min-h-14` + `min-w-12` / `min-w-14`
- Burger-Menü: 48×48px
- FAQ Accordion: `min-h-12`, Icon-Container 44×44px
- Formularinputs: `min-h-[52px]`
- Bewertungs-Sterne: 48×48px Buttons
- WhatsApp-FAB: 56×56px (bereits OK)
- Checkbox: 24×24px (erhöht von 20px)

### 4. Tastaturbedienung & Focus
- Globaler `:focus-visible` Outline (2px Olive, 2px Offset)
- `focusRing` Utility in `lib/a11y.ts` für Komponenten
- Skip-Link „Zum Hauptinhalt springen"
- Burger-Menü: Escape schließt, Focus auf Schließen-Button
- Lightbox: Escape + initial Focus auf Schließen
- Nach Menü-Schließen: Focus zurück auf Burger-Button

### 5. Semantik
- `main id="main-content"` für Skip-Link-Ziel
- Eine `h1` auf der Seite (Hero)
- FAQ: Fragen als `h3` innerhalb von Accordion
- Mobile Menü: `h2.sr-only` „Navigation"

### 6. ARIA
- Burger: `aria-controls`, `aria-expanded`, `aria-labelledby`
- FAQ: `aria-expanded`, `aria-controls`, `aria-labelledby`, `role="region"`
- Swipe-Bereiche: `role="region"` + `aria-label`
- Sterne: `role="img"` mit `aria-label`
- Bewertungs-Sterne: `role="radiogroup"` + `role="radio"` + `aria-checked`
- Formulare: `aria-required`, `aria-invalid`, `aria-describedby`, `role="alert"`
- Success: `role="status"` + `aria-live="polite"`
- Errors: `role="alert"` + `aria-live="assertive"`
- Loading: `aria-live="polite"` + `aria-busy`

### 7. Bilder
- Logo in Link: `alt=""` (Link hat `aria-label`)
- Galerie-Thumbnails in Buttons: `alt=""` (Button hat `aria-label`)
- Kontakt-Branding-Logo: `alt=""` (dekorativ)
- Inhaltliche Bilder: beschreibende alt-Texte beibehalten

### 8. Formulare
- Pflichtfeld-Hinweis oben im Formular
- `sr-only` „(Pflichtfeld)" für Screenreader
- Feldfehler mit `id` + `aria-describedby` verknüpft
- `aria-busy` auf Submit-Buttons während Senden

### 9. Motion
- `prefers-reduced-motion: reduce` — Animationen/Transitions deaktiviert
- ScrollReveal zeigt Inhalt sofort bei reduzierter Bewegung
- `scroll-behavior: auto` bei reduced motion

### 10. Neue Dateien
- `components/ui/SkipLink.tsx`
- `lib/a11y.ts` (shared focus/input classes)
- `docs/05_ROADMAP/Sprint-Report-Accessibility.md`
- `docs/05_ROADMAP/Sprint-Report-Premium-UI-UX-V2.md`

## Verifikation

| Check | Ergebnis |
|-------|----------|
| `npm run build` | ✅ |
| `npm run lint` | ✅ |
| API/Backend unverändert | ✅ |
| Keine Features entfernt | ✅ |

## Lighthouse (manuell empfohlen)

Nach Deploy mit Chrome DevTools Lighthouse → Accessibility prüfen. Erwarteter Score: **95+** durch Kontrast-, Focus- und ARIA-Fixes.

## Bekannte Grenzen

- Swipe-Carousels ohne vollständige WAI-ARIA Carousel-Pattern (kein Feature-Sprint)
- Review-Sterne als Custom Radio-Buttons ohne Pfeiltasten-Navigation
- Admin-Bereich nicht Teil dieses Audits
