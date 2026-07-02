# V1 To-do-Liste — Panda-Bande Kinderevents

> **Ziel von V1:** Live-Website als Single-Page Landing Page — pixelnah zum Mockup, funktionsfähiges Anfrageformular, bereit für erste Kundenanfragen.

Stand: Juli 2026 — noch keine Implementierung.

---

## Status-Legende

- ⬜ Offen
- 🔄 In Arbeit
- ✅ Erledigt
- ⏸ Blockiert (Abhängigkeit)

---

## Phase A — Vorbereitung & Assets

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| A1 | Logo als SVG bereitstellen | ⬜ | Panda-Bande | 2 Pandas im Kreis + „PANDA-BANDE — KINDEREVENTS —" |
| A2 | Panda-Illustration (Ablauf-Sektion) | ⬜ | Panda-Bande / Designer | Mit Sprechblase „Wir kümmern uns um den Rest!" |
| A3 | Blatt-Dekorationen (Kontakt) | ⬜ | Designer | PNG oder SVG |
| A4 | Hero-Foto (Blob) | ⬜ | Panda-Bande | z. B. Kinderschminken-Szene, hochauflösend |
| A5 | Lisa-Profilfoto + Zitat-Text | ⬜ | Panda-Bande | Für Hero-Overlay-Karte |
| A6 | 5 Galerie-Fotos | ⬜ | Panda-Bande | Event-Szenen, einheitlicher Stil |
| A7 | 3–6 Testimonial-Einträge | ⬜ | Panda-Bande | Name, Event-Typ, Text, optional Profilbild |
| A8 | Kontaktdaten finalisieren | ⬜ | Panda-Bande | WhatsApp-Nr., Instagram-Handle, E-Mail |
| A9 | Instagram-Profil-URL | ⬜ | Panda-Bande | Für Galerie-CTA und Footer |
| A10 | Rechtstexte (Impressum, Datenschutz, AGB) | ⬜ | Panda-Bande / Anwalt | Vor Go-Live rechtlich prüfen |
| A11 | Domain registrieren | ⬜ | Panda-Bande | z. B. panda-bande-events.de |
| A12 | Leistungs-Texte (8 Karten) finalisieren | ⬜ | Panda-Bande | Titel + Kurzbeschreibung je Leistung |
| A13 | FAQ-Antworten finalisieren | ⬜ | Panda-Bande | 8 Fragen aus Feature-Liste |
| A14 | „Über uns"-Texte | ⬜ | Panda-Bande | Team, Philosophie, Werte |

---

## Phase B — Projekt-Setup

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| B1 | Next.js 15 Projekt initialisieren | ⬜ | — | TypeScript, App Router, ESLint |
| B2 | Tailwind CSS 4 einrichten | ⬜ | B1 | Design-Tokens aus Design-System |
| B3 | Design-Tokens in Tailwind-Config | ⬜ | B2 | Farben, Spacing, Radien, Schatten, Fonts |
| B4 | Google Fonts einbinden | ⬜ | B1 | Playfair Display, Montserrat, Caveat |
| B5 | Ordnerstruktur anlegen | ⬜ | B1 | `src/app/`, `components/`, `lib/`, `public/` |
| B6 | ESLint + Prettier konfigurieren | ⬜ | B1 | Einheitliche Code-Formatierung |
| B7 | Umgebungsvariablen (.env.local) | ⬜ | B1 | E-Mail-API-Key, ggf. Analytics |
| B8 | Git-Branching-Strategie | ⬜ | B1 | main + feature branches |
| B9 | Vercel-Projekt verbinden | ⬜ | B1, A11 | Preview-Deployments |

---

## Phase C — UI-Komponenten (Design System)

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| C1 | `Button` (Primary, Secondary) | ⬜ | B3 | Pill-Form, Hover, Icon-Slot |
| C2 | `SectionHeading` (mit Herz-Trenner) | ⬜ | B3 | Playfair Display, Linie + Icon |
| C3 | `Card` (Service, Testimonial) | ⬜ | B3 | Varianten für Leistungen und Bewertungen |
| C4 | `Accordion` (FAQ) | ⬜ | B3 | Plus/Minus, Animation, ARIA |
| C5 | `Input`, `Textarea`, `Select` | ⬜ | B3 | Formular-Felder mit Label, Fehler-State |
| C6 | `Checkbox` (DSGVO) | ⬜ | B3 | Olivgrün when checked |
| C7 | `TrustBadge` | ⬜ | B3 | Icon + Text, horizontal/Grid |
| C8 | `ProcessStep` | ⬜ | B3 | Nummer-Kreis, Titel, gestrichelte Verbindung |
| C9 | `TestimonialSlider` | ⬜ | B3, C3 | Pfeile, Touch-Swipe, Auto-Play optional |
| C10 | `TeamCard` (Lisa-Overlay) | ⬜ | B3 | Profilbild, Name, Zitat |
| C11 | `WhatsAppFAB` | ⬜ | B3 | Fixed, unten rechts |
| C12 | `BlobImage` | ⬜ | B3 | Organische Maske für Hero |
| C13 | `Header` (Sticky) | ⬜ | C1 | Logo, Nav, CTA, Mobile Menu |
| C14 | `Footer` | ⬜ | C1 | Olivgrün, Links, Social Icons |
| C15 | `MobileMenu` | ⬜ | C13 | Hamburger, Overlay, Smooth Scroll Links |

