# Finale Feature-Liste — Panda-Bande Kinderevents

> Konsolidiert aus Projekt-Report und finalem Mockup.  
> Stand: Juli 2026 — noch keine Implementierung.

Siehe auch: [Report-Mockup-Abgleich](Report-Mockup-Abgleich.md)

---

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Version 1 (V1) — im Mockup, Launch-Scope |
| 🔄 | Version 2 (V2) — nächste Ausbaustufe |
| 🚀 | Version 3 (V3) — Wachstum & Automatisierung |
| 💡 | Version 4+ (V4) — optional, langfristig |
| ❌ | Nicht geplant |

---

## A. Seiten & Layout

| # | Feature | Version | Beschreibung |
|---|---------|---------|--------------|
| A1 | Single-Page Landing Page | ✅ V1 | Alle Hauptinhalte auf einer Seite mit Anker-Navigation |
| A2 | Sticky Header | ✅ V1 | Logo, Navigation, CTA „Jetzt anfragen" — bleibt beim Scrollen sichtbar |
| A3 | Smooth Scroll zu Sektionen | ✅ V1 | Klick auf Nav-Link scrollt sanft zur Sektion |
| A4 | Responsive Design (Mobile-first) | ✅ V1 | Optimiert für Smartphone, Tablet, Desktop |
| A5 | Impressum (eigene Seite) | ✅ V1 | Rechtlich erforderlich, Link im Footer |
| A6 | Datenschutzerklärung (eigene Seite) | ✅ V1 | DSGVO-konform, Link im Footer |
| A7 | AGB (eigene Seite) | ✅ V1 | Allgemeine Geschäftsbedingungen, Link im Footer |
| A8 | 404-Fehlerseite | ✅ V1 | Im Markendesign |
| A9 | Mehrseitige Event-Detailseiten | ❌ | Nicht im Mockup — Leistungen als Karten auf der Landing Page |
| A10 | Blog / Ratgeber | 🔄 V2 | Aus Report: SEO-Inhalte, Checklisten für Eltern |
| A11 | Saisonale Landingpages | 🔄 V2 | z. B. Sommerfest, Weihnachts-Event |
| A12 | Mehrsprachigkeit (EN) | 🚀 V3 | Für internationale Familien |

---

## B. Sektionen der Landing Page

| # | Feature | Version | Inhalt (aus Mockup + Report) |
|---|---------|---------|-------------------------------|
| B1 | **Hero** | ✅ V1 | H1 „Panda-Bande Kinderevents", Subline „Glückliche Kinder. Entspannte Eltern." ♡, Beschreibung (Hochzeiten, Geburtstage, liebevolle Betreuung), Primary CTA „Jetzt anfragen", Secondary CTA „Unsere Leistungen", Blob-Bild, Lisa-Profilkarte mit Zitat |
| B2 | **Trust Bar** | ✅ V1 | 4 Badges: Erfahrenes Team · Mit Herz dabei · Sicher & zuverlässig · Bundesweit im Einsatz |
| B3 | **USP / Wertversprechen** | ✅ V1 | 4 Spalten: Liebevolle Betreuung · Kreative Programme · Entspannte Eltern · Zuverlässig & professionell |
| B4 | **Leistungen** | ✅ V1 | 8 Karten im 4×2-Grid mit Icon, Titel, Kurzbeschreibung |
| B5 | **Buchungsablauf** | ✅ V1 | 5 nummerierte Schritte mit Panda-Illustration: 1. Art der Veranstaltung → 2. Adresse → 3. Datum & Uhrzeit → 4. Dauer → 5. Anzahl Kinder. Sprechblase: „Wir kümmern uns um den Rest!" |
| B6 | **Galerie** | ✅ V1 | 5 Fotos mit abgerundeten Ecken, CTA „Mehr Eindrücke auf Instagram" |
| B7 | **Bewertungen** | ✅ V1 | Horizontaler Slider mit Pfeilen, 5-Sterne-Rating, Zitat, Name, Event-Typ, Profilbild |
| B8 | **Über uns** | ✅ V1 | Team, Philosophie, Werte — ergänzt durch Report-Inhalte (Mission, Maskottchen) |
| B9 | **FAQ** | ✅ V1 | Accordion mit Plus/Minus, Beige-Hintergrund |
| B10 | **Kontakt & Anfrage** | ✅ V1 | Zweispaltig: Formular links, Kontaktdaten + großes Logo rechts |
| B11 | **Footer** | ✅ V1 | Olivgrün, Links (Impressum, Datenschutz, AGB), Social Icons (Instagram, WhatsApp) |
| B12 | **Sektions-Trenner** | ✅ V1 | Horizontale Linie mit Herz-Icon und Überschrift zwischen Sektionen |
| B13 | **WhatsApp FAB** | ✅ V1 | Schwebender Button unten rechts, öffnet WhatsApp-Chat |

