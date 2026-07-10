# RELEASE PHASE 1 REPORT — Panda-Bande V1

**Datum:** 10. Juli 2026  
**Branch:** `cursor/release-phase-1-ux-ca08`  
**Ziel:** V1 auf Release-Niveau bringen — Bugs, UX, Konsistenz, Mobile/Desktop. Keine neuen Features.

---

## Zusammenfassung

| Bereich | Status |
|---------|--------|
| 1. Onboarding + Erste Schritte getrennt | ✅ Umgesetzt |
| 2. Einheitliche Bearbeitung (`/admin/.../id`) | ✅ Umgesetzt |
| 3. Verknüpfungen sichtbar | ✅ Verbessert |
| 4. Löschen ohne SQL-Fehler | ✅ Bestätigt |
| 5. Mobile UX | ✅ Geprüft (bestehende Patterns) |
| 6. Dialoge vereinheitlicht | ✅ `AdminDialogFooter` |
| 7. Toasts | ✅ Bestehendes System |
| 8. Buttons | ✅ Konsistent |
| 9. Leere Zustände | ✅ Bestehend + aktualisiert |
| 10. Release Check | ✅ lint, typecheck, build |

---

## Behobene Bugs

| Bug | Fix |
|-----|-----|
| Onboarding und Erste Schritte inhaltlich/UX überlappend | Klare Trennung: Tutorial nur beim ersten Login; Checkliste dauerhaft unter Erste Schritte |
| Erste Schritte mit veralteten Nav-Pfaden („Kommunikation →“, „CRM →“) | Texte an flache Navigation angepasst |
| Inkonsistente Bearbeitung (Kunden Split-View, Angebote inline) | Große Datensätze öffnen eigene Seiten unter `/admin/.../[id]` |
| Verknüpfungs-Links zeigten nur Listen-URLs ohne ID | `customer-links.ts` verlinkt jetzt direkt auf Detailseiten |
| Lösch-Dialog ohne einheitliche Button-Reihenfolge | `CustomerDeleteBlockedModal` nutzt `AdminDialogFooter` |
| `?id=` Deep-Link für Kunden veraltet | Redirect auf `/admin/kunden/[id]` |
| ESLint: `<a>` statt `<Link>` in ContentView | Behoben |

---

## UX-Verbesserungen

### 1. Erste Schritte (dauerhafte Checkliste)
- Eigener Menüpunkt unter **Mehr → Erste Schritte**
- Fortschrittsbalken mit Auto-Erkennung (API `/api/admin/first-steps`)
- Startet **niemals automatisch**
- Klare Abgrenzung zum Tutorial in der Hilfe-Box

### 2. Onboarding (nur erstes Login)
- Unverändert: Auto-Open bis `onboarding_completed_at` gesetzt
- **Tutorial erneut starten** nur unter **Einstellungen → Hilfe**
- Profil-Karte mit Tutorial-Button aus Einstellungen entfernt

### 3. Einheitliche Bearbeitungsseiten

| Entität | Liste | Bearbeitung |
|---------|-------|-------------|
| Kunden | `/admin/kunden` | `/admin/kunden/[id]` |
| Angebote | `/admin/angebote` | `/admin/angebote/[id]`, neu: `/admin/angebote/neu` |
| Rechnungen | `/admin/rechnungen` | `/admin/rechnungen/[id]` |
| Anfragen/Veranstaltungen | `/admin/anfragen` | `/admin/anfragen/[id]` |
| Team | `/admin/team` | `/admin/team/[id]`, neu: `/admin/team/neu` |

Kleine Aktionen (Neuer Kunde) bleiben als Popup in der Liste.

### 4. Verknüpfte Daten (Kunde)
- Öffnen, Bearbeiten, Verknüpfung ändern/lösen, Archivieren, Löschen
- Direkte Links zu Detailseiten
- Blockierter Lösch-Dialog mit Grund-Auflistung

### 5. Dialoge
- Neuer `AdminDialogFooter`: Primary → Secondary → Danger → Abbrechen (immer zuletzt)

---

## Geänderte Screens

| Screen | Änderung |
|--------|----------|
| Erste Schritte | Checkliste mit Fortschritt |
| Einstellungen → Hilfe | Neuer Tab mit Tutorial + Link zu Erste Schritte |
| Kunden (Liste) | Nur Liste + Popup für Neuanlage |
| Kunde (Detail) | Neue Seite `/admin/kunden/[id]` |
| Angebote (Liste) | Kein Inline-Formular mehr |
| Angebot (Detail/Neu) | `/admin/angebote/[id]`, `/admin/angebote/neu` |
| Rechnungen (Liste) | „Öffnen“ → Detailseite |
| Rechnung (Detail) | `/admin/rechnungen/[id]` |
| Anfragen (Liste) | „Anfrage öffnen“ → Detailseite |
| Anfrage (Detail) | `/admin/anfragen/[id]` |
| Team (Liste) | Bearbeitung über eigene Seite |
| Teammitglied (Detail/Neu) | `/admin/team/[id]`, `/admin/team/neu` |
| Kunde → Verknüpfte Daten | Bearbeiten-Button, korrekte URLs |
| Kunde löschen blockiert | Einheitlicher Dialog |

---

## Offene Bugs / Bekannte Limits

| Thema | Status |
|-------|--------|
| Rechnungen: kein Positions-Editor auf Detailseite (nur Anzeige + Aktionen) | Akzeptiert — Rechnungen entstehen aus Angeboten |
| Browser-Tests (Chrome/Safari/Edge/Firefox, iPhone/Android) | Manuell vom Team zu prüfen — keine automatisierten E2E in CI |
| `team_members.archived` Spalte in first-steps Query | Fallback auf `active` — funktioniert mit bestehendem Schema |
| Benutzer-Verwaltung bleibt Popup (`AdminUserManageDialog`) | Bewusst — kleine Aktion laut Spezifikation |

---

## Release Check

```bash
npm run lint       # ✅ 0 errors
npm run typecheck  # ✅ passed
npm run build      # ✅ 94 routes, inkl. neue [id]-Seiten
```

### Responsive / Browser (manuell empfohlen)

| Gerät | Status |
|-------|--------|
| Desktop (Chrome) | Code-Review ✅ |
| Tablet | Bestehende responsive Klassen |
| iPhone / Android | `min-h-11` Touch-Targets, Bottom Sheets unverändert |
| Safari / Edge / Firefox | Keine browserspezifischen Regressionen erwartet |

---

## Neue Dateien

- `lib/admin/first-steps.ts`
- `src/app/api/admin/first-steps/route.ts`
- `src/app/api/admin/customers/[id]/route.ts` (GET)
- `src/app/api/admin/bookings/[id]/route.ts` (GET)
- `components/admin/ui/AdminDialogFooter.tsx`
- `components/admin/views/CustomerEditView.tsx`
- `components/admin/views/QuoteEditView.tsx`
- `components/admin/views/InvoiceDetailView.tsx`
- `components/admin/views/BookingDetailView.tsx`
- `components/admin/views/TeamMemberEditView.tsx`
- `src/app/admin/kunden/[id]/page.tsx`
- `src/app/admin/angebote/[id]/page.tsx`
- `src/app/admin/angebote/neu/page.tsx`
- `src/app/admin/rechnungen/[id]/page.tsx`
- `src/app/admin/anfragen/[id]/page.tsx`
- `src/app/admin/team/[id]/page.tsx`
- `src/app/admin/team/neu/page.tsx`

---

**Status: READY FOR V1 RELEASE** (nach manueller Browser-/Geräte-Prüfung)
