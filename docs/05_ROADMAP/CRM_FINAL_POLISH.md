# CRM Final UX/UI Polish — Report

**Version:** 0.9.0-rc.7  
**Branch:** `cursor/crm-final-polish-e022`  
**Datum:** 2026-07-05

## Ziel

Das CRM soll sich wie eine hochwertige native Business-App anfühlen — ausschließlich UX/UI/Mobile, ohne Funktionsverlust oder Datenbankänderungen.

## Umgesetzt

### 1. Mobile Navigation

- 5 Tabs unverändert: Dashboard, Kunden, Galerie, Anfragen, Mehr
- Höhe ~76px (`min-height: 4.75rem`) + Safe Area
- Größere Icons (26px), größerer Text, mehr Abstand
- Aktiver Tab mit Hintergrund-Pill (`admin-accent-soft`)
- Gleichmäßige Tab-Breite, Schatten + Blur

### 2. Floating Action Button

- Höher positioniert über der Navigation (`6.25rem + safe-area`)
- Verbesserter Schatten, Hover/Active-Animation
- Überdeckt Bottom-Nav nicht

### 3. Dashboard

Gruppiert in:

- Schnellaktionen
- Statistik (Besucher)
- CRM (Kunden, Angebote, Rechnungen)
- Website (Anfragen, Bewertungen, Beiträge, Galerie)

Einheitliche Stat-Cards (`min-height`, Shadow, Radius).

### 4. Formulare

- `AdminFormField` mit Pflichtfeld-Markierung (`*`)
- Labels oberhalb, Hilfetexte darunter
- Einheitliche `admin-input` Höhe (44px)

### 5. Angebote — Rabatt & MwSt.

- Labels: **Rabatt (%)** und **MwSt. (%)**
- Hilfetexte: „Rabatt optional“ / „MwSt. Standard 19 %“

### 6. Positionen

Neuer `QuoteLineItemsEditor`:

- Bezeichnung + optionale Beschreibung
- Menge, Einzelpreis, automatisches Gesamt
- Position löschen / duplizieren / hinzufügen
- Live-Summen: Zwischensumme, Rabatt, MwSt., Gesamtbetrag

### 7. PDF

Professionelleres Layout mit `BusinessProfile` aus Einstellungen:

- Logo, Firmenname, Anschrift, Kontakt
- Dokumentnummer, Datum, Fälligkeit, Status
- Modernere Tabelle + Summenbereich
- Rechnung: Zahlungshinweis, Bankverbindung, Verwendungszweck
- Abschluss: „Mit freundlichen Grüßen“

### 8. E-Mails

- HTML-Template mit Header, Betrag-Box, PDF-Hinweis, Footer
- Firmendaten aus `business`-Einstellungen
- `CrmSendModal`: ☑ An Kunden senden / ☑ Kopie an uns

### 9. Einstellungen — Unternehmensdaten

Neue Sektion `business` in `site_settings` (keine DB-Migration nötig):

- Firmenname, Logo, Adresse, Kontakt, Bank, Steuerdaten
- Standardtexte für Angebot/Rechnung/Zahlung
- Absendername & -E-Mail
- PDFs und E-Mails nutzen ausschließlich diese Daten

### 10. Mobile Polish

- Modal von unten auf Mobile, Safe-Area berücksichtigt
- Toasts über Navigation positioniert
- Keine Layout-Regressionen in Build

## Technische Dateien

| Bereich | Dateien |
|---------|---------|
| Navigation/CSS | `globals.css`, `AdminSidebar.tsx`, `lib/admin/nav.ts` |
| Angebote | `QuotesView.tsx`, `QuoteLineItemsEditor.tsx` |
| Versand | `CrmSendModal.tsx`, `InvoicesView.tsx` |
| PDF | `lib/crm/pdf.ts`, `lib/crm/company.ts` |
| E-Mail | `lib/email.ts` |
| Einstellungen | `SettingsView.tsx`, `lib/cms/types.ts`, `defaults.ts` |
| Dashboard | `DashboardView.tsx` |

## Tests

```bash
npm run build   # ✅
npm run lint    # ✅ (3 bestehende useEffect-Warnings)
npm run test:crm # ✅
```

## Bewusst unverändert

- Keine CRM-API-Verträge geändert (nur additive `business`-Settings-Sektion)
- Keine Datenbankmigration
- Keine öffentliche Website
- Alle bestehenden Funktionen erhalten

## Regression

| Flow | Status |
|------|--------|
| Kunde anlegen/bearbeiten | ✅ |
| Angebot erstellen | ✅ (verbessert) |
| PDF erzeugen | ✅ (Business-Daten) |
| Mail senden | ✅ (Modal + HTML) |
| Rechnung erzeugen/versenden | ✅ |
| Status ändern | ✅ |
| Dashboard | ✅ (gruppiert) |
