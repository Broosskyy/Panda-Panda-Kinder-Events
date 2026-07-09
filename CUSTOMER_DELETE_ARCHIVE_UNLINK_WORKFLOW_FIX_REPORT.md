# Customer Delete / Archive / Unlink Workflow Fix Report

**Datum:** 2026-07-09  
**Branch:** `cursor/customer-delete-unlink-workflow-dab0`

---

## Problem

Kunden mit verknüpften Anfragen, Angeboten oder Rechnungen konnten nicht gelöscht werden — korrekt aus fachlicher Sicht, aber:

- Nur generische Fehlermeldung („Aktion fehlgeschlagen“ / Hinweis ohne Details)
- Keine Übersicht der Verknüpfungen
- Kein Weg, Verknüpfungen aufzulösen
- Archivieren war möglich, aber nicht als klarer Lösungsweg im Lösch-Dialog
- Kein sicherer Endgültig-Löschen-Pfad für Super Admins

---

## Lösung

### 1. Blockiertes Löschen — Dialog statt generischem Fehler

Bei HTTP 409 zeigt `CustomersView` jetzt `CustomerDeleteBlockedModal`:

| Element | Inhalt |
|---------|--------|
| Titel | „Löschen nicht möglich“ |
| Text | „Dieser Kunde ist noch mit Daten verknüpft.“ |
| Liste | Anfragen, Angebote, Rechnungen, Aktivitäten, Bewertungen (mit Zähler) |
| Buttons | Verknüpfungen anzeigen · Kunde archivieren · Abbrechen |
| Super Admin | „Endgültiges Löschen vorbereiten“ (nur wenn keine Rechnungen) |

### 2. Verknüpfte Daten — Kundendetail

Neuer Bereich `CustomerLinkedDataPanel` auf der Kundendetailseite:

- Anfragen, Angebote, Rechnungen, Bewertungen, Aktivitäten als Karten
- Pro Eintrag: **Öffnen**, **Verknüpfung lösen**, **Archivieren**, **Löschen** (je nach Regeln)
- Mobile: Aktionen über Bottom-Sheet-Modal („Aktionen“-Button, min. 44px Höhe)

### 3. Verknüpfung aufheben — fachliche Regeln

| Typ | Verknüpfung lösen | Archivieren | Löschen |
|-----|-------------------|-------------|---------|
| Anfrage | ✅ immer | — | — |
| Angebot (Entwurf/Gesendet/Offen, ohne Rechnung) | ✅ | ✅ | ✅ nur Entwurf |
| Angebot (angenommen / mit Rechnung) | ❌ mit Begründung | ✅ | ❌ |
| Rechnung | ❌ abrechnungsrelevant | ✅ | ❌ |
| Aktivität | ❌ Protokoll bleibt | ❌ | ❌ |
| Bewertung | ❌ nur Namens-Match | ❌ | ❌ |

API: `POST /api/admin/customers/[id]/unlink` mit `{ type, targetId, action }`

Migration: `crm_quotes.customer_id` nullable für sicheres Lösen von Angeboten.

### 4. Archivieren als Standardweg

- `POST /api/admin/customers/[id]/archive` — Status `inactive`, Audit-Log, Kunden-Event
- `POST /api/admin/customers/[id]/restore` — Wiederherstellung
- Listenfilter: **Aktive Kunden** (Standard) · **Archiv** · **Alle**
- Archivierte Kunden: Button „Wiederherstellen“ statt „Archivieren“

### 5. Endgültig löschen (Super Admin)

Nur wenn keine blockierenden Verknüpfungen mehr existieren:

- `DELETE /api/admin/customers` mit `{ id, permanent: true, confirmText: "LÖSCHEN" }`
- `requireSuperAdmin()` + Audit-Log `customer_deleted`
- UI: `CustomerPermanentDeleteModal` mit Zusammenfassung und Tippfeld „LÖSCHEN“

### 6. API-Fehler — konkrete Ursachen

Alle Endpunkte liefern spezifische `error`-Meldungen (409 bei Regelverletzung, 404 bei fehlendem Datensatz). DELETE 409 enthält zusätzlich `blockers` und vollständiges `links`-Objekt.

---

## Geänderte / neue Dateien

| Datei | Änderung |
|-------|----------|
| `lib/crm/customer-links.ts` | **Neu** — Verknüpfungslogik, Regeln, Unlink |
| `lib/crm/db.ts` | Archiv/Wiederherstellen/Löschen, Listenfilter |
| `src/app/api/admin/customers/route.ts` | View-Filter, permanent delete |
| `src/app/api/admin/customers/[id]/links/route.ts` | **Neu** |
| `src/app/api/admin/customers/[id]/archive/route.ts` | **Neu** |
| `src/app/api/admin/customers/[id]/restore/route.ts` | **Neu** |
| `src/app/api/admin/customers/[id]/unlink/route.ts` | **Neu** |
| `components/admin/crm/CustomerLinkedDataPanel.tsx` | **Neu** |
| `components/admin/crm/CustomerDeleteBlockedModal.tsx` | **Neu** |
| `components/admin/crm/CustomerPermanentDeleteModal.tsx` | **Neu** |
| `components/admin/views/CustomersView.tsx` | Workflow-Integration |
| `supabase/migrations/20260738_crm_quote_customer_unlink.sql` | **Neu** |
| `scripts/customer-delete-archive-unlink-test.mjs` | **Neu** |

---

## Tests

```bash
npm run lint          # ✓
npm run typecheck     # ✓
npm run build         # ✓
npm run test:admin-customer-workflow  # 10/10
```

### Manuelle Szenarien (nach Deploy)

| Szenario | Erwartung |
|----------|-----------|
| A) Kunde ohne Verknüpfung | Löschen erfolgreich |
| B) Kunde mit Anfrage | Dialog mit Zähler → Anfrage lösen → danach löschbar |
| C) Kunde mit Rechnung | Löschen blockiert, Rechnung sichtbar, Lösen nicht erlaubt, Archivieren möglich |
| D) Archivierter Kunde | Nicht in Standardliste, im Archiv sichtbar, wiederherstellbar |

---

## Hinweis Migration

`supabase/migrations/20260738_crm_quote_customer_unlink.sql` muss auf der Datenbank ausgeführt werden, damit Angebote vom Kunden gelöst werden können.
