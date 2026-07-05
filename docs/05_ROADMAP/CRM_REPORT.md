# CRM Sprint 3 — Business CRM Report

**Version:** 0.9.0-rc.5  
**Branch:** `cursor/crm-business-e022`  
**Datum:** 2026-07-05

## Ziel

Panda-Bande erhält ein schlankes, professionelles CRM — optimiert für ein kleines Unternehmen. Keine Buchhaltungssoftware, kein DATEV, kein Warenwirtschaftssystem.

## Umgesetzt

### 1. Navigation

Neue Admin-Einträge in der Sidebar / Mobile-Navigation:

| Bereich | Route |
|---------|-------|
| Kunden | `/admin/kunden` |
| Angebote | `/admin/angebote` |
| Rechnungen | `/admin/rechnungen` |

### 2. Kunden

Felder: Name, Telefon, E-Mail, Adresse, Notizen, Status (Aktiv / Inaktiv / Interessent).

- Liste mit Suche
- Anlegen und Bearbeiten inline
- Historie pro Kunde: Anfragen, Angebote, Rechnungen, Events

### 3. Anfragen → Kunde

- Kontaktformular-Anfragen unter `/admin/anfragen`
- Button **„Kunde erstellen"** legt Kundenstammdaten aus der Anfrage an
- Verknüpfung via `booking_requests.customer_id`

### 4. Angebote

- Neues Angebot mit Kunde, Titel, Positionen
- Rabatt (%), MwSt. (%), Bemerkung
- Status-Workflow
- PDF-Download und E-Mail-Versand
- Rechnung aus Angebot erzeugen

### 5. PDF (Corporate Design)

- `pdf-lib`, Panda-Bande-Farbe `#52563e`
- Kopfzeile, Kundendaten, Positionstabelle, Summen, Fußzeile
- Gültigkeits-/Fälligkeitsdatum je Dokumenttyp

### 6. Versand per E-Mail

- Resend mit PDF-Anhang
- Optional Kopie an Panda-Bande (`INQUIRY_NOTIFICATION_EMAIL`)
- Status wird auf „Gesendet" gesetzt

### 7. Rechnungen

- Erzeugung aus Angebot (`POST /api/admin/invoices` mit `quote_id`)
- Nummernkreis: `RE-2026-0001`
- Eigenes PDF und Versand

### 8. Status

Einheitlich für Angebote und Rechnungen:

`Entwurf` · `Gesendet` · `Bestätigt` · `Bezahlt` · `Offen` · `Storniert`

### 9. Historie

`crm_customer_events` + verknüpfte Anfragen/Angebote/Rechnungen pro Kunde.

### 10. Suche

- Kunden: Name, E-Mail, Telefon
- Angebote / Rechnungen: Nummer, Titel, Kundenname

### 11. Dashboard-KPIs

- Kunden (gesamt)
- Offene Angebote
- Offene Rechnungen
- Umsatz (bezahlte Rechnungen)

## Technische Architektur

### Datenbank

Migration: `supabase/migrations/20260707_crm_business.sql`

| Tabelle | Zweck |
|---------|-------|
| `crm_customers` | Kundenstamm |
| `crm_quotes` / `crm_quote_items` | Angebote |
| `crm_invoices` / `crm_invoice_items` | Rechnungen |
| `crm_number_sequences` | ANG-/RE-Nummernkreis |
| `crm_customer_events` | Historie |
| `booking_requests.customer_id` | Anfrage ↔ Kunde |

RLS: deny-all (nur Service Role / Admin-API).

### API (Admin)

| Endpoint | Methoden |
|----------|----------|
| `/api/admin/customers` | GET, POST, PATCH, DELETE |
| `/api/admin/customers/from-booking` | POST |
| `/api/admin/customers/[id]/history` | GET |
| `/api/admin/quotes` | GET, POST, PATCH, DELETE |
| `/api/admin/quotes/[id]/pdf` | GET |
| `/api/admin/quotes/[id]/send` | POST |
| `/api/admin/invoices` | GET, POST, PATCH, DELETE |
| `/api/admin/invoices/[id]/pdf` | GET |
| `/api/admin/invoices/[id]/send` | POST |

### Lib

- `lib/crm/types.ts` — Typen & Labels
- `lib/crm/schemas.ts` — Zod-Validierung
- `lib/crm/money.ts` — Cent-Berechnung, Formatierung
- `lib/crm/numbers.ts` — Dokumentnummern
- `lib/crm/pdf.ts` — PDF-Generierung
- `lib/crm/db.ts` — CRUD & Workflows
- `lib/crm/events.ts` — Historie & Dashboard-Stats

## Bewusst nicht enthalten

- Keine DATEV-Exporte
- Keine doppelte Buchführung
- Kein Lager / Warenwirtschaft
- Keine Mehrwährung

## Tests & Verifikation

```bash
npm run build
npm run lint
npm run test:crm
```

| Bereich | Status |
|---------|--------|
| Build | siehe CI / lokaler Lauf |
| Lint | siehe CI / lokaler Lauf |
| CRM Unit (Money, PDF, Migration) | `npm run test:crm` |
| PDF Runtime | Admin → Angebot → PDF |
| Mail Runtime | `RESEND_API_KEY` + Kunden-E-Mail erforderlich |

## Deployment

1. Migration `20260707_crm_business.sql` in Supabase ausführen
2. `RESEND_API_KEY` und `INQUIRY_NOTIFICATION_EMAIL` für Versand prüfen
3. Admin-Login testen: Kunde → Angebot → PDF → Senden → Rechnung

## Dateien (Auswahl)

- `components/admin/views/CustomersView.tsx`
- `components/admin/views/QuotesView.tsx`
- `components/admin/views/InvoicesView.tsx`
- `components/admin/views/BookingsView.tsx` (Kunde erstellen)
- `components/admin/views/DashboardView.tsx` (CRM-KPIs)
- `lib/admin/nav.ts`
