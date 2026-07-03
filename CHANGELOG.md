# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [0.7.0] — 2026-07-03

### Sprint A — Final UI / Design Polish (V1.0 Candidate)

Premium-Agentur-Niveau für UI/UX — ausschließlich Design, keine Backend-Änderungen.

#### Design System
- `--ease-premium` Easing, einheitliche Micro-Interactions
- Premium Utilities: `icon-wrap`, `trust-chip`, `gallery-tile`, `step-circle`, `review-card`, `faq-item`, `social-pill`, `form-luxury`, `section-warm`
- Card-Hover: translate statt scale, `card-static` für statische Cards
- `lib/design.ts` mit `ICON_STROKE` Konstante

#### UI Polish
- **Hero:** Atmosphären-Gradient, Premium Trust-Chips, mehr Desktop-Whitespace
- **Header:** Eleganterer Scroll-Blur und Nav-Transitions
- **Buttons:** Apple-niveau Hover (translate, 500ms easing)
- **SectionHeading:** Gradient-Divider, harmonisierte Typo
- **Leistungen / USPs:** Icon-Container, ruhigeres Grid
- **Process:** Step-Circles mit Ring-Glow, dezente Timeline
- **Galerie:** Hover-Gradient-Overlay, Boutique-Transitions
- **Bewertungen:** Emotionale Cards, größere Sterne, Premium Empty State
- **About:** `about-image-frame`, wärmere Mission-Karten
- **FAQ:** Kreis-Toggle mit Primary Open-State
- **Kontakt:** Luxuriöser Formular-Rahmen
- **Footer:** Social-Pills, Gradient-Overlay, weniger Redundanz

#### Dokumentation
- `docs/05_ROADMAP/Design-Review-Report.md`

## [0.6.0] — 2026-07-03

### Responsive / Mobile Bugfix Sprint

Mobile-first Überarbeitung von Layout, Abständen und Typografie. Keine neuen Features, keine Änderungen an Supabase, Resend, Admin oder Formularlogik.

#### Global
- `overflow-x: clip` gegen horizontalen Scroll
- Kompaktere `section-padding` / `section-padding-lg` auf Mobile
- `.swipe-bleed` für Carousel-Bereiche ohne Viewport-Overflow
- Mobile Card-Radius 18px, reparierter `prefers-reduced-motion` Block

#### Header
- Niedrigere Mobile-Höhe (`h-16`), kompakteres Logo
- CTA im Header erst ab `md`
- Burger-Menü 48×48px Touchfläche

#### Hero
- Kompakteres Padding und Typografie
- Bild früher sichtbar, begrenzte Mobile-Höhe
- Lisa-Badge im normalen Flow auf Mobile (kein Overlap)
- Trust-Badges als 2×2 Chips

#### Sections
- SectionHeading, Cards, Buttons: Mobile-optimierte Größen
- Services, Galerie, Bewertungen: `swipe-bleed` statt negative Margins
- Process: kompaktere vertikale Timeline
- Footer, About, Contact, Usps: reduzierte Abstände

#### Dokumentation
- `docs/05_ROADMAP/Mobile-Bugfix-Report.md`
- `docs/05_ROADMAP/Quality-Gap-Review.md`
- `docs/05_ROADMAP/Sprint-Reports.md` — Direkt-Download-Übersicht aller Sprint-Berichte

## [0.5.0] — 2026-07-02

### Final Premium Design Sprint V3 (Pixel Perfect)

Visuelles Feintuning auf Boutique-Agentur-Niveau — ausschließlich Design/UI/UX. Keine neuen Features, keine Änderungen an Supabase, Resend, Admin oder Formularlogik.

#### Hero (Schwerpunkt)
- Größeres emotionales Bild mit Overflow-Effekt und Hero-Schatten
- „Hallo, ich bin Lisa!"-Badge schwebt über dem Bild
- Blumenornamente, mehr Weißraum, kürzerer Text
- Stärkere CTAs mit Premium-Schatten

#### Design System V3
- Erweiterte Schatten (`shadow-hero`, `shadow-float`)
- Card-Radius 24px, beige Service-Karten
- Warme Hintergrundtöne (`bg-warm`)
- Floating Labels im Kontaktformular (visuell)
- Footer mit Olive-Gradient

