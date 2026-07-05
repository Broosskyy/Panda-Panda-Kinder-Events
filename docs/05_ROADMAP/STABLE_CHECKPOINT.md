# Stable Project Checkpoint — v0.8.7

**Datum:** 2026-07-05  
**Commit-Basis:** `main` nach Merge PR #18 (Live Website CMS Consistency Cleanup)  
**Zweck:** Verifizierter, dokumentierter Arbeitsstand als stabile Basis für den nächsten Sprint.

---

## Projektstatus

| Kennzahl | Wert |
|----------|------|
| Version | `0.8.7` |
| Framework | Next.js 15.5.x (App Router) |
| Styling | Tailwind CSS 4 |
| CMS/Backend | Supabase (Admin, Storage, Analytics) |
| Deployment | Vercel — https://panda-bande-events.de |
| Produktion | PR #16–#18 gemerged auf `main` |

---

## Verifikation (Checkpoint)

| Check | Ergebnis | Datum |
|-------|----------|-------|
| `git status` | Clean working tree | 2026-07-05 |
| `npm run lint` | **Bestanden** | 2026-07-05 |
| `npm run build` | **Bestanden** (25 Routen) | 2026-07-05 |
| `npm run live:verify` | Nicht aus Cloud-Agent ausführbar (DNS) | — |

```bash
npm run lint
npm run build
npm run live:verify   # lokal nach Deploy empfohlen
```

---

## Was in diesem Stand stabil ist

### Öffentliche Website
- Single-Page Landing (`/`) mit force-dynamic CMS-Binding
- Hero, Kontakt, Footer, Über uns, Leistungen, FAQ, Galerie aus CMS (kein Partial-Merge mit `config/site.ts`)
- Bewertungen server-seitig geladen (`fetchApprovedReviews`)
- `/aktuelles` Index + dynamische Beitragsseiten
- Impressum/Datenschutz mit CMS-Kontaktdaten
- Ein DOM-Element für Hero-Badge, Header-Logo, Footer-Logo

### Admin & CMS
- Inhalte: Hero, Kontakt, Über uns, Footer
- Leistungen, FAQ, Galerie, Beiträge, Bewertungen, Anfragen
- Uploads mit Storage-Pfad-Normalisierung (`resolveImageUrl`, `toStoragePath`)
- Revalidation nach jedem Speichern (`revalidatePublicCms`)
- Analytics-Dashboard mit RPC-Fallbacks

### Tooling
- `scripts/live-verify.mjs` — automatisierte Live-Smoke-Tests
- ESLint 9 + `eslint-config-next`
- Sprint-Reports unter `docs/05_ROADMAP/`

---

## Abgeschlossene Sprints (Kurzüberblick)

| Version | Sprint | PR | Status |
|---------|--------|-----|--------|
| 0.8.4 | Critical Stabilization | #16 | ✅ Merged |
| 0.8.5 | Final Stabilization (Reviews) | #17 | ✅ Merged |
| 0.8.6 | Live Website CMS Cleanup | #18 | ✅ Merged |
| 0.8.7 | Stable Checkpoint | — | ✅ Dieser Stand |

---

## Offene Punkte

### Infrastruktur (vor Go-Live)
1. **Statistik:** Migration `supabase/migrations/20260703_page_views_analytics.sql` auf Production ausführen
2. **Env Vercel:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD`
3. **Live-Verify:** `npm run live:verify` lokal gegen Production nach jedem Deploy

### CMS-Inhalte (manuell im Admin)
4. Kaputten `introText` in Über uns prüfen/korrigieren (falls durch alte Name-Injection beschädigt)
5. Echte Kontaktdaten, Fotos, Leistungstexte, Galerie-Bilder im CMS pflegen
6. Rechtstexte (Impressum, Datenschutz, AGB) rechtlich finalisieren

### Qualität vor Veröffentlichung
7. Open Graph Bild (`og:image`) in `layout.tsx` ergänzen
8. Echte Fotos statt Unsplash-Platzhalter (Hero, About)
9. Lighthouse Mobile Performance messen
10. Formular-Spam-Schutz prüfen (Honeypot/Rate-Limit)

Siehe auch: [Quality-Gap-Review.md](Quality-Gap-Review.md), [Live-Cleanup-Bugfix-Report.md](Live-Cleanup-Bugfix-Report.md)

---

## Nächster Sprint: Pixel Perfect P1

**Branch:** `feature/pixel-perfect-p1`  
**Ziel:** UI pixelnah zum Mockup bringen — ohne neue Features, Fokus auf visuelle Präzision.

### Empfohlene Prioritäten

| Prio | Bereich | Aufgabe |
|------|---------|---------|
| P1 | Hero | Mockup-Abgleich: Typografie, Abstände, Bild-Ratio, Badge-Position |
| P1 | Header | Navigation-Spacing, Scroll-State, Mobile-Menü-Feinschliff |
| P1 | Leistungen | Karten-Layout, Icon-Größen, Swipe-Track vs. Grid |
| P1 | Kontakt | Formular-Luxury-Styling, Kontakt-Karten-Alignment |
| P2 | Footer | Spalten-Raster, Social-Pills, Tagline-Typografie |
| P2 | Galerie | Tile-Ratios, Hover, Lightbox-Übergang |
| P2 | Global | Section-Padding, Flower-Ornamente, Trust-Chips |

### Referenz-Dokumente
- [Report-Mockup-Abgleich.md](../03_FEATURES/Report-Mockup-Abgleich.md)
- [Design-Review-Report.md](Design-Review-Report.md)
- [Sprint-Report-Premium-Design-V3.md](Sprint-Report-Premium-Design-V3.md)

### Empfohlener Start-Prompt

```
PIXEL PERFECT SPRINT P1 — Mockup-Abgleich

Keine neuen Features. Kein CMS-Refactoring.
Nur visuelle Präzision: Hero, Header, Leistungen, Kontakt.

1. Mockup vs. Live vergleichen (Report-Mockup-Abgleich.md)
2. Abweichungen dokumentieren
3. CSS/Tailwind-Fixes minimal und gezielt
4. Mobile Portrait + Desktop prüfen
5. npm run build && npm run lint
6. CHANGELOG + Sprint-Report aktualisieren
```

---

## Wichtige Pfade

```
src/app/page.tsx              — Landing Page (CMS-Props)
lib/cms/data.ts               — CMS-Fetch + Settings
components/sections/          — Öffentliche Sektionen
components/layout/            — Header, Footer, WhatsAppFab
src/app/admin/                — Admin-Bereich
scripts/live-verify.mjs       — Live-Smoke-Tests
supabase/migrations/          — DB-Schema
```

---

*Checkpoint erstellt am 2026-07-05 — stabile Basis für `feature/pixel-perfect-p1`.*
