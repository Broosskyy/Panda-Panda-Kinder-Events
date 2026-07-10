# Customer Foreign Key & Linked Quotes Final Fix Report

**Datum:** 2026-07-10  
**Branch:** `cursor/customer-fk-linked-quotes-fix-dab0`

---

## Problem

Beim Löschen eines Kunden trat ein PostgreSQL-Fehler auf:

```
update or delete on table "crm_customers"
violates foreign key constraint "crm_quotes_customer_id_fkey"
on table "crm_quotes"
```

Gleichzeitig zeigte die UI unter „Verknüpfte Daten“:

> „Keine verknüpften Angebote.“

### Root Cause

Die Abfragen in `fetchCustomerLinks` und `getCustomerDeleteBlockers` filterten mit `.is("deleted_at", null)`. Soft-gelöschte Angebote (`deleted_at` gesetzt) behielten aber weiterhin `customer_id` → FK blockierte DELETE, waren in der UI aber unsichtbar.

---

## Lösung

### 1. FK-relevante Abhängigkeiten (`lib/crm/customer-dependencies.ts`)

Neues Modul zählt **alle** Datensätze mit `customer_id = Kunde.id` — ohne Filter auf `deleted_at` oder `archived_at`:

- `crm_quotes`
- `crm_invoices`
- `booking_requests` (Anfragen)

`getCustomerDependencies()` liefert strukturierte Zähler für Löschprüfung und Dialog.

`sanitizeCrmDbError()` mappt rohe FK-Fehler auf verständliche Meldungen; technische Details nur in Server-Logs.

### 2. Verknüpfte Daten korrekt laden (`lib/crm/customer-links.ts`)

- Angebote/Rechnungen: **alle** FK-verknüpften Zeilen laden
- Sichtbarkeit pro Eintrag: `active` · `archived` · `soft_deleted`
- Anzeige: Angebotsnummer, Status, Erstellungsdatum, Archiviert ja/nein
- Zähler in UI aus `dependencies` (FK-relevant), nicht aus gefilterter Liste

### 3. Serverseitige Löschprüfung vor DELETE

`DELETE /api/admin/customers` prüft Abhängigkeiten **bevor** SQL-DELETE ausgeführt wird:

```json
{
  "canDelete": false,
  "dependencies": { "quotes": 1, "inquiries": 0, "invoices": 0 },
  "blockers": { ... },
  "links": { ... },
  "canArchive": true
}
```

Kein roher FK-Fehler mehr im normalen UI-Flow.

### 4. Dialog

- Titel: **„Kunde kann nicht gelöscht werden“**
- Liste: `1 Angebot` · `0 Anfragen` · `0 Rechnungen`
- Buttons: **Verknüpfte Daten anzeigen** · **Kunde archivieren** · **Abbrechen**

### 5. Angebot — Kunde ändern

Neue Aktion **„Kunde ändern“** für Angebote:

- `POST /api/admin/customers/[id]/unlink` mit `action: "reassign"` + `newCustomerId`
- UI: Kundenauswahl-Modal (Desktop + Mobile Bottom Sheet)
- Ausgeblendete Alt-Datensätze: **Löschen** trennt `customer_id` via `detachSoftDeletedQuoteFromCustomer`

### 6. Archivieren

Unverändert möglich bei verknüpften Angeboten — kein Eingriff nötig.

---

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `lib/crm/customer-dependencies.ts` | **neu** — FK-Zähler, Sanitizer |
| `lib/crm/customer-links.ts` | Alle Quotes laden, Visibility, Reassign, Soft-delete detach |
| `lib/crm/db.ts` | Delete-Pre-Check über Dependencies, Error-Sanitizer |
| `src/app/api/admin/customers/route.ts` | Strukturierte 409-Antwort, sanitized errors |
| `src/app/api/admin/customers/[id]/unlink/route.ts` | `reassign`, soft-delete detach |
| `components/admin/crm/CustomerDeleteBlockedModal.tsx` | Neuer Titel + Copy |
| `components/admin/crm/CustomerLinkedDataPanel.tsx` | Zähler, Visibility-Badges, Kunde ändern |
| `components/admin/views/CustomersView.tsx` | dependencies-Fallback, FK-Error-Fallback |
| `scripts/customer-delete-archive-unlink-test.mjs` | Erweiterte statische Tests |

---

## Verifikation

| Check | Ergebnis |
|-------|----------|
| `npm run test:admin-customer-workflow` | 17/17 |
| `npm run lint` | ✓ |
| `npm run typecheck` | ✓ |
| `npm run build` | ✓ |

---

## Manuelle Testfälle (nach Deploy)

| Szenario | Erwartung |
|----------|-----------|
| A) Kunde ohne Verknüpfungen | Löschen möglich |
| B) Kunde mit aktivem Angebot | UI zeigt Angebot, Löschen blockiert, Archivieren möglich |
| C) Kunde mit archiviertem Angebot | Als „Archiviert“ sichtbar, Löschen blockiert |
| D) Kunde mit soft-deleted Angebot | Als „Ausgeblendet (Alt-Datensatz)“ sichtbar, nicht „Keine Angebote“ |
| E) Angebot auf anderen Kunden | „Kunde ändern“ → alter Kunde danach löschbar |

---

## Hinweis Migration

`supabase/migrations/20260738_crm_quote_customer_unlink.sql` (nullable `customer_id`) muss in Produktion angewendet sein, damit „Verknüpfung lösen“ bei offenen Angeboten funktioniert. **Kunde ändern** (Reassign) funktioniert unabhängig davon.
