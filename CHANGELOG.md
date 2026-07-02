# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [0.1.0] — 2026-07-02

### Sprint 1 — MVP Landing Page

#### Hinzugefügt
- **Next.js 15** App Router mit TypeScript und Tailwind CSS 4
- **Single-Page Landing Page** mit allen Mockup-Sektionen:
  - Sticky Header mit Navigation und Mobile Burger-Menü
  - Hero mit Blob-Bild, Lisa-Profilkarte und Trust Badges
  - USP / Vorteile-Sektion (4 Spalten)
  - Leistungen-Grid (8 Karten)
  - Buchungsablauf in 5 Schritten mit Panda-Illustration
  - Galerie mit Instagram-CTA
  - Bewertungen (Slider mobil, 3 Karten Desktop)
  - Über uns
  - FAQ Accordion (8 Fragen)
  - Kontaktbereich mit Anfrageformular und Kontaktdaten
  - Footer mit Impressum, Datenschutz, AGB
  - Floating WhatsApp Button
- **Anfrageformular** mit Zod-Validierung und lokaler Success-Meldung
- **Platzhalterseiten:** `/impressum`, `/datenschutz`, `/agb`
- **404-Seite** im Markendesign
- **SEO:** Meta-Tags, Open Graph, JSON-LD (LocalBusiness, FAQPage)
- **Design-System:** Farben, Typografie und Komponenten aus `docs/02_BRANDING/Design-System.md`
- **Logo & Panda-Illustration** als SVG
- **Daten-Dateien** in `lib/` für Services, FAQs, Testimonials etc.

#### Technik
- Mobile-first, responsive für Smartphone, Tablet und Desktop
- Vercel-ready (statischer Export-fähiger Build)
- Keine Datenbank, kein Login, kein Backend

#### Bewusst nicht enthalten (spätere Sprints)
- E-Mail-Versand (Formular zeigt lokale Erfolgsmeldung)
- Supabase / Admin / Blog / Event-Katalog
- Galerie Lightbox