#### Sektionen
- **Header:** Höher, größeres Logo, elegantere Navigation
- **Leistungen:** Beige Premium-Karten, größere Icons
- **Warum Panda-Bande:** Größere Icons, emotionalere Karten
- **Über uns:** Boutique-Layout mit Panda-Akzent
- **Buchungsablauf:** Elegantere Timeline-Verbindungen
- **Galerie:** Instagram-Feeling, langsamer Hover-Zoom
- **Bewertungen:** Airbnb-Niveau, größere Sterne, Panda Empty State
- **FAQ:** Premium Accordion mit animiertem Icon
- **Kontakt:** Luxuriöses Formular mit Floating Labels
- **Footer:** Gradient, Panda-Illustration, größeres Logo

#### Panda-Elemente
- `PandaMascot` in Empty State, Success-Meldungen, Footer, About
- `FlowerOrnament` in Hero, About, Kontakt

#### Design-Philosophie
- Mockup als Stil- und Markenreferenz, nicht als starres Pixel-Template
- UX-Verbesserungen dort, wo das Mockup suboptimal ist (z. B. FAQ ohne schwere Karten, Hero-Badge mobil oben)

#### Mockup-Abgleich & UX-Optimierungen
- Hero Lisa-Badge: unten links (Desktop/Mockup), oben (Mobile/Lesbarkeit)
- USPs Desktop: leichte Icon-Zeile statt schwerer Karten
- Leistungen: weiße Karten mit feiner Linie (Mockup-Stil)
- FAQ: minimalistisches Accordion mit Trennlinien
- Bewertungen Desktop: Pfeil-Navigation bei mehr als 3 Einträgen
- Hintergrund `#faf9f6` (Mockup-Wärme)


## [0.4.0] — 2026-07-02

### Accessibility / Barrierefreiheit Sprint

Gezielter Barrierefreiheits-Check ohne neue Features. Ziel: bessere Nutzbarkeit auf Mobile und Desktop, Lighthouse Accessibility 95+.

#### Kontraste & Farben
- Dunklere Textfarben (`text-secondary`, `text-muted`, `text-placeholder`) für WCAG AA
- Footer-Kontraste verbessert (`white/80`, `white/90`)
- Gold-Akzent für Sterne dunkler (`#b8922e`)

#### Tastatur & Focus
- Globaler sichtbarer `:focus-visible` Outline
- Skip-Link „Zum Hauptinhalt springen"
- Escape schließt Burger-Menü und Lightbox
- Focus-Management beim Öffnen/Schließen von Menü und Lightbox

#### ARIA & Semantik
- FAQ: `aria-controls`, `aria-expanded`, `aria-labelledby`
- Swipe-Bereiche: `role="region"` mit beschreibenden Labels
- Formulare: `aria-invalid`, `aria-describedby`, `role="alert"`, `aria-live`
- Sterne: `role="img"` / `role="radiogroup"`
- `main id="main-content"` für Skip-Link

#### Touch & Typografie
- Mindest-Touchflächen 44–52px für Buttons, FAQ, Formulare
- Body 16px, Labels und Buttons in `text-base`
- Hero Trust-Badges mindestens `text-sm`

#### Motion
- `prefers-reduced-motion` — Animationen deaktiviert/reduziert
- ScrollReveal respektiert Systemeinstellung

#### Dokumentation
- `docs/05_ROADMAP/Sprint-Report-Accessibility.md`
- `docs/05_ROADMAP/Sprint-Report-Premium-UI-UX-V2.md`

---

## [0.3.0] — 2026-07-02

### Premium UI/UX Sprint V2

Visuelles und UX-Upgrade auf Premium-Niveau (Apple × Airbnb × Boutique). Keine neuen Features — alle bestehenden Funktionen (Supabase, Resend, Admin, Bewertungen, Kontaktformular) bleiben erhalten.

#### Design System
- Konsequente Farbpalette: Olive Green, Warm Beige, Soft Gold
- Einheitliche Premium-Karten (`.card-premium`) mit Radius, Schatten, Hover
- Verbesserte Typografie, Zeilenhöhen und Weißraum
- Dezente Scroll-Reveal-Animationen

