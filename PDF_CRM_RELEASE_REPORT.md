# PDF & CRM Final Release Report

**Branch:** `cursor/pdf-crm-final-release-e022`  
**Commit:** `feat(crm): final pdf release, document lifecycle, archive, delete and mobile pdf fixes`

---

## Ursachen der alten Probleme

| Problem | Ursache |
|---------|---------|
| Logo abgeschnitten | Feste Header-Höhe (88 pt), Logo mit negativem Y-Offset und `MARGIN`-Versatz außerhalb des sichtbaren Bereichs |
| „Gequetschter Screenshot“-Look | Vollflächiger grüner Header-Balken, Web-Branding statt Dokument-Layout |
| Zu viel Leerraum / falsche Abstände | Harte `y`-Offsets ohne DIN-Raster; Empfängerblock zu klein |
| Mobile PDF / leere Tabs | Direkte Links ohne Blob-Validierung; `window.open` ohne Fallback bei blockiertem Popup |
| Kein Download | Nur „PDF öffnen“, kein separater Download-Flow |
| Löschen/Archivieren fehlend | API hatte DELETE, aber keine UI, keine Soft-Delete-Spalten, keine Geschäftsregeln |
| Kein Audit | CRM-Aktionen nicht in `admin_audit_logs` protokolliert |

---

## Geänderte / neue Dateien

### PDF-Layout
- `lib/crm/pdf.ts` — Komplett neues DIN-A4-Layout (24/18/18 mm Ränder), Logo contain max 45×120 pt, 5-Spalten-Tabelle, Summenbox rechts, Footer, Platzhalter-Filter
- `lib/crm/load-logo.ts` — unverändert (weiterhin robustes Laden)
- `src/app/api/admin/quotes/[id]/pdf/route.ts` — Logo-Warnung bei fehlendem Bild
- `src/app/api/admin/invoices/[id]/pdf/route.ts` — Logo-Warnung bei fehlendem Bild

### PDF öffnen / herunterladen
- `lib/admin/open-pdf.ts` — `fetchAdminPdf`, `openAdminPdf`, `downloadAdminPdf`; leere Blobs und JSON-Fehler abgefangen
- `lib/admin/buttons.ts` — `pdfOpen`, `pdfDownload`

### Dokument-Lifecycle
- `supabase/migrations/20260716_crm_document_lifecycle.sql` — `deleted_at`, `archived_at`, `cancelled_at`, `cancelled_reason`
- `lib/crm/types.ts` — neue Felder
- `lib/crm/db.ts` — `archiveQuote`, `deleteQuote`, `archiveInvoice`, `cancelInvoice`, `deleteInvoice` (nur Entwurf), Listenfilter `view=active|archived|all`
- `lib/crm/audit-log.ts` — CRM-Audit in `admin_audit_logs`
- `src/app/api/admin/quotes/route.ts` — PATCH `action: archive|restore`, Soft-DELETE
- `src/app/api/admin/invoices/route.ts` — PATCH `action: archive|restore|cancel`, Soft-DELETE (nur Entwurf)
- `src/app/api/admin/quotes/[id]/route.ts` — GET Einzelangebot (Bearbeiten)
- `src/app/api/admin/invoices/[id]/route.ts` — GET Einzelrechnung

### Admin-UI
- `components/admin/views/QuotesView.tsx` — Bearbeiten, PDF öffnen/herunterladen, Archivieren, Löschen, Filter Aktiv/Archiviert
- `components/admin/views/InvoicesView.tsx` — PDF öffnen/herunterladen, Archivieren, Stornieren, Löschen (Entwurf), Filter, Status-Hinweise
- `lib/admin/messages.ts` — Bestätigungsdialoge und Erfolgsmeldungen CRM
- `lib/admin/use-admin-messages.ts` — Toast-Helfer für Archiv/Löschen/Storno

---

## Neue Funktionen

1. **Professionelles PDF** — eigenes A4-Dokumentlayout, nicht Website-Screenshot
2. **Empfängerblock** — Name, Adresse, Telefon, E-Mail strukturiert
3. **Positionstabelle** — Bezeichnung, Beschreibung, Menge, Einzelpreis, Gesamt (Zahlen rechts, EUR de-DE)
4. **Summenbox** — Zwischensumme, Rabatt, MwSt., Gesamtbetrag fett
5. **Rechnungstexte** — Zahlungshinweis, Bankverbindung, IBAN/BIC, Verwendungszweck; keine Platzhalter im Live-PDF
6. **PDF öffnen + herunterladen** — mobile-tauglich via Blob
7. **Angebote** — Bearbeiten, Archivieren, Soft-Delete mit Bestätigung
8. **Rechnungen** — Archivieren, Stornieren; Löschen nur bei Status „Entwurf“; bezahlte Rechnungen nicht löschbar
9. **Audit-Log** — alle Lifecycle-Aktionen in `admin_audit_logs` (area: `crm`)
10. **Listenfilter** — Aktiv / Archiviert ohne Page-Reload

---

## Getestete Szenarien

| Szenario | Ergebnis |
|----------|----------|
| `npm run lint` | ✓ (nur bestehende Warnings) |
| `npm run typecheck` | ✓ |
| `npm run build` | ✓ |
| Angebot PDF (Generator) | ✓ Build + Layout-Code |
| Rechnung PDF (Generator) | ✓ Build + Layout-Code |
| API-Routen quotes/invoices lifecycle | ✓ Build |
| UI Aktionen Quotes/Invoices | ✓ Build |

**Manuell nach Deploy mit Supabase-Migration prüfen:**
- Mobile/Desktop PDF öffnen & Download
- Angebot archivieren/löschen
- Rechnung Entwurf löschen
- Rechnung gesendet archivieren/stornieren
- Rechnung bezahlt → Löschen blockiert
- Audit-Log unter Admin → Sicherheit → Audit

---

## Offene Punkte

1. **Rechnung bearbeiten (Positionen)** — Statusänderung vorhanden; vollständiger Positions-Editor für Rechnungs-Entwürfe als Follow-up
2. **Archivierte wiederherstellen** — API `action: restore` vorhanden, UI-Button noch nicht exponiert
3. **PDF-Regressionstest** — `scripts/crm-test.mjs` testet noch nicht das neue `generateCrmPdf`-Layout visuell
4. **Migration ausführen** — `20260716_crm_document_lifecycle.sql` in Supabase anwenden vor Live-Test

---

## Migration

```bash
# Supabase CLI oder Dashboard
supabase db push
# bzw. SQL aus supabase/migrations/20260716_crm_document_lifecycle.sql
```
