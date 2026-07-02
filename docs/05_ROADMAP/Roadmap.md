# Roadmap — Panda-Bande Kinderevents

> Konsolidiert aus Projekt-Report und finalem Mockup.  
> Stand: Juli 2026

**Verwandte Dokumente:**
- [Feature-Liste Final](../03_FEATURES/Feature-Liste-Final.md)
- [V1 To-do-Liste](V1-Todo-Liste.md)
- [Report-Mockup-Abgleich](../03_FEATURES/Report-Mockup-Abgleich.md)

---

## Übersicht

| Version | Name | Ziel | Status |
|---------|------|------|--------|
| **V0** | Projektgrundlage | Dokumentation, Design-System, Planung | ✅ Abgeschlossen |
| **V1** | Launch Website | Single-Page Landing Page live, Anfragen per Formular | ⬜ Nächster Schritt |
| **V2** | Interaktion & Backend | Buchung, Kalender, Blog, Newsletter | ⬜ Geplant |
| **V3** | Wachstum | Kundenbereich, Zahlungen, Admin, CMS | ⬜ Geplant |
| **V4** | Skalierung | Optimierung, PWA, Expansion | ⬜ Optional |

---

## V0 — Projektgrundlage ✅

**Ziel:** Fundament legen, bevor Code geschrieben wird.

| Aufgabe | Status |
|---------|--------|
| Projektstruktur anlegen | ✅ |
| Vision dokumentieren | ✅ |
| Branding & Design-System (aus Mockup) | ✅ |
| Features spezifizieren | ✅ |
| Techstack festlegen | ✅ |
| Report ↔ Mockup abgleichen | ✅ |
| Finale Feature-Liste | ✅ |
| V1 To-do-Liste | ✅ |
| Roadmap konsolidieren | ✅ |
| Logo, Fotos, Rechtstexte bereitstellen | ⬜ |
| Domain registrieren | ⬜ |

**Ergebnis:** Vollständige Projektdokumentation als Basis für V1.

---

## V1 — Launch Website

**Ziel:** Professionelle Online-Präsenz als Single-Page Landing Page — pixelnah zum Mockup, funktionsfähiges Anfrageformular, bereit für erste Kundenanfragen.

> Detaillierte Aufgaben: [V1-Todo-Liste](V1-Todo-Liste.md)

### Umfang

**Enthalten:**
- Single-Page Landing Page mit 10 Sektionen (Hero → Footer)
- Sticky Header mit Smooth-Scroll-Navigation (7 Nav-Punkte)
- 8 Leistungs-Karten, statischer 5-Schritte-Ablauf
- Galerie (5 Fotos) + Instagram-CTA
- Testimonial-Slider (statische Daten)
- FAQ Accordion (8 Fragen)
- Vollständiges Anfrageformular (10 Felder + DSGVO)
- E-Mail-Benachrichtigung bei neuer Anfrage
- WhatsApp FAB
- Impressum, Datenschutz, AGB
- Responsive Design (Mobile-first)
- SEO, JSON-LD, Analytics
- Deployment auf Vercel mit Custom Domain

**Nicht enthalten (bewusst zurückgestellt):**
- Separate Event-Detailseiten
- Interaktiver Buchungs-Wizard
- Verfügbarkeitskalender
- Datenbank / Admin
- Blog, Newsletter, Gutscheine
- Kundenlogin, Online-Zahlung

### Meilensteine

| # | Meilenstein | Ergebnis |
|---|-------------|----------|
| V1.1 | Projekt-Setup + Design-Tokens | Next.js läuft lokal, Tailwind mit Markenfarben |
| V1.2 | UI-Komponenten | Button, Card, Accordion, Form, Header, Footer |
| V1.3 | Landing Page Sektionen | Alle 10 Sektionen implementiert |
| V1.4 | Formular + E-Mail | Anfragen werden zuverlässig zugestellt |
| V1.5 | Rechtliches + SEO | Impressum, Datenschutz, AGB, Meta-Tags, Sitemap |
| V1.6 | QA + Launch | Lighthouse > 90, Cross-Browser, Go-Live |

### Erfolgskriterien V1

- Website live unter eigener Domain mit HTTPS
- Lighthouse Score > 90 (alle Kategorien)
- Formular sendet E-Mails zuverlässig
- Mobile Navigation funktioniert einwandfrei
- Erste Kontaktanfragen über die Website

---

## V2 — Interaktion & Backend

**Ziel:** Digitale Buchungsanfragen vereinfachen, Inhalte erweitern, Kundenbindung aufbauen.

### Umfang

| Feature | Beschreibung |
|---------|--------------|
| **Interaktiver Buchungs-Wizard** | Mehrstufiges Formular (Event → Datum → Details → Bestätigung) statt statischer Ablauf-Anzeige |
| **Verfügbarkeitskalender** | Freie/belegte Termine, Sperrzeiten für Feiertage |
| **Datenbank (Supabase)** | Anfragen und Buchungen persistent speichern |
| **Admin-Ansicht (einfach)** | Geschützter Bereich für eingehende Anfragen |
| **Buchungsstatus** | Anfrage → Bestätigt → Abgeschlossen |
| **E-Mail-Bestätigung an Kunden** | Automatische Antwort nach Anfrage |
| **Gutschein-System** | Digitale Gutscheine kaufen, PDF per E-Mail, Einlösen bei Buchung |
| **Blog / Ratgeber** | SEO-Inhalte: Checklisten, Tipps, saisonale Ideen |
| **Newsletter** | Anmeldung mit Double-Opt-In |
| **Galerie Lightbox** | Vollbild-Ansicht beim Klick |
| **Saisonale Landingpages** | z. B. „Sommerfest", „Weihnachts-Event" |
| **Google Search Console** | Sitemap einreichen, Indexierung überwachen |