---

## C. Leistungen (8 Karten)

| # | Leistung | Icon (Line-Art) | Kurzbeschreibung (Entwurf) |
|---|----------|-----------------|---------------------------|
| C1 | Kinderschminken | Pinsel / Palette | Kreative Schmink-Designs für jedes Kinderherz |
| C2 | Hochzeiten | Ringe / Herz | Liebevolle Kinderbetreuung auf eurer Feier |
| C3 | Kindergeburtstage | Kuchen / Kerze | Unvergessliche Geburtstags-Events mit Programm |
| C4 | Firmenevents | Gebäude / Menschen | Familienfreundliche Betreuung bei Firmenfeiern |
| C5 | Feste & Feiern | Konfetti | Betreuung bei Einschulung, Taufe, Jubiläum |
| C6 | Kreative Workshops | Stift / Papier | Basteln, Malen und gemeinsam Gestalten |
| C7 | Spiele & Bewegung | Ball / Figur | Altersgerechte Spiele und Aktivitäten |
| C8 | Individuelle Konzepte | Stern / Zauberstab | Maßgeschneiderte Events nach euren Wünschen |

> Texte und Icons werden vor Implementierung final mit Panda-Bande abgestimmt.

---

## D. Interaktive Elemente

| # | Feature | Version | Details |
|---|---------|---------|---------|
| D1 | Button Hover-States | ✅ V1 | Farbwechsel Primary `#52563E` → `#454D35` |
| D2 | Karten Hover-Effekt | ✅ V1 | Leichter Schatten + translateY(-2px) |
| D3 | FAQ Accordion | ✅ V1 | Auf-/Zuklappen mit Animation (250ms) |
| D4 | Testimonial-Slider | ✅ V1 | Pfeil-Navigation, Touch-Swipe auf Mobile |
| D5 | Mobile Hamburger-Menü | ✅ V1 | Fullscreen- oder Slide-in-Navigation |
| D6 | Scroll-Animationen (Fade-in) | ✅ V1 | Dezente Einblendung beim Scrollen |
| D7 | Header-Schatten beim Scrollen | ✅ V1 | Visuelles Feedback für Sticky Header |
| D8 | Galerie Lightbox | 🔄 V2 | Vollbild-Ansicht beim Klick auf Bild |
| D9 | Interaktiver Buchungs-Wizard | 🔄 V2 | Mehrstufiges Formular statt statischer 5-Schritte-Anzeige |
| D10 | Verfügbarkeitskalender | 🔄 V2 | Freie/belegte Termine wählbar |
| D11 | Live-Chat / KI-Bot | ❌ | Nicht geplant |

---

## E. Anfrageformular

| # | Feld | Version | Pflicht | Typ |
|---|------|---------|---------|-----|
| E1 | Name | ✅ V1 | Ja | Text |
| E2 | Telefon | ✅ V1 | Ja | Tel |
| E3 | E-Mail | ✅ V1 | Ja | E-Mail |
| E4 | Art der Veranstaltung | ✅ V1 | Ja | Dropdown (Hochzeit, Geburtstag, Firmenevent, Sonstiges) |
| E5 | Datum | ✅ V1 | Ja | Datepicker |
| E6 | Uhrzeit | ✅ V1 | Ja | Time |
| E7 | Dauer | ✅ V1 | Nein | Text / Dropdown |
| E8 | Ort / Location | ✅ V1 | Ja | Text |
| E9 | Anzahl der Kinder | ✅ V1 | Ja | Number |
| E10 | Nachricht | ✅ V1 | Nein | Textarea |
| E11 | DSGVO-Einwilligung | ✅ V1 | Ja | Checkbox |
| E12 | Client-seitige Validierung | ✅ V1 | — | Zod-Schema |
| E13 | Server-seitige Validierung | ✅ V1 | — | API Route + Zod |
| E14 | E-Mail an Panda-Bande | ✅ V1 | — | Resend / SendGrid |
| E15 | Bestätigungs-E-Mail an Kunden | 🔄 V2 | — | Automatische Antwort |
| E16 | Spam-Schutz (Honeypot / Rate Limit) | ✅ V1 | — | Einfacher Schutz |

