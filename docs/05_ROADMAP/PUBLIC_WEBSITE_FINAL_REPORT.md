# Public Website Final Sprint — Report

**Version:** 0.9.0-rc.10  
**Branch:** `cursor/public-website-final-e022`  
**Datum:** 2026-07-05

## Ziel

Die öffentliche Panda-Bande Website modern, hochwertig, vertrauenswürdig und maximal auf Anfragen optimieren — ohne bestehende Funktionen zu brechen.

---

## Sprint 1 — Conversion

| Feature | Status |
|---------|--------|
| Sticky CTA „Jetzt unverbindlich anfragen" | ✅ `StickyCtaBar` |
| Floating WhatsApp + Telefon | ✅ `FloatingContactButtons` (gestapelt, kein Überlappen) |
| Section-CTAs nach großen Abschnitten | ✅ `SectionCta` |
| Vereinfachtes Kontaktformular | ✅ Name, Telefon, E-Mail, Datum, Art, Nachricht, Kinderanzahl optional |
| Erfolgsnachricht 24h | ✅ |
| Trust-Badges Kostenlos/Unverbindlich/Schnelle Rückmeldung | ✅ |

---

## Sprint 2 — Vertrauen

| Feature | Status |
|---------|--------|
| Warum Panda-Bande (6 Karten) | ✅ USPs erweitert, `#warum-panda-bande` |
| Bewertungen | ✅ Bestehend + Section-CTA |
| Team-Bereich | ✅ `Team.tsx`, CMS `publicTeam` |
| Ablauf 5 Schritte | ✅ Defaults aktualisiert (Anfrage → Glückliche Kinder) |

---

## Sprint 3 — Inhalte

| Feature | Status |
|---------|--------|
| Leistungen mit Detail-Modal | ✅ Button „Mehr erfahren", `detail_text` in CMS |
| Galerie-Filter | ✅ Kindergeburtstag, Hochzeit, Firmenevent, Stadtfest, Sommerfest |
| Beiträge-Karten | ✅ Bild, Titel, Beschreibung, „Mehr lesen" |
| Alt-Texte | ✅ Automatisch aus CMS-Titeln |

---

## Sprint 4 — SEO

| Feature | Status |
|---------|--------|
| Meta Title / Description | ✅ Pro Seite + Root |
| Open Graph / Twitter | ✅ |
| Canonical | ✅ |
| robots.txt | ✅ `src/app/robots.ts` |
| sitemap.xml | ✅ `src/app/sitemap.ts` |
| Manifest / Icons | ✅ `manifest.ts`, SVG-Icon |
| Structured Data | ✅ LocalBusiness, Organization, FAQ, Service, Breadcrumb, AggregateRating |

---

## Sprint 5 — Polish

| Feature | Status |
|---------|--------|
| Dezente Animationen | ✅ ScrollReveal, Hover/Active auf Buttons |
| Einheitliche Button-/Kartenhöhen | ✅ `btn-equal`, `card-equal` |
| Mobile Padding für Sticky CTA | ✅ `public-main` |
| Lazy Loading Bilder | ✅ Gallery, News, Services, Team |

---

## Bonus

| Feature | Status |
|---------|--------|
| Cookie-Banner DSGVO | ✅ `CookieBanner` |
| Google Maps Link | ✅ `mapsUrl` in Kontakt + Footer |
| Klickbare Tel/Mail/WhatsApp | ✅ |
| Footer erweitert | ✅ Navigation, Kontakt, Rechtliches, Social |

---

## CMS (minimal erweitert)

- `publicTeam` — Teammitglieder (Name, Rolle, Beschreibung, Foto)
- `sections.team` — Überschrift Team-Bereich
- `contact.facebook`, `contact.mapsUrl`
- `cms_services.detail_text`, `image_url`, `button_label` (Migration)

Admin-Inhalte weiterhin über bestehende Views; Team-Überschrift in ContentView.

---

## Verifikation

- [x] `npm run build`
- [x] `npm run lint` (nur bestehende Admin-Warnungen)

---

## Wichtige Dateien

- `components/layout/PublicChrome.tsx` — Sticky CTA, Floats, Cookie
- `components/ui/InquiryForm.tsx` — Vereinfachtes Formular
- `components/sections/Team.tsx`, `Services.tsx`, `Gallery.tsx`
- `lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`
- `supabase/migrations/20260709_public_website_cms.sql`
