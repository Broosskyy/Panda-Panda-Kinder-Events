# Report ↔ Mockup Abgleich — Panda-Bande Kinderevents

> **Regel:** Bei Widersprüchen hat das **finale Mockup** Vorrang. Der Projekt-Report dient als Ergänzung für Inhalte, Texte, Struktur und Funktionen.

---

## Zusammenfassung der Konsolidierung

Das Mockup definiert eine **einspaltige Landing Page** mit klarer Sektionsstruktur und hochwertigem „Boho-Nature"-Look. Der ursprüngliche Report ging von einer **mehrseitigen Website** mit Event-Katalog, Filter und Detailseiten aus. Für Version 1 gilt die Mockup-Architektur.

---

## Abweichungen und Auflösung

| Thema | Projekt-Report | Finales Mockup | Entscheidung |
|-------|----------------|----------------|--------------|
| **Seitenarchitektur** | Mehrere Seiten (Events, Über uns, Kontakt) | Eine Landing Page mit Anker-Navigation | ✅ Mockup: Single Page |
| **Event-Katalog** | Filter, Detailseiten, MDX-Pakete | 8 Leistungs-Karten im Grid, keine Detailseiten | ✅ Mockup: Leistungs-Grid |
| **Navigation** | Startseite, Leistungen, Ablauf, Galerie, FAQ, Kontakt | Startseite, Leistungen, Galerie, Bewertungen, Über uns, FAQ, Kontakt | ✅ Mockup: 7 Nav-Punkte |
| **Über uns** | Eigene Seite mit Team & Maskottchen | Eigene Sektion + Lisa-Karte im Hero | ✅ Mockup: Sektion + Hero-Karte |
| **Primärfarbe** | `#555D42` (Design-System) | `#52563E` (Mockup) | ✅ Mockup: `#52563E` |
| **Hintergrund** | `#FDFCF9` | `#F9F7F2` | ✅ Mockup: `#F9F7F2` |
| **Designstil** | Warm Professional Playful | Boho-Nature, hochwertig, nicht knallbunt | ✅ Mockup (verfeinert Report) |
| **Trust Bar** | Erfahrenes Team, Sichere Betreuung, Individuelle Konzepte, Faire Preise | Erfahrenes Team, Mit Herz dabei, Sicher & zuverlässig, Bundesweit im Einsatz | ✅ Mockup-Texte |
| **Reichweite** | Regionale Nähe (Vision/USP) | Bundesweit im Einsatz, NRW/deutschlandweit | ✅ Mockup für Website; Report ergänzt Zielgruppen-Kontext |
| **Hero-Text** | Generische Markenbotschaft | „Glückliche Kinder. Entspannte Eltern." + Hochzeiten/Geburtstage | ✅ Mockup-Texte |
| **Kontaktformular** | 6 Felder (einfach) | 10 Felder (Name, Tel, E-Mail, Event-Typ, Datum, Uhrzeit, Dauer, Ort, Kinderanzahl, Nachricht) | ✅ Mockup: vollständiges Formular |
| **Buchungsprozess** | Phase 2: interaktives Buchungssystem | 5-Schritte-Visualisierung (informativ) | ✅ Mockup in V1; interaktiv ab V2 |
| **Bewertungen** | Phase 3: Bewertungssystem | Testimonial-Slider in V1 (statisch) | ✅ Mockup: Slider in V1, Einreichung ab V3 |
| **Galerie** | Bildergalerie | 5 Bilder + Instagram-CTA | ✅ Mockup |
| **Footer** | Impressum, Datenschutz | Impressum, Datenschutz, **AGB** | ✅ Mockup |
| **FAQ-Themen** | Allgemein (Buchung, Stornierung, Allergien) | Radius, Kinderanzahl, Kosten, Voraussetzungen, Kurzfristbuchung | ✅ Mockup-Themen + Report ergänzt (Allergien, Stornierung) |
| **Logo** | Panda-Gruppe (3–4 Pandas) | Zwei Pandas (Eltern + Kind) im Kreis | ✅ Mockup |
| **Slogan Kontakt** | — | „Mit Herz für kleine Abenteurer. ♡" | ✅ Mockup |
| **WhatsApp FAB** | Erwähnt im Design-System | Grüner Chat-Button unten rechts | ✅ Mockup |
| **USP-Sektion** | In Vision als USPs, nicht als Sektion | 4-Spalten-Sektion unter Hero | ✅ Mockup: eigene Sektion |
| **Blog / Newsletter** | Phase 2 | Nicht im Mockup | ⏳ Spätere Version (Report) |
| **Gutscheine** | Phase 2 | Nicht im Mockup | ⏳ Spätere Version (Report) |
| **Kundenbereich** | Phase 3 | Nicht im Mockup | ⏳ Spätere Version (Report) |
| **Techstack** | Next.js, Tailwind, Vercel, etc. | — (kein Widerspruch) | ✅ Report unverändert |

---

## Vom Report übernommen (Ergänzung)

Diese Inhalte stammen aus dem Report und ergänzen das Mockup, wo es keine visuelle Vorgabe gibt:

| Bereich | Übernommene Inhalte |
|---------|---------------------|
| **Vision** | Mission, Werte, Zielgruppe, Erfolgskriterien, Abgrenzung |
| **Tonalität** | Du-Ansprache, klare Sprache, keine reißerische Werbung |
| **Technik** | Next.js 15, TypeScript, Tailwind CSS 4, Vercel, Zod-Validierung |
| **Rechtliches** | DSGVO-Einwilligung im Formular, Datenschutz, Impressum |
| **SEO** | Meta-Tags, strukturierte Daten, Sitemap, Lighthouse > 90 |
| **Barrierefreiheit** | WCAG 2.1 AA, Kontraste, Alt-Texte, Touch-Targets ≥ 44px |
| **FAQ** | Zusätzliche Fragen zu Allergien, Stornierung, Altersgruppen |
| **E-Mail** | Resend/SendGrid für Formular-Benachrichtigungen |
| **Analytics** | Plausible/Matomo (datenschutzkonform) |
| **Datenstruktur** | Arrays für Services, FAQs, Testimonials (aus Mockup-Anforderung) |

---

## Finale Seitenstruktur (Version 1)

```
Landing Page (Single Page)
├── Header (sticky)
├── #startseite    Hero + Trust Bar
├── #usps          Wertversprechen (4 Spalten)
├── #leistungen    8 Leistungs-Karten
├── #ablauf        5-Schritte-Buchungsprozess
├── #galerie       5 Fotos + Instagram-CTA
├── #bewertungen   Testimonial-Slider
├── #ueber-uns     Team & Philosophie
├── #faq           Accordion
├── #kontakt       Anfrageformular + Kontaktdaten
└── Footer         Impressum · Datenschutz · AGB

Separate Seiten (minimal)
├── /impressum
├── /datenschutz
└── /agb

Floating
└── WhatsApp-FAB (unten rechts)
```