---

## F. FAQ-Inhalte

| # | Frage | Antwort (Entwurf) | Quelle |
|---|-------|-------------------|--------|
| F1 | In welchem Umkreis seid ihr im Einsatz? | Bundesweit — Schwerpunkt NRW. Anfahrt wird individuell besprochen. | Mockup |
| F2 | Wie viele Kinder könnt ihr betreuen? | Abhängig vom Event — in der Regel 5–30 Kinder. Größere Gruppen auf Anfrage. | Mockup |
| F3 | Was kostet ein Event? | Individuell je nach Art, Dauer und Anzahl der Kinder. Unverbindliches Angebot nach Anfrage. | Mockup |
| F4 | Was brauchen wir vor Ort? | Räumlichkeit, ggf. Tische/Stühle, Stromanschluss — Details besprechen wir im Vorgespräch. | Mockup |
| F5 | Geht auch eine kurzfristige Buchung? | Je nach Verfügbarkeit — am besten frühzeitig anfragen, Kurzfristiges ist manchmal möglich. | Mockup |
| F6 | Wie läuft die Stornierung ab? | Stornierungsbedingungen siehe AGB. Bei Fragen einfach melden. | Report |
| F7 | Berücksichtigt ihr Allergien / Besonderheiten? | Ja — bitte bei der Anfrage alle relevanten Infos angeben. | Report |
| F8 | Für welches Alter sind eure Programme? | In der Regel 3–12 Jahre, altersgerecht angepasst. | Report |

---

## G. Bewertungen & Social Proof

| # | Feature | Version | Details |
|---|---------|---------|---------|
| G1 | Statische Testimonials (Slider) | ✅ V1 | 3–6 Einträge als Daten-Array: Sterne, Text, Autor, Event, Bild |
| G2 | Instagram-Link (Galerie-CTA) | ✅ V1 | Button „Mehr Eindrücke auf Instagram" |
| G3 | WhatsApp-Direktkontakt | ✅ V1 | FAB + Kontaktbereich mit Nummer |
| G4 | Instagram im Footer/Kontakt | ✅ V1 | Handle anzeigen und verlinken |
| G5 | Eltern können Bewertungen einreichen | 🚀 V3 | Formular + Moderation |
| G6 | Durchschnittsbewertung anzeigen | 🚀 V3 | Aggregiert aus eingereichten Bewertungen |

---

## H. Design & Branding

| # | Feature | Version | Details |
|---|---------|---------|---------|
| H1 | Farbsystem (Olivgrün `#52563E`, Beige `#F9F7F2`) | ✅ V1 | Aus Mockup |
| H2 | Typografie (Playfair Display, Montserrat, Caveat) | ✅ V1 | Google Fonts |
| H3 | Logo (2 Pandas im Kreis + Wortmarke) | ✅ V1 | SVG, responsive |
| H4 | Line-Art Icons (Lucide/Phosphor) | ✅ V1 | Dünn, 1.5–2px Strich |
| H5 | Blob-Maske Hero-Bild | ✅ V1 | Organische Form via CSS/SVG |
| H6 | Panda-Illustration (Ablauf-Sektion) | ✅ V1 | SVG mit Sprechblase |
| H7 | Blatt-Dekorationen (Kontakt) | ✅ V1 | PNG/SVG |
| H8 | Favicon & Open-Graph-Bild | ✅ V1 | Für Browser und Social Sharing |
| H9 | E-Mail-Template im Markendesign | 🔄 V2 | React Email |

---

## I. Technische Querschnittsfunktionen

