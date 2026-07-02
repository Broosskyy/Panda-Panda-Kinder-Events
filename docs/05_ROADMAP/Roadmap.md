# Roadmap — Panda-Bande Kinderevents

## Übersicht

Diese Roadmap beschreibt die geplanten Entwicklungsphasen für die Panda-Bande Kinderevents Plattform — von der ersten Website bis zur vollständigen Event-Management-Lösung.

Jede Phase baut auf der vorherigen auf und liefert einen nutzbaren Meilenstein.

---

## Phase 0 — Projektgrundlage ✅

**Ziel:** Fundament legen, bevor Code geschrieben wird.

| Aufgabe | Status |
|---------|--------|
| Projektstruktur anlegen | ✅ |
| Vision dokumentieren | ✅ |
| Branding definieren | ✅ |
| Features spezifizieren | ✅ |
| Techstack festlegen | ✅ |
| Roadmap erstellen | ✅ |
| Domain und Hosting vorbereiten | ⬜ |
| Logo und Maskottchen beauftragen / erstellen | ⬜ |
| Event-Fotos und Texte sammeln | ⬜ |

**Ergebnis:** Vollständige Projektdokumentation als Basis für die Entwicklung.

---

## Phase 1 — MVP Website

**Ziel:** Eine professionelle Online-Präsenz, die Vertrauen schafft und Anfragen generiert.

### Meilensteine

#### 1.1 Projekt-Setup
- Next.js-Projekt initialisieren (TypeScript, Tailwind CSS, ESLint)
- Design-Tokens aus Branding in Tailwind-Config übernehmen
- Basis-Layout (Header, Footer, Navigation) erstellen
- Responsive Grid und Typografie-System

#### 1.2 Seiten
- **Startseite** — Hero, Event-Highlights, Vertrauenselemente, CTA
- **Events** — Katalog mit Filter, Detailseiten aus MDX
- **Über uns** — Team, Werte, Maskottchen
- **FAQ** — Accordion mit häufigen Fragen
- **Kontakt** — Formular mit Validierung und E-Mail-Versand
- **Impressum & Datenschutz** — rechtlich erforderliche Seiten

#### 1.3 Komponenten
- Button, Card, Badge, Accordion, Form-Felder
- Event-Card und Event-Detail-Layout
- Hero-Section mit Panda-Maskottchen-Platzhalter
- Testimonial-Slider (statische Daten)

#### 1.4 Inhalte
- Mindestens 5 Event-Pakete als MDX anlegen
- Platzhalter-Bilder durch echte Fotos ersetzen (sobald verfügbar)
- SEO-Meta-Tags für alle Seiten

#### 1.5 Deployment
- Vercel-Deployment einrichten
- Custom Domain verbinden
- Lighthouse-Score > 90 anstreben

**Ergebnis:** Live-Website unter eigener Domain, bereit für erste Kundenanfragen.

---

## Phase 2 — Buchung & Interaktion

**Ziel:** Digitale Buchungsanfragen vereinfachen und Kundenbindung aufbauen.

### Meilensteine

#### 2.1 Buchungssystem
- Mehrstufiges Buchungsformular (Event → Datum → Details → Bestätigung)
- Verfügbarkeitskalender (einfache Version)
- E-Mail-Bestätigung an Kunden und internes Team
- Buchungsstatus: „Anfrage“, „Bestätigt“, „Abgeschlossen“

#### 2.2 Datenbank & Backend
- Supabase einrichten (PostgreSQL, Auth)
- API-Routes für Buchungen und Kontaktanfragen
- Admin-Ansicht (geschützt) für eingehende Anfragen

#### 2.3 Gutscheine
- Gutschein-Kaufformular
- PDF-Generierung und E-Mail-Versand
- Einlösung bei Buchung

#### 2.4 Content-Erweiterung
- Blog / Ratgeber mit mindestens 5 Artikeln
- Newsletter-Anmeldung (Double-Opt-In)
- Saisonale Landingpages (z. B. „Sommerfest“, „Weihnachts-Event“)

