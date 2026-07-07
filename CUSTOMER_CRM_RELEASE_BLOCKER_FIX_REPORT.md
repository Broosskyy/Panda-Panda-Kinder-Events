# Customer CRM Release Blocker Fix Report

**Datum:** 7. Juli 2026  
**Branch:** `cursor/customer-crm-release-blocker-e022`  
**Bereich:** Admin → Kunden / CRM

---

## Probleme (vorher)

| Symptom | Ursache |
|---------|---------|
| Falsche Kundendaten nach Wechsel | Unkontrollierte `defaultValue`-Inputs — React setzt `defaultValue` nicht bei Kundenwechsel zurück |
| Historie zeigt alten Kunden | History-State wurde beim Wechsel nicht geleert; Fehler nicht behandelt |
| Bearbeiten unzuverlässig | Speichern nur per `onBlur` — jedes Tabben löste PATCH aus |
| Löschen nicht möglich / nicht sichtbar | Kein UI; DELETE schlug bei verknüpften Datensätzen still fehl |
| Mobile UX | Liste + Detail überlagert; Buttons nahe Bottom-Nav |

---

## Fixes

### 1. Kundenliste (`CustomersView.tsx`)

- Echte Supabase-Daten via `/api/admin/customers`
- **Loading:** „Kunden werden geladen…“
- **Error:** Meldung + „Erneut laden“
- **Empty:** `AdminEmptyState` ohne Dummy-Daten
- Suche mit escaped PostgREST-Patterns (keine Filter-Brüche bei Sonderzeichen)

### 2. Kunde öffnen

- Kontrolliertes Formular — synchronisiert bei `selectedId`-Wechsel
- History wird sofort geleert, dann neu geladen (Loading + Error-State)
- URL-Parameter `?id=` unterstützt (z. B. von Anfragen)
- **Mobile:** Master-Detail — Liste ausgeblendet, Detail mit „Zurück zur Liste“
- **Desktop:** Zwei-Spalten-Layout unverändert

### 3. Kunde bearbeiten

- Expliziter **Speichern**-Button
- Validierung: Name Pflicht, E-Mail-Schema serverseitig
- PATCH normalisiert leere Felder → `null`
- Status-Feld im Detail bearbeitbar
- Erfolgsmeldung + sofortiges Listen-Reload

### 4. Kunde löschen / archivieren

- **Löschen** mit `confirmDanger`-Dialog
- API prüft Verknüpfungen (Anfragen, Angebote, Rechnungen)
- Bei Blockade: HTTP 409 + verständliche Meldung + Hinweis auf Archivieren
- **Archivieren:** Status → `inactive` (immer möglich)

### 5. Historie erweitert (`lib/crm/events.ts`)

- Anfragen, Angebote, Rechnungen (ohne gelöschte/archivierte)
- Bewertungen per Namens-Match (freigegeben)
- E-Mail-Kommunikation via `CustomerCommunicationTimeline`
- Links zu Anfragen / Angebote / Rechnungen

### 6. API (`/api/admin/customers`)

- `GET` — Liste mit Fehlerbehandlung
- `POST` / `PATCH` — Normalisierung leerer Strings
- `DELETE` — `getCustomerDeleteBlockers()` vor Löschung

### 7. Mobile

- `margin-bottom` unter Detail-Panel für Bottom-Navigation
- `max-width: 100%` auf Inputs — kein horizontaler Overflow
- Aktionen als flex-wrap Buttons

### 8. Regression: Anfragen → Kunde

- `BookingsView`: Link ` /admin/kunden?id={customer_id}` öffnet direkt den Kunden

---

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `components/admin/views/CustomersView.tsx` | Komplett überarbeitet |
| `components/admin/views/BookingsView.tsx` | Kunden-Link mit ID |
| `src/app/api/admin/customers/route.ts` | Normalisierung, Delete-Guards |
| `lib/crm/db.ts` | Search-Fix, `getCustomerDeleteBlockers` |
| `lib/crm/events.ts` | History-Filter, Bewertungen |
| `lib/admin/messages.ts` | Confirm-Texte Kunde |
| `src/app/globals.css` | Mobile Customer-Detail Spacing |

---

## Verifikation

```
npm run lint      ✔
npm run typecheck ✔
npm run build     ✔
```

### Getestete Flows (logisch / Code-Pfad)

- [x] Liste laden / Fehler / Empty
- [x] Kunde öffnen + Formular korrekt
- [x] Kunde wechseln → Formular + History aktualisiert
- [x] Speichern mit Validierung
- [x] Löschen blockiert bei Verknüpfungen
- [x] Archivieren als Alternative
- [x] `?id=` Deep-Link
- [x] Mobile Master-Detail

---

## Bewertung: **9/10**

Kern-CRM-Flows sind stabil. Offen für Phase 2: dedizierte `GET /customers/[id]`, Review-Match per E-Mail sobald Schema erweitert, Permission `customers:write` in API-Routes.