| # | Feature | Version | Details |
|---|---------|---------|---------|
| I1 | Next.js 15 + App Router | ✅ V1 | Aus Techstack-Report |
| I2 | TypeScript | ✅ V1 | Durchgängig typisiert |
| I3 | Tailwind CSS 4 + Design-Tokens | ✅ V1 | Farben, Abstände, Radien aus Design-System |
| I4 | SEO (Meta, OG-Tags, Sitemap) | ✅ V1 | Pro Seite |
| I5 | Strukturierte Daten (JSON-LD) | ✅ V1 | LocalBusiness, FAQPage |
| I6 | Bildoptimierung (next/image) | ✅ V1 | WebP, Lazy Loading |
| I7 | Performance (Lighthouse > 90) | ✅ V1 | Core Web Vitals |
| I8 | Barrierefreiheit (WCAG 2.1 AA) | ✅ V1 | Kontraste, Fokus, Alt-Texte, ARIA |
| I9 | Analytics (Plausible/Matomo) | ✅ V1 | Datenschutzkonform |
| I10 | Cookie-Banner | ✅ V1 | Nur wenn Tracking mit Cookies |
| I11 | API Routes (Formular) | ✅ V1 | Next.js Server Actions oder Route Handler |
| I12 | CI/CD (Vercel + GitHub Actions) | ✅ V1 | Preview-Deployments pro PR |
| I13 | Datenbank (Supabase) | 🔄 V2 | Buchungen, Anfragen persistent speichern |
| I14 | Headless CMS (Sanity) | 🚀 V3 | Content-Pflege ohne Entwickler |
| I15 | Stripe-Zahlung | 🚀 V3 | Anzahlungen, Gutscheine |

---

## J. Backend & Verwaltung (spätere Versionen)

| # | Feature | Version | Details |
|---|---------|---------|---------|
| J1 | Admin-Dashboard | 🚀 V3 | Anfragen, Buchungen, Kunden verwalten |
| J2 | E-Mail-Benachrichtigungen (intern) | ✅ V1 | Bei neuer Anfrage |
| J3 | Buchungsstatus-Tracking | 🔄 V2 | Anfrage → Bestätigt → Abgeschlossen |
| J4 | Kalender-Synchronisation | 🔄 V2 | Interne Verfügbarkeit |
| J5 | Kundenbereich (Login) | 🚀 V3 | Buchungshistorie, Rechnungen |
| J6 | Gutschein-System | 🔄 V2 | Kaufen, PDF, Einlösen |
| J7 | Newsletter (Double-Opt-In) | 🔄 V2 | Aus Report |
| J8 | Partner-/Gruppenanfragen | 🚀 V3 | Kitas, Schulen, Firmen |
| J9 | Automatische Rechnungserstellung | 🚀 V3 | Nach Stripe-Zahlung |

---

## K. Nicht im Scope

| Feature | Grund |
|---------|-------|
| E-Commerce-Shop (physische Produkte) | Nicht Teil des Geschäftsmodells |
| Native Mobile App | PWA reicht ggf. in V4 |
| Community-Forum | Kein Bedarf |
| Live-Streaming | Kein Bedarf |
| KI-Chatbot | WhatsApp-Direktkontakt bevorzugt |
| Event-Filter / -Suche | Keine Detailseiten in V1 |

---

## Feature-Matrix nach Version

```
V1 (Launch)                    V2 (Interaktion)           V3 (Wachstum)
─────────────────────────      ─────────────────────      ─────────────────────
Single-Page Landing Page       Galerie Lightbox           Kundenbereich
8 Leistungs-Karten             Interaktiver Buchungs-     Bewertungen einreichen
Anfrageformular (10 Felder)    Wizard
FAQ Accordion                  Verfügbarkeitskalender     Stripe-Zahlung
Testimonial-Slider             Datenbank (Supabase)       Admin-Dashboard
Buchungsablauf (statisch)      Gutscheine                 Headless CMS
Galerie + Instagram-CTA        Blog / Ratgeber            Partner-Anfragen
WhatsApp FAB                   Newsletter                 Mehrsprachigkeit
Impressum / Datenschutz / AGB  E-Mail-Bestätigung
SEO + Analytics                Buchungsstatus
Responsive + Barrierefreiheit  Saisonale Landingpages
```
