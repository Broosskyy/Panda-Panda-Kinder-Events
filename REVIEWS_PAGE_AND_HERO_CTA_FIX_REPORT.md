# Reviews Page & Hero CTA Fix Report

**Datum:** 7. Juli 2026  
**Branch:** `cursor/reviews-page-hero-cta-fix-e022`

---

## 1. Desktop Hero Button Alignment Fix

### Problem
Auf Desktop waren die Hero-CTAs („Jetzt anfragen“ / „Unsere Leistungen“) optisch nicht gleichmäßig ausgerichtet — unterschiedliche Schatten-Klassen, `lg:justify-start` und fehlende gemeinsame Wrapper-Logik.

### Lösung

**`components/sections/Hero.tsx`**
- Neuer Wrapper `.hero-cta-group` für beide Buttons
- Einheitliche Klasse `.hero-cta-btn` auf beiden Buttons
- Icons mit `shrink-0`
- Entfernt: unterschiedliche Shadow-Overrides (`shadow-lg sm:shadow-xl` nur auf Primary)
- Entfernt: `lg:justify-start`

**`src/app/globals.css`**
```css
.hero-cta-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
/* sm+: row, justify-center, align-items center, gap 16px */
/* lg+: gap 18px, min-height 3.75rem auf beiden Buttons */
```

### Verhalten

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Spalte, zentriert, volle Breite — unverändert |
| sm–md | Zeile, zentriert |
| lg+ (1024–1920px) | Zeile, zentriert, identische min-height, gap 18px |

Keine `transform`- oder Margin-Hacks. Mobile-Rhythm-CSS (`max-width: 1023px`) bleibt unberührt.

---

## 2. Bewertungen — Alle Bewertungen Seite

### Neue Route: `/bewertungen`

**`src/app/bewertungen/page.tsx`**
- Lädt alle freigegebenen Bewertungen via `fetchApprovedReviews()`
- Sortierung: `sort_order` ASC, dann `created_at` DESC (bestehende DB-Logik)
- Sternebewertung, Name, Event-Art, Datum, Text, Admin-Antwort
- Profilbild/Eventfoto nur wenn vorhanden (keine Platzhalterbilder)
- Empty-State ohne Dummy-Daten
- SEO: dynamischer Title/Description mit echter Anzahl
- JSON-LD: Breadcrumb + AggregateRating (wenn Bewertungen vorhanden)

### Startseite — „Alle Bewertungen anzeigen“

**`components/sections/Testimonials.tsx`**
- Konstante `HOME_REVIEWS_PREVIEW_LIMIT = 3`
- Link erscheint nur wenn `totalReviewCount > 3`
- Dynamischer Text: **„Alle {n} Bewertungen anzeigen“** (echte Anzahl aus Supabase)
- Kein Link bei 0–3 Bewertungen

### Shared Components

| Datei | Zweck |
|-------|-------|
| `components/reviews/PublicReviewCard.tsx` | Wiederverwendbare Review-Karte |
| `components/reviews/ReviewsPageGrid.tsx` | Grid + Lightbox für Bewertungsseite |

### Layout

- **Mobile:** 1 Spalte, gut lesbare Karten
- **Desktop:** 2 Spalten (sm), 3 Spalten (lg)
- **Startseite:** Karussell unverändert (3 sichtbar auf Desktop)

---

## 3. Tests & Verifikation

### Szenarien (logisch)

| Bewertungen | Startseite | Link |
|-------------|------------|------|
| 0 | Empty-State + Formular | Nein |
| 1–3 | Alle sichtbar (Swipe/Karussell) | Nein |
| 4+ | 3 sichtbar + Karussell | „Alle n Bewertungen anzeigen“ |
| 10+ | Karussell + Link | `/bewertungen` zeigt alle |

### Build

```
npm run lint      ✔ (2 pre-existing warnings)
npm run typecheck ✔
npm run build     ✔ — Route /bewertungen registriert
```

---

## Geänderte Dateien

- `components/sections/Hero.tsx`
- `components/sections/Testimonials.tsx`
- `components/reviews/PublicReviewCard.tsx` (neu)
- `components/reviews/ReviewsPageGrid.tsx` (neu)
- `src/app/bewertungen/page.tsx` (neu)
- `src/app/page.tsx`
- `src/app/globals.css`
