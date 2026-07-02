# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

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
