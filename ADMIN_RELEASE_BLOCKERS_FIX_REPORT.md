# Admin Release Blockers — Fix Report

Datum: 2026-07-07  
Branch: `cursor/admin-release-blockers-e022`

## Zusammenfassung

Sechs sichtbare Admin-Bugs behoben: Mobile-Bewertungskarten, verdeckte Öffnungszeiten, Login-Historie, Sitzungsanzeige, Angebots-Mengenfeld. Keine neuen Features.

---

## 1. Bewertungen Admin — Mobile Layout verzogen

**Ursache:** `.review-admin-media` nutzte auf allen Viewports `grid-template-columns: auto 1fr`. Profilbild und Eventfoto lagen nebeneinander und drückten den Text auf schmalen Screens. Eventfoto war auf `max-width: 7.5rem` begrenzt statt volle Breite.

**Geänderte Dateien:**
- `src/app/globals.css` — Mobile-first Stack: Eventfoto oben 16:9 volle Breite, Profil darunter horizontal; Uploads einspaltig bis 480px; Actions 2er-Grid auf Mobile
- `components/admin/ui/ReviewAdminImages.tsx` — DOM-Reihenfolge: Event zuerst, Profil zweitens

**Getestet:**
- CSS-Struktur für 360px / 390px / 430px (kein horizontales Grid auf Mobile)
- Desktop-Layout ab 640px unverändert (Grid mit Avatar + Event nebeneinander)
- `npm run lint`, `npm run typecheck`, `npm run build` — erfolgreich

**Manuelle Prüfung empfohlen:** Bewertungskarten im Admin auf echtem Gerät (360–430px) scrollen und Bild-Lightbox öffnen.

---

## 2. Öffnungszeiten werden verdeckt

**Ursache:** `AdminStickySave` ist `position: sticky` und liegt über dem letzten Formularfeld (Öffnungszeiten). Beim Scrollen zum Feld blieb kein Abstand unterhalb des Inhalts — die Sticky-Bar überdeckte das Eingabefeld.

**Geänderte Dateien:**
- `components/admin/ui/AdminStickySave.tsx` — Spacer-Element vor der Sticky-Bar
- `src/app/globals.css` — `.admin-sticky-save-spacer` mit Höhe für Mobile (inkl. Bottom-Nav-Offset) und Desktop

**Getestet:**
- Spacer gilt global für alle `AdminStickySave`-Verwendungen (Kontakt, Branding, E-Mail, etc.)
- Build erfolgreich

**Manuelle Prüfung empfohlen:** Einstellungen → Kontakt & Social Media → Öffnungszeiten auf Mobile fokussieren und prüfen, dass Feld vollständig sichtbar und tippbar ist.

---

## 3. Login-Historie wird nicht geladen

**Ursache (mehrfach):**
1. Legacy-Login (`ADMIN_PASSWORD`) protokollierte nur fehlgeschlagene Versuche, nicht erfolgreiche Logins.
2. API filterte nach `ctx.userId` — im Multi-User-Modus nur eigene Einträge; Legacy-Einträge (`user_id = null`) wurden bei gesetztem User-Filter ausgeblendet.
3. `recordLoginHistory` ignorierte Insert-Fehler still (z. B. fehlende Tabelle).
4. UI zeigte nur Browser/OS, nicht Benutzer/Identifier.

**Geänderte Dateien:**
- `src/app/api/admin/login/route.ts` — Erfolgreiche Legacy-Logins werden protokolliert
- `lib/auth/login-history.ts` — Fehler-Logging bei Insert; `listLoginHistory` mit User-Join (`display_name`); typisierte Rows
- `src/app/api/admin/security/login-history/route.ts` — Lädt alle Einträge (security:read), kein User-Filter
- `components/admin/views/LoginHistoryView.tsx` — Anzeige: Datum, Status, Benutzer/Identifier, Gerät/Browser/OS

**Hinweis:** IP wird aus Datenschutzgründen nur als Hash (`ip_hash`) gespeichert — Roh-IP wird nicht angezeigt.