### Meilensteine

| # | Meilenstein | Ergebnis |
|---|-------------|----------|
| V2.1 | Supabase Setup + Datenmodelle | Buchungen, Anfragen in DB |
| V2.2 | Buchungs-Wizard + Kalender | Kunden wählen Termin interaktiv |
| V2.3 | Admin-Ansicht | Panda-Bande sieht und verwaltet Anfragen |
| V2.4 | Gutscheine | Kaufen und verschenken möglich |
| V2.5 | Blog + Newsletter | Content-Marketing startet |
| V2.6 | SEO-Ausbau | Strukturierte Event-Daten, saisonale Pages |

### Erfolgskriterien V2

- 10+ Buchungsanfragen pro Monat über die Website
- Buchungsstatus wird digital getrackt
- Newsletter-Abonnenten vorhanden
- Blog mit mindestens 5 Artikeln online

---

## V3 — Wachstum & Automatisierung

**Ziel:** Skalierung, wiederkehrende Kunden, operative Effizienz.

### Umfang

| Feature | Beschreibung |
|---------|--------------|
| **Kundenbereich** | Registrierung, Login, Buchungshistorie, Rechnungsdownload |
| **Bewertungssystem** | Eltern reichen Bewertungen ein, Moderation, Anzeige auf Website |
| **Stripe-Integration** | Online-Zahlung, Anzahlungen |
| **Automatische Rechnungen** | PDF nach Zahlung |
| **Admin-Dashboard (vollständig)** | Events, Buchungen, Kunden, Kalender, Statistiken |
| **Headless CMS (Sanity)** | Content-Pflege ohne Entwickler |
| **Partner-/Gruppenanfragen** | Separates Formular für Kitas, Schulen, Firmen |
| **Mehrsprachigkeit (EN)** | Englische Version für internationale Familien |
| **E-Mail-Vorlagen** | Verwaltung und Automatisierung im Admin |

### Meilensteine

| # | Meilenstein | Ergebnis |
|---|-------------|----------|
| V3.1 | Kundenbereich + Auth | Login, Profil, Historie |
| V3.2 | Bewertungen | Einreichung, Moderation, Anzeige |
| V3.3 | Stripe + Rechnungen | Online-Zahlung funktioniert |
| V3.4 | Admin-Dashboard | Vollständige Verwaltung |
| V3.5 | CMS + Mehrsprachigkeit | Content ohne Code pflegen, EN verfügbar |

### Erfolgskriterien V3

- 30 % Wiederbuchungsrate
- Durchschnittlich 4,5+ Sterne Bewertung
- Online-Zahlungen werden genutzt
- Content wird eigenständig gepflegt (CMS)

---

## V4 — Skalierung & Optimierung (optional)

**Ziel:** Kontinuierliche Verbesserung auf Basis echter Nutzungsdaten.

| Feature | Beschreibung |
|---------|--------------|
| A/B-Tests | Conversion-Optimierung (CTAs, Formular, Hero) |
| Performance-Tuning | Edge Functions, Caching, Bild-CDN |
| PWA | Installierbar auf Smartphone, Offline-Grundfunktionen |
| Regionale Expansion | Landingpages für weitere Bundesländer |
| Franchise-/Partner-Modell | Digitale Unterstützung für Partner |
| Erweiterte Analytics | Conversion-Funnels, Heatmaps |

### Erfolgskriterien V4

- Top-3 bei lokaler Google-Suche für „Kinderbetreuung Events [Region]"
- Conversion-Rate Anfrageformular > 5 %
- PWA installiert von wiederkehrenden Nutzern

---

## Versions-Timeline

```
V0  ████░░░░░░░░░░░░░░░░  Projektgrundlage ✅
V1  ░░░░████████░░░░░░░░  Launch Website
V2  ░░░░░░░░░░░░████████  Interaktion & Backend
V3  ░░░░░░░░░░░░░░░░████  Wachstum & Automatisierung
V4  ░░░░░░░░░░░░░░░░░░██  Skalierung (optional)
```

---

## Risiken & Mitigationen

| Risiko | Auswirkung | Gegenmaßnahme |
|--------|------------|---------------|
| Fehlende Assets (Logo, Fotos) | V1 verzögert sich | Platzhalter im Panda-Stil; parallele Asset-Beschaffung |
| Rechtstexte nicht rechtzeitig | Go-Live blockiert | Anwalt früh beauftragen; Platzhalter-Seiten |
| Scope Creep in V1 | Verzögerung, Überarbeitung | Strikte V1-Definition (siehe Feature-Liste); Mockup als Referenz |
| Formular-Spam | E-Mail-Flut | Honeypot + Rate Limiting in V1 |
| Keine Anfragen trotz Website | ROI unklar | SEO, Google Business, Social Media parallel zu V1 |
| Technische Schulden | Wartungsaufwand | TypeScript, Komponenten-Bibliothek, Tests ab V1 |

---

## Nächste Schritte

1. **Assets von Panda-Bande einholen** (Logo, Fotos, Texte, Kontaktdaten, Rechtstexte)
2. **Domain registrieren**
3. **V1.1 starten:** Next.js-Projekt initialisieren
4. **V1-To-do-Liste abarbeiten:** [V1-Todo-Liste](V1-Todo-Liste.md)
