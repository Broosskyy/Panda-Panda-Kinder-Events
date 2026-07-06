# Public Website Final Report — RC5 Production Polish

**Date:** 2026-07-06  
**Version:** `0.9.0-rc.13`  
**Branch:** `cursor/public-website-rc5-polish-e022`

## Gefundene Probleme

| Problem | Schwere |
|---------|---------|
| Doppelte Inhalte: Hero-Gründerin-Badge + About + Team + Mission/Werte | Hoch |
| Zu viele CTAs (SectionCta nach fast jeder Sektion + Floats + Header) | Hoch |
| Telefon-Float + Sticky CTA + WhatsApp überlagerten Mobile-Inhalte | Mittel |
| Leistungskarten uneinheitlich (mit/ohne Bild, unterschiedliche Höhen) | Mittel |
| `publicTeam` nicht im Admin bearbeitbar | Mittel |
| Kontakt ohne Antwortzeit/Öffnungszeiten CMS-Felder | Mittel |
| Footer ohne Cookie-Einstellungen-Link | Niedrig |
| FAQ `hidden` ohne Animation | Niedrig |

## Behobene Probleme

### 1. Sektion „Über die Panda-Bande“
- `About.tsx` enthält jetzt Geschichte, Mission, Werte, Ansprechpartnerin und Teamkarten
- Separate `Team`-Sektion und `Team.tsx` entfernt
- Hero-Gründerin-Badge entfernt (keine Wiederholung)

### 2. CTA-Optimierung
- `SectionCta` aus Usps, Services, Process, Gallery, Testimonials, Team, News, FAQ entfernt
- Behalten: Header CTA, Sticky Bottom CTA (CMS-Label), WhatsApp-Float
- Telefon nur noch in Kontaktbereich und Footer

### 3. Hero-Vertrauen
- Bewertungs-Pille bei vorhandenen Reviews (Sterne + Durchschnitt)
- Fallback: 5-Sterne + „Vertrauen von Familien in NRW“
- Trust-Badges CMS: Antwort 24h, NRW, Flexible Buchung, Individuelle Betreuung

### 4. Leistungen
- Einheitliche Bildfläche (16:10) mit Fallback
- Optional `priceFrom` und `highlights[]` (CMS + Migration)
- Gleiche Kartenhöhe via `card-equal` / `service-card`

### 5. CMS-Erweiterungen
- `SiteContactSettings`: `responseTime`, `openingHours`
- Admin Inhalte: Kontaktfelder, öffentliches Team-Editor
- Migration: `supabase/migrations/20260711_public_website_rc5.sql`

### 6. Weitere Polish
- FAQ Grid-Animation (`faq-panel-open/closed`)
- Galerie Fallback-Bilder
- Footer: Cookie-Einstellungen (`CookieSettingsButton`)
- Mobile Safe-Area für Floats und Cookie-Banner

## Performance & SEO

- Keine zusätzlichen Client-Bundles für entfernte Section-CTAs
- Hero-Bild weiterhin `priority`, Galerie/Team `loading="lazy"`
- JSON-LD, Sitemap, robots, Meta unverändert funktionsfähig
- Bewertungs-Aggregat im Schema nur bei echten freigegebenen Reviews

## UX-Verbesserungen

- Weniger visuelle Wiederholungen → klarerer Lesefluss
- Ein Anker `#ueber-uns` für gesamte Markenstory
- Kontaktbereich mit Antwortzeit-Hinweis für Conversion-Vertrauen

## Offene TODOs

- [ ] CMS: Leistungen `price_from` / `highlights` im Admin Services-View editierbar
- [ ] Optional: Google Maps Embed im Kontaktbereich (aktuell Link)
- [ ] Lighthouse-Messung auf Production nach Deploy
- [ ] Legacy `lib/trust-badges.ts` / `lib/usps.ts` auf reine `iconKey`-Struktur refactoren

## Verifikation

```bash
npm run lint
npm run typecheck
npm run build
```

## Geänderte Hauptdateien

- `src/app/page.tsx`
- `components/sections/About.tsx`, `Hero.tsx`, `Services.tsx`, `Faq.tsx`, …
- `components/layout/FloatingContactButtons.tsx`, `StickyCtaBar.tsx`, `Footer.tsx`
- `lib/cms/types.ts`, `defaults.ts`, `data.ts`
- `components/admin/views/ContentView.tsx`
- `supabase/migrations/20260711_public_website_rc5.sql`
