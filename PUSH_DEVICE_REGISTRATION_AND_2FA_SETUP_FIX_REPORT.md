# Push Gerät registrieren + 2FA Setup Fix Report

**Datum:** 2026-07-09  
**Branch:** `cursor/push-device-registration-2fa-fix-dab0`

---

## 1. Push: „Gerät registrieren“ reagiert nicht

### Root Cause

Wenn `Notification.permission` bereits `granted` war, startete der Flow mit `Promise.resolve("granted")` und führte `pushManager.subscribe()` erst nach `await serviceWorker.ready` aus. Auf **iOS** geht dabei der **User-Gesture-Kontext** verloren — `subscribe()` schlägt still fehl oder wird ignoriert, ohne sichtbares Feedback wenn der Fehler nicht klar propagiert wurde.

Zusätzlich:
- Kein `loading`-Spinner am Button
- Debug-Panel nicht automatisch sichtbar im Zustand `granted_not_registered`

### Fix

| Änderung | Datei |
|----------|-------|
| `beginPushSubscriptionInClick()` — startet SW+subscribe-Kette **synchron im Klick** | `lib/admin/push/activate-flow.ts` |
| Bei `granted_not_registered`: Subscription-Promise sofort im Click starten | `AdminPushNotificationsPanel.tsx` |
| Immer `beginPermissionRequest()` (auch bei granted) | Panel + activate-flow |
| Button `loading={busy}` + Text „Registriere Gerät…“ | Panel |
| Debug auto-open + Serverantwort/Letzter Fehler sichtbar | Panel + debug-state |
| `serverResponse` im Flow-Ergebnis | activate-flow |

### Ablauf nach Fix

1. Klick → Loading sichtbar
2. `beginPermissionRequest()` + `beginPushSubscriptionInClick()` synchron
3. Permission prüfen → Subscription erstellen/wiederverwenden
4. Server speichern → DB verifizieren
5. Status **Aktiviert** oder Toast mit Fehler

### Akzeptanz

Nach Klick auf „Gerät registrieren“:
- **A)** Status „Aktiviert“ + Test-Button  
- **B)** Klare Fehlermeldung (Toast + Diagnose)

---

## 2. 2FA Einladung: QR allein unzureichend

### Root Cause

`AdminInviteAcceptForm` zeigte nur QR-Code. `pendingSecret` wurde vom Server geliefert, aber nicht in der UI angezeigt — manuelle Einrichtung in Authenticator-Apps unmöglich.

### Fix (`AdminInviteAcceptForm.tsx`)

- Abschnitt **„Manueller Einrichtungsschlüssel“** mit Base32-Secret
- Button **„Schlüssel kopieren“** (Clipboard)
- Hinweistext für manuelle Eingabe
- 6-stelliges Code-Feld + **„Account aktivieren“** unverändert sichtbar
- Klare Fehlermeldung bei falschem Code
- Erfolgshinweis nach Passwort-Schritt

### Akzeptanz

Neuer Benutzer kann 2FA per **QR-Code ODER manuellem Schlüssel** einrichten.

---

## Tests

```bash
npm run test:admin-pwa-push
npm run test:admin-invites-2fa
npm run lint
npm run typecheck
npm run build
```

---

## Manuelle Verifikation

### Push
1. Permission erlauben (falls noch nicht)
2. Status: „Berechtigung erlaubt, aber Gerät noch nicht registriert“
3. „Gerät registrieren“ → Loading → Status „Aktiviert“
4. Push Diagnose: Subscription im Browser + DB = ja
5. Test-Push senden

### 2FA Einladung
1. Einladungslink öffnen
2. Passwort setzen → QR + manueller Schlüssel sichtbar
3. Schlüssel kopieren
4. Code eingeben → Account aktivieren

---

## Geänderte Dateien

- `lib/admin/push/activate-flow.ts`
- `lib/admin/push/debug-state.ts`
- `components/admin/AdminPushNotificationsPanel.tsx`
- `components/admin/AdminInviteAcceptForm.tsx`
- `scripts/admin-pwa-push-notifications-test.mjs`
- `scripts/admin-invites-mandatory-2fa-test.mjs`