#### 2.5 SEO & Marketing
- Google Search Console einrichten
- Strukturierte Daten (JSON-LD) für Events
- Social-Media Open-Graph-Tags

**Ergebnis:** Kunden können Events online anfragen und buchen; Betreiber verwalten Anfragen digital.

---

## Phase 3 — Wachstum & Automatisierung

**Ziel:** Skalierung, Wiederkehrende Kunden und operative Effizienz.

### Meilensteine

#### 3.1 Kundenbereich
- Registrierung und Login
- Buchungshistorie und Rechnungsdownload
- Profilverwaltung

#### 3.2 Bewertungen
- Post-Event-Bewertungsanfrage per E-Mail
- Moderation und Anzeige auf der Website
- Durchschnittsbewertung pro Event

#### 3.3 Zahlungsintegration
- Stripe-Anbindung für Online-Zahlung und Anzahlungen
- Automatische Rechnungserstellung

#### 3.4 Admin-Dashboard
- Vollständige Verwaltung von Events, Buchungen, Kunden
- Kalender mit Kapazitätsplanung
- Statistiken und Exporte
- E-Mail-Vorlagen verwalten

#### 3.5 Erweiterungen
- Partner- / Gruppenanfrage-Formular
- Mehrsprachigkeit (EN)
- Headless CMS (Sanity) für Content-Pflege ohne Entwickler

**Ergebnis:** Vollständige Event-Management-Plattform mit Kundenbindung und Automatisierung.

---

## Phase 4 — Optimierung & Skalierung (optional)

**Ziel:** Kontinuierliche Verbesserung auf Basis echter Nutzungsdaten.

- A/B-Tests für Conversion-Optimierung
- Performance-Tuning (Bilder, Caching, Edge Functions)
- Mobile App evaluieren (PWA als Zwischenschritt)
- Expansion in weitere Regionen
- Franchise- oder Partner-Modell digital unterstützen

---

## Zeitliche Einordnung (grobe Richtung)

```
Phase 0  ████░░░░░░░░░░░░░░░░  Projektgrundlage
Phase 1  ░░░░████████░░░░░░░░  MVP Website
Phase 2  ░░░░░░░░░░░░████████  Buchung & Interaktion
Phase 3  ░░░░░░░░░░░░░░░░████  Wachstum & Automatisierung
Phase 4  ░░░░░░░░░░░░░░░░░░██  Optimierung (laufend)
```

> Die konkrete Dauer hängt von verfügbarer Zeit, Content-Bereitschaft und Prioritäten ab. Jede Phase liefert einen eigenständigen, nutzbaren Meilenstein.

---

## Risiken & Mitigationen

| Risiko | Auswirkung | Gegenmaßnahme |
|--------|------------|---------------|
| Fehlende Event-Fotos | Website wirkt unprofessionell | Platzhalter-Illustrationen im Panda-Stil; Fotoshooting früh planen |
| Rechtliche Anforderungen (DSGVO, Impressum) | Abmahnrisiko | Vor Go-Live rechtlich prüfen lassen |
| Scope Creep | Verzögerung | Strikte MVP-Definition; Features erst nach Phase-Freigabe |
| Keine Buchungen trotz Website | ROI unklar | SEO, lokales Marketing, Google Business parallel aufbauen |
| Technische Schulden | Wartungsaufwand steigt | TypeScript, Tests und Code-Reviews von Anfang an |

---

## Erfolgsmetriken pro Phase

| Phase | KPI |
|-------|-----|
| Phase 1 | Website live, Lighthouse > 90, erste Kontaktanfragen |
| Phase 2 | 10+ Buchungsanfragen/Monat, Newsletter-Abonnenten |
| Phase 3 | 30 % Wiederbuchungsrate, durchschnittlich 4,5+ Sterne |
| Phase 4 | Top-3 bei lokaler Google-Suche für „Kinder Events [Region]“ |

---

## Nächste Schritte

1. Logo und Maskottchen finalisieren
2. Event-Texte und Preise von Panda-Bande erhalten
3. Domain registrieren
4. Phase 1.1 starten: Next.js-Projekt initialisieren
5. Erste Event-Fotos organisieren oder Illustrationen beauftragen
