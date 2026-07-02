# Features — Panda-Bande Kinderevents

> **Hinweis:** Dieses Dokument ist die ursprüngliche Feature-Spezifikation.  
> Die **finale, konsolidierte Version** (Report + Mockup) findet sich in:
> - [Feature-Liste Final](Feature-Liste-Final.md)
> - [Report-Mockup-Abgleich](Report-Mockup-Abgleich.md)

## Übersicht

Dieses Dokument beschreibt die ursprünglich geplanten Funktionen der Panda-Bande Kinderevents Plattform. Die Features sind nach Priorität und Entwicklungsphase gruppiert.

---

## Kernfunktionen (MVP)

### 1. Startseite
- Hero-Bereich mit Markenbotschaft und Call-to-Action
- Kurzvorstellung der Panda-Bande Philosophie
- Highlights der beliebtesten Event-Pakete
- Vertrauenselemente (Bewertungen, Erfahrungsjahre, Sicherheitshinweise)
- Kontakt-CTA und Social-Media-Links

### 2. Event-Katalog
- Übersicht aller buchbaren Event-Pakete
- Filter nach Alter, Thema, Dauer und Preis
- Detailseiten pro Event mit:
  - Beschreibung und Ablauf
  - Altersgruppe und Teilnehmerzahl
  - Enthaltene Leistungen
  - Dauer und Preis
  - Bildergalerie
  - Buchungs- oder Anfrage-Button

### 3. Über uns
- Geschichte und Team der Panda-Bande
- Werte und Qualitätsversprechen
- Maskottchen-Vorstellung
- Fotos vom Team und vergangenen Events

### 4. Kontakt & Anfrage
- Kontaktformular (Name, E-Mail, Telefon, Wunschdatum, Event-Typ, Nachricht)
- Anzeige von Erreichbarkeit und Antwortzeit
- Optional: eingebettete Karte für Event-Region
- DSGVO-konforme Einwilligung bei Formularübermittlung

### 5. FAQ
- Häufige Fragen zu Buchung, Stornierung, Alter, Allergien, Location
- Aufklappbare Accordion-Elemente
- Verlinkung zum Kontaktformular bei offenen Fragen

---

## Erweiterte Funktionen (Phase 2)

### 6. Online-Buchungssystem
- Auswahl von Event, Datum und Uhrzeit
- Eingabe von Teilnehmerdaten (Anzahl Kinder, Alter, Besonderheiten)
- Übersicht der Gesamtkosten vor Absenden
- Buchungsbestätigung per E-Mail
- Optional: Anzahlung oder Online-Zahlung

### 7. Verfügbarkeitskalender
- Interaktiver Kalender mit freien und belegten Terminen
- Sperrzeiten für Feiertage und interne Pausen
- Echtzeit-Synchronisation mit internem Verwaltungssystem

### 8. Gutscheine & Geschenkgutscheine
- Digitale Gutscheine kaufen und verschenken
- Individueller Betrag oder festes Event-Paket
- PDF-Gutschein per E-Mail
- Einlösung bei Buchung

### 9. Blog / Ratgeber
- Tipps zur Kindergeburtstags-Planung
- Checklisten für Eltern
- Saisonale Event-Ideen
- SEO-relevante Inhalte für organische Sichtbarkeit

### 10. Newsletter
- Anmeldung mit Double-Opt-In
- Saisonale Angebote und Event-Neuigkeiten
- Integration mit E-Mail-Marketing-Tool

---

## Premium-Funktionen (Phase 3)

### 11. Kundenbereich
- Registrierung und Login für wiederkehrende Kunden
- Übersicht vergangener und kommender Buchungen
- Rechnungen und Bestätigungen herunterladen
- Wunschliste für zukünftige Events

### 12. Bewertungssystem
- Eltern können nach dem Event eine Bewertung abgeben
- Sternebewertung und kurzer Kommentar
- Moderation vor Veröffentlichung
- Anzeige auf Event-Detailseiten und Startseite

### 13. Partner- & Gruppenanfragen
- Separates Formular für Kitas, Schulen und Firmen
- Anfrage für wiederkehrende Events oder Großgruppen
- Individuelles Angebot per E-Mail

### 14. Mehrsprachigkeit
- Deutsch als Hauptsprache
- Optional: Englisch für internationale Familien in der Region

### 15. Admin-Dashboard (intern)
- Verwaltung von Events, Buchungen und Kunden
- Kalender- und Kapazitätsplanung
- E-Mail-Vorlagen und automatische Benachrichtigungen
- Einfache Statistiken (Buchungen, Umsatz, beliebte Events)

---

## Technische Querschnittsfunktionen

| Funktion | Beschreibung |
|----------|--------------|
| Responsive Design | Optimiert für Smartphone, Tablet und Desktop |
| SEO | Meta-Tags, strukturierte Daten, Sitemap, saubere URLs |
| Performance | Schnelle Ladezeiten, optimierte Bilder |
| Barrierefreiheit | WCAG 2.1 Level AA als Ziel |
| Cookie-Banner | DSGVO-konforme Einwilligung für Tracking |
| Analytics | Datenschutzkonforme Nutzungsanalyse (z. B. Plausible, Matomo) |
| Fehlerseiten | Individuelle 404- und Fehlerseiten im Markendesign |

---

## Feature-Priorisierung

```
MVP (Phase 1)          Phase 2              Phase 3
─────────────────      ─────────────────    ─────────────────
Startseite             Buchungssystem       Kundenbereich
Event-Katalog          Kalender             Bewertungen
Über uns               Gutscheine           Partner-Anfragen
Kontaktformular        Blog                 Mehrsprachigkeit
FAQ                    Newsletter           Admin-Dashboard
```

---

## Nicht im Scope (vorerst)

- E-Commerce-Shop für physische Produkte
- Live-Chat mit KI-Bot
- Mobile App (native iOS/Android)
- Community-Forum
- Live-Streaming von Events

Diese Funktionen können in späteren Versionen evaluiert werden, sind aber nicht Teil der initialen Planung.