---

## Phase D — Sektionen der Landing Page

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| D1 | **Hero-Sektion** | ⬜ | C1, C10, C12, A4, A5 | H1, Subline, CTAs, Blob-Bild, Lisa-Karte |
| D2 | **Trust Bar** | ⬜ | C7 | 4 Badges unter Hero |
| D3 | **USP-Sektion** | ⬜ | C3 | 4 Spalten Wertversprechen |
| D4 | **Leistungen-Sektion** | ⬜ | C3, A12 | 8 Karten im 4×2-Grid |
| D5 | **Ablauf-Sektion** | ⬜ | C8, A2 | 5 Schritte + Panda-Illustration |
| D6 | **Galerie-Sektion** | ⬜ | A6, A9 | 5 Bilder + Instagram-CTA |
| D7 | **Bewertungen-Sektion** | ⬜ | C9, A7 | Testimonial-Slider |
| D8 | **Über uns-Sektion** | ⬜ | A14 | Team, Philosophie, Werte |
| D9 | **FAQ-Sektion** | ⬜ | C4, A13 | Accordion auf Beige-Hintergrund |
| D10 | **Kontakt-Sektion** | ⬜ | C5, C6, A3, A8 | Formular + Kontaktdaten + Logo |
| D11 | **Landing Page zusammenbauen** | ⬜ | D1–D10, C13, C14 | Alle Sektionen in `page.tsx` mit Anker-IDs |

---

## Phase E — Daten & Inhalte

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| E1 | `services.ts` — Array der 8 Leistungen | ⬜ | A12 | `{ icon, title, description }` |
| E2 | `faqs.ts` — Array der FAQ-Einträge | ⬜ | A13 | `{ question, answer }` |
| E3 | `testimonials.ts` — Array der Bewertungen | ⬜ | A7 | `{ stars, text, author, event, image? }` |
| E4 | `processSteps.ts` — 5 Buchungsschritte | ⬜ | — | `{ number, title, description }` |
| E5 | `trustBadges.ts` — 4 Trust-Elemente | ⬜ | — | `{ icon, text }` |
| E6 | `usps.ts` — 4 Wertversprechen | ⬜ | — | `{ icon, title, description }` |
| E7 | `navigation.ts` — Nav-Links | ⬜ | — | `{ label, href }` — 7 Einträge |
| E8 | `siteConfig.ts` — globale Config | ⬜ | A8, A9 | Kontakt, Social, Meta |

---

## Phase F — Formular & Backend

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| F1 | Zod-Schema für Anfrageformular | ⬜ | — | 10 Felder + DSGVO-Checkbox |
| F2 | Client-seitige Validierung | ⬜ | F1, C5 | Inline-Fehlermeldungen |
| F3 | API Route / Server Action | ⬜ | F1 | POST-Endpoint für Formular |
| F4 | E-Mail-Versand (Resend/SendGrid) | ⬜ | F3, B7 | Benachrichtigung an Panda-Bande |
| F5 | Honeypot-Feld (Spam-Schutz) | ⬜ | F3 | Verstecktes Feld |
| F6 | Rate Limiting | ⬜ | F3 | Max. Anfragen pro IP/Zeitraum |
| F7 | Erfolgs-/Fehler-Feedback (UI) | ⬜ | F3 | Toast oder Inline-Nachricht nach Absenden |
| F8 | DSGVO-Checkbox mit Link zu Datenschutz | ⬜ | F1, A10 | Pflichtfeld |

---