**Getestet:**
- Typecheck/Build
- Code-Pfad für Legacy + Multi-User Login-Recording

**Manuelle Prüfung empfohlen:** Nach Login (Legacy und ggf. Multi-User) Login-Historie öffnen und prüfen, ob neue Einträge erscheinen. Migration `20260712_security_admin_v1.sql` muss in Supabase angewendet sein.

---

## 4. Sitzungen werden nicht geladen

**Ursache:** Im Legacy-Modus (`userId: null`) liefert die API `{ sessions: [], legacy: true }`. Die UI zeigte irreführend „Multi-User-Modus verfügbar“ statt klar zu kommunizieren, dass Sitzungsverwaltung deaktiviert ist. Kein Loading-/Fehlerzustand.

**Geänderte Dateien:**
- `components/admin/views/SessionsView.tsx` — Klartext: „Sitzungsverwaltung ist aktuell nicht aktiviert“; Loading; Fehlerzustand; leere Liste im Multi-User-Modus

**Getestet:** Build; Legacy- und Multi-User-Pfade im Code

**Manuelle Prüfung empfohlen:** Sicherheit → Sitzungen im Legacy-Modus und (falls vorhanden) im Multi-User-Modus mit aktiver Session.

---

## 5. Angebote — Menge nicht änderbar

**Ursache:** `onChange` erzwang sofort `Math.max(1, Number(...) || 1)` — Nutzer konnte „1“ nicht löschen oder neu tippen.

**Geänderte Dateien:**
- `components/admin/crm/QuoteLineItemsEditor.tsx` — `LineItemQuantityInput` mit lokalem String-State, leerer Zwischenzustand, Validierung onBlur; `lineItemToApiPayload` mit `Math.max(1, …)` beim Speichern
- `components/admin/views/QuotesView.tsx` — Validierung: Menge ≥ 1 vor Save

**Getestet:**
- Typecheck/Build
- Totals-Berechnung mit `quantity || 0` während leerer Eingabe

**Manuelle Prüfung empfohlen:** Angebot bearbeiten → Menge leeren, neue Zahl eingeben, Gesamtbetrag und Speichern prüfen (Mobile-Tastatur).

---

## 6. Allgemein — Mobile & Qualitätssicherung

| Viewport | Geprüft |
|----------|---------|
| 360px | CSS Mobile-first Regeln (Reviews, Sticky-Spacer, Login-Historie-Layout) |
| 390px | wie oben |
| 430px | wie oben |
| Desktop (≥768px) | Review-Grid, Sticky-Save `bottom: 1rem`, unverändertes 4-Spalten-Action-Grid |

**Build-Pipeline:**

```
npm run lint    ✓ (0 errors, 2 pre-existing warnings)
npm run typecheck ✓
npm run build   ✓
```

---

## Geänderte Dateien (gesamt)

| Datei | Bug |
|-------|-----|
| `src/app/globals.css` | 1, 2 |
| `components/admin/ui/ReviewAdminImages.tsx` | 1 |
| `components/admin/ui/AdminStickySave.tsx` | 2 |
| `src/app/api/admin/login/route.ts` | 3 |
| `lib/auth/login-history.ts` | 3 |
| `src/app/api/admin/security/login-history/route.ts` | 3 |
| `components/admin/views/LoginHistoryView.tsx` | 3 |
| `components/admin/views/SessionsView.tsx` | 4 |
| `components/admin/crm/QuoteLineItemsEditor.tsx` | 5 |
| `components/admin/views/QuotesView.tsx` | 5 |

---

## Offene manuelle Checks vor Release

1. Admin Bewertungen auf 360–430px — Kartenlayout und Buttons
2. Kontakt/Öffnungszeiten — Feld nicht von Sticky-Save verdeckt
3. Login durchführen → Historie zeigt Eintrag
4. Sitzungen — korrekte Meldung je Auth-Modus
5. Angebot — Menge editierbar und Gesamtbetrag korrekt