#### Mobile First
- Leistungen: horizontaler Swipe-Slider mit größeren Icons und Texten
- Buchungsablauf: vertikale Timeline mit Verbindungslinie
- Galerie: Swipe-Galerie mit Lightbox
- Bewertungen: horizontaler Swipe mit großen Karten
- Größere Touch-Targets, Thumb-friendly Buttons, Safe-Area für WhatsApp-FAB

#### Sektionen
- **Header:** Größeres Logo, Sticky mit Blur, aktive Navigation, elegantes Burger-Menü
- **Hero:** Mockup-nah mit emotionalem Bild, Lisa-Karte, Trust-Badges
- **Warum Panda-Bande:** Vier Premium-USP-Karten
- **Leistungen:** Desktop 4×2 Grid, Mobile Swipe
- **Buchungsablauf:** Desktop 5-Schritte-Timeline, Mobile vertikal
- **Galerie:** Masonry Grid (Desktop), Lightbox, Lazy Loading
- **Bewertungen:** Airbnb-Qualität — Rating-Summary, verifizierte Buchung, Empty State
- **Über uns:** Persönliche Gründerin-Story mit emotionalem Bild
- **FAQ:** Weichere Accordion-Animation, größere Touchflächen
- **Kontakt:** 2-Spalten Desktop, größere Eingabefelder, klarere Success-Meldung
- **Footer:** Erweitert mit Kontakt, Social, Rechtlichem

#### Neue UI-Komponenten
- `Card`, `ScrollReveal`, `StarRating`, `Lightbox`
- `useActiveSection` Hook für aktive Navigation

---

## [0.2.0] — 2026-07-02

### Sprint 1 Polish + Sprint 2 Start

#### Sprint 1 Polish
- **Zentrale Config** unter `src/config/site.ts` mit klar markierten Platzhaltern
- **Originales Logo** aus `public/assets/logo.png` (kein nachgebautes SVG mehr)
- **Instagram-Link** korrigiert auf offizielles Profil
- **Mobile Optimierung:** größere Buttons (min. 48px), bessere Abstände, volle Breite CTAs auf Smartphone
- Platzhalterseiten Impressum, Datenschutz, AGB bestätigt

#### Formular (echte Anfragen)
- API Route `POST /api/inquiry` mit Zod-Validierung
- Speicherung in Supabase (`booking_requests`)
- E-Mail-Benachrichtigung via Resend an `manuel.bauch0705@gmail.com`
- Success- und Fehler-Feedback im UI
- `.env.example` mit allen benötigten Variablen

#### Sprint 2 — Bewertungen
- **Fake-Bewertungen entfernt** aus öffentlicher Anzeige
- Demo-Daten nur in Config (`showDemoReviews: false`)
- **Bewertungsformular:** Name, Event-Art, Sterne 1–5, Text
- Neue Bewertungen mit `approved=false` in Supabase
- Öffentliche Sektion zeigt nur freigegebene Bewertungen
- Leerer Zustand: „Noch keine öffentlichen Bewertungen vorhanden."

#### Admin (`/admin`)
- Geschützt via `ADMIN_PASSWORD` (Cookie-Session)
- Buchungsanfragen anzeigen und Status ändern
- Bewertungen anzeigen, freigeben oder ablehnen

#### Supabase
- Schema in `supabase/schema.sql`
- Tabellen: `booking_requests`, `reviews`
- Client in `lib/supabase/admin.ts`

#### Bekannte offene Punkte
- `public/assets/logo.png` muss mit dem originalen Logo befüllt werden
- Supabase-Schema muss im SQL Editor ausgeführt werden
- `.env.local` / Vercel ENV-Variablen müssen gesetzt werden
- Resend: Absender-Domain für Production verifizieren

---

## [0.1.0] — 2026-07-02

### Sprint 1 — MVP Landing Page

#### Hinzugefügt
- **Next.js 15** App Router mit TypeScript und Tailwind CSS 4
- **Single-Page Landing Page** mit allen Mockup-Sektionen
- **Anfrageformular** mit Zod-Validierung (lokal)
- **Platzhalterseiten:** `/impressum`, `/datenschutz`, `/agb`
- **SEO:** Meta-Tags, Open Graph, JSON-LD
- **Design-System** aus Dokumentation

#### Bewusst nicht enthalten
- E-Mail-Versand, Datenbank, Admin (→ Sprint 2)