## Phase G — Rechtliches & SEO

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| G1 | Seite `/impressum` | ⬜ | A10 | Eigene Route, Footer-Link |
| G2 | Seite `/datenschutz` | ⬜ | A10 | Eigene Route, Footer-Link |
| G3 | Seite `/agb` | ⬜ | A10 | Eigene Route, Footer-Link |
| G4 | Meta-Tags (Title, Description) | ⬜ | D11 | Pro Seite, Open Graph |
| G5 | `robots.txt` + `sitemap.xml` | ⬜ | D11 | Automatisch via Next.js |
| G6 | JSON-LD: LocalBusiness | ⬜ | E8 | Strukturierte Daten |
| G7 | JSON-LD: FAQPage | ⬜ | E2 | Für FAQ-Sektion |
| G8 | Favicon + OG-Image | ⬜ | A1 | `public/` |
| G9 | 404-Seite im Markendesign | ⬜ | B3 | `not-found.tsx` |
| G10 | Cookie-Banner (falls nötig) | ⬜ | — | Nur bei cookie-basiertem Tracking |

---

## Phase H — Responsive & Qualität

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| H1 | Mobile Layout (alle Sektionen) | ⬜ | D11 | Hamburger, 1-spaltig, volle Breite Buttons |
| H2 | Tablet Layout | ⬜ | D11 | 2-spaltige Grids |
| H3 | Smooth Scroll + aktiver Nav-Link | ⬜ | C13 | Highlight der aktuellen Sektion |
| H4 | Scroll-Animationen (Fade-in) | ⬜ | D11 | Framer Motion oder CSS |
| H5 | Alt-Texte für alle Bilder | ⬜ | A4–A7 | Barrierefreiheit |
| H6 | ARIA-Labels (Accordion, Slider, Menu) | ⬜ | C4, C9, C15 | Screenreader-tauglich |
| H7 | Lighthouse-Audit (Score > 90) | ⬜ | D11 | Performance, SEO, A11y, Best Practices |
| H8 | Cross-Browser-Test | ⬜ | D11 | Chrome, Firefox, Safari, Mobile |
| H9 | Formular End-to-End-Test | ⬜ | F7 | Anfrage absenden → E-Mail erhalten |

---

## Phase I — Deployment & Launch

| # | Aufgabe | Status | Abhängigkeit | Details |
|---|---------|--------|--------------|---------|
| I1 | Vercel Production Deployment | ⬜ | B9, D11 | Build erfolgreich |
| I2 | Custom Domain verbinden | ⬜ | A11, I1 | DNS-Einträge |
| I3 | SSL-Zertifikat (automatisch via Vercel) | ⬜ | I2 | HTTPS |
| I4 | Analytics einrichten (Plausible) | ⬜ | I1 | Tracking-Snippet |
| I5 | Google Search Console | ⬜ | I2 | Sitemap einreichen |
| I6 | Finaler Content-Review mit Panda-Bande | ⬜ | Alle Inhalte | Texte, Bilder, Kontaktdaten |
| I7 | Go-Live Checkliste abhaken | ⬜ | H7, H9, G1–G3 | Rechtlich, technisch, inhaltlich |

---

## Go-Live Checkliste

```
□ Alle Texte und Bilder final eingepflegt
□ Formular sendet E-Mails zuverlässig
□ Impressum, Datenschutz, AGB online und verlinkt
□ DSGVO-Checkbox funktioniert
□ Mobile Navigation getestet
□ WhatsApp-FAB verlinkt korrekt
□ Instagram-CTA verlinkt korrekt
□ Lighthouse Score > 90 (alle Kategorien)
□ Domain erreichbar mit HTTPS
□ Analytics trackt (falls gewünscht)
□ 404-Seite funktioniert
□ Cross-Browser getestet
```

---

## Abhängigkeitsgraph (vereinfacht)

```
Phase A (Assets) ──────────────────────────────────┐
                                                    ▼
Phase B (Setup) ──► Phase C (Komponenten) ──► Phase D (Sektionen)
                              │                        │
Phase E (Daten) ──────────────┘                        │
                                                       ▼
                              Phase F (Formular) ◄── Phase D
                                       │
                              Phase G (Recht/SEO)
                                       │
                              Phase H (Qualität)
                                       │
                              Phase I (Launch)
```

---

## Priorisierung bei Ressourcenmangel

Wenn nicht alles parallel möglich ist, in dieser Reihenfolge abarbeiten:

1. **B1–B5** — Projekt-Setup (technische Basis)
2. **C1, C13, C14** — Button, Header, Footer (Grundgerüst)
3. **D1, D4, D10** — Hero, Leistungen, Kontakt (wichtigste Sektionen)
4. **F1–F7** — Formular funktionsfähig (Kernziel V1)
5. **D2, D3, D9** — Trust, USPs, FAQ (Vertrauen)
6. **D5–D8** — Ablauf, Galerie, Bewertungen, Über uns
7. **G1–G3** — Rechtliche Seiten (vor Go-Live Pflicht)
8. **H1–H9** — Responsive, Tests, Qualität
9. **I1–I7** — Deployment & Launch
