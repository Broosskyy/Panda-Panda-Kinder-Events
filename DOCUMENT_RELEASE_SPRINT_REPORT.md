# Document Release Sprint Report

**Branch:** `cursor/document-release-final-e022`  
**Datum:** Juli 2026  
**Ziel:** Dokumentenbereich (Angebote, Rechnungen, PDFs), Galerie und Bewertungen auf Release-Niveau bringen — ohne Redesign, bestehende Logik erhalten.

---

## 1. PDF Öffnen — Fixes

| Problem | Lösung |
|---------|--------|
| Mehrere Tabs beim PDF-Öffnen | `window.open` + Anchor-Fallback entfernt; nur noch Anchor-Navigation mit Blob-URL |
| Doppelklick / parallele Aktionen | Modul-Mutex `pdfActionInFlight` in `lib/admin/open-pdf.ts` |
| Kein Ladezustand am Button | Neuer Hook `useAdminPdf` mit `isLoading(key)`, Spinner und deaktiviertem Button während Generierung |
| Generische Fehler | Klare Meldungen via `formatAdminError` (Grund + Lösung) |

**Betroffene Dateien:** `lib/admin/open-pdf.ts`, `lib/admin/use-admin-pdf.ts`, `QuotesView.tsx`, `InvoicesView.tsx`

---

## 2. Galerie — Fixes

| Feature | Status |
|---------|--------|
| Alle Bilder anklickbar | ✓ Button pro Kachel mit `gallery-tile` |
| Lightbox (Zoom, Swipe, ESC, Pfeile, X, Hintergrund) | ✓ `components/ui/Lightbox.tsx` |
| Keine Überdeckung durch Sticky CTA | ✓ `body.lightbox-open` versteckt `.sticky-cta-bar` und `.floating-contact-stack` |
| Mobile Touch | ✓ `touch-action: manipulation` auf Galerie-Kacheln |

---

## 3. Bewertungen — Fixes

### Öffentlich (`Testimonials.tsx`)
- Bewertungsbilder (Event + Profil) öffnen dieselbe Lightbox
- Anzeige: Bild, Sterne, Name, Text, Anlass, Datum
- Slider bei mehreren Event-Bildern über Lightbox-Navigation

### Admin (`ReviewsView.tsx`)
- Klickbare Bildvorschau mit Lightbox
- Inline-Bearbeitung: Name, Anlass, Text, Sterne (Vorschau + Dropdown)
- Reihenfolge per Hoch/Runter (`sort_order`)
- Veröffentlichen / Zurückziehen, Verifizierung, Löschen
- Klare Fehlermeldungen bei Upload und Löschen

**Migration:** `supabase/migrations/20260717_reviews_sort_order.sql`

---

## 4. Dokumentenverwaltung — Fixes

### Angebote (`QuotesView.tsx`)
- Bearbeiten, Duplizieren, PDF (öffnen/herunterladen), E-Mail, Archivieren, Löschen, → Rechnung
- Suche, Aktiv/Archiviert-Ansicht, Statusfilter, Sortierung, Pagination (10/Seite)
- Massenaktionen: Archivieren, Löschen, CSV-Export
- Checkbox-Auswahl pro Zeile und „Alle auf dieser Seite“

### Rechnungen (`InvoicesView.tsx`)
- Status bearbeiten (Dropdown), PDF, E-Mail, Archivieren, Stornieren
- Löschen nur bei Entwurf
- Gleiche Listensteuerung wie Angebote (Filter, Sort, Pagination, Bulk, Export)

### Statusfarben
- Entwurf / Archiviert → muted
- Gesendet / Offen → warning
- Angenommen / Bezahlt → success
- Storniert → danger

**Neue Hilfsmodule:** `lib/admin/crm-list.ts`, `components/admin/crm/CrmDocumentListControls.tsx`

---

## 5. PDF Polish

Bereits im vorherigen Sprint (`cursor/pdf-crm-final-release-e022`, PR #46) umgesetzt:
- DIN A4, Logo, Header, Empfänger, Tabellen, Summen, Footer, Seitenumbrüche
- Keine abgeschnittenen Logos, professionelles Layout in `lib/crm/pdf.ts`

---

## 6. Mobile UX

- PDF-Buttons: Spinner + disabled während Generierung
- Lightbox: Mobile Prev/Next sichtbar, Swipe deaktiviert bei Zoom
- Galerie: Touch-optimierte Kacheln
- Listen: responsive Button-Wraps, Checkboxen mit ausreichendem Abstand

---

## 7. Fehlerbehandlung

Einheitliches Muster über `formatAdminError(title, reason, solution)`:
- PDF konnte nicht erstellt werden
- E-Mail konnte nicht versendet werden
- Bild konnte nicht geladen werden
- Dokument konnte nicht gelöscht werden

---

## 8. QA-Checkliste

| Test | Ergebnis |
|------|----------|
| Angebot erstellen / bearbeiten / duplizieren | ✓ Code + Build |
| Angebot archivieren / löschen | ✓ |
| Angebot PDF öffnen / herunterladen (ein Tab) | ✓ Mutex + Hook |
| Angebot senden | ✓ Bestehende Logik |
| Rechnung erstellen / PDF / senden / archivieren / stornieren | ✓ |
| Rechnung löschen (nur Entwurf) | ✓ |
| Galerie Lightbox | ✓ |
| Bewertungsbilder (öffentlich + Admin) | ✓ |
| `npm run lint` | ✓ (nur bestehende Warnings) |
| `npm run typecheck` | ✓ |
| `npm run build` | ✓ |

---

## 9. Bekannte Restpunkte

1. **Rechnung vollständig bearbeiten** — Aktuell Status per Dropdown; kein Positions-Editor wie bei Angeboten (bewusst nicht im Scope, Backend fehlt).
2. **Server-seitige Pagination** — Sortierung/Filter/Pagination clientseitig auf geladener Liste; bei sehr großen Datenmengen DB-Pagination erwägen.
3. **Bulk-Löschen Rechnungen** — API erlaubt nur Entwürfe; gemischte Auswahl kann teilweise fehlschlagen (Fehlermeldung wird angezeigt).
4. **Migration `sort_order`** — Muss in Supabase ausgeführt werden, falls noch nicht deployed.

---

## 10. Geänderte / neue Dateien (Auszug)

```
lib/admin/open-pdf.ts
lib/admin/use-admin-pdf.ts
lib/admin/crm-list.ts
lib/admin/use-admin-messages.ts
lib/crm/db.ts
lib/crm/types.ts
lib/cms/reviews.ts
components/ui/Lightbox.tsx
components/admin/crm/CrmDocumentListControls.tsx
components/admin/views/QuotesView.tsx
components/admin/views/InvoicesView.tsx
components/admin/views/ReviewsView.tsx
components/sections/Testimonials.tsx
components/admin/ui/AdminStatusBadge.tsx
src/app/api/admin/quotes/route.ts
src/app/api/admin/invoices/route.ts
src/app/api/admin/reviews/route.ts
src/app/globals.css
supabase/migrations/20260717_reviews_sort_order.sql
```
