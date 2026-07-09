# Push: Permission OK, aber keine Benachrichtigung — Fix Report

**Datum:** 2026-07-09  
**Branch:** `cursor/push-subscription-send-fix-dab0`  
**Scope:** Kompletter Push-Flow nach erteilter Permission (Subscription → DB → Send → Inquiry)

---

## Symptom

- Android und iOS fragen nach Benachrichtigungen ✓
- User erlaubt Benachrichtigungen ✓
- Bei neuer öffentlicher Anfrage kommt **keine** Push-Benachrichtigung ✗
- Button/Status wirkt instabil ✗

**Fazit:** Permission funktioniert — Fehler liegt im Pipeline nach der Permission.

---

## Root Causes (identifiziert)

### 1. Fire-and-forget Inquiry Push (kritisch)

**Datei:** `src/app/api/inquiry/route.ts`

```ts
void import(...).then(({ notifyAdminsNewInquiry }) => notifyAdminsNewInquiry());
```

Auf Vercel/Serverless kann die Funktion beendet werden, **bevor** `webpush.sendNotification` ausgeführt wird. Die Anfrage wird gespeichert, aber der Push nie gesendet — ohne Fehlermeldung.

**Fix:** `await notifyAdminsNewInquiry()` in try/catch (Anfrage bleibt gespeichert bei Push-Fehler).

### 2. Permission granted ≠ Gerät registriert

UI zeigte „Erlaubt“, obwohl keine DB-Subscription existierte (`subscribed: false`). Nutzer dachten Push sei aktiv.

**Fix:** Neuer Status `granted_not_registered` mit Text *„Berechtigung erlaubt, aber Gerät noch nicht registriert“* und Button **„Gerät registrieren“**.

### 3. Keine Verifikation nach Subscription-Speichern

Client sendete Subscription an Server, prüfte aber nicht, ob DB-Eintrag wirklich existiert.

**Fix:** Steps `verify_subscription` (endpoint/p256dh/auth) und `verify_server` (GET `/api/admin/push` + `userActiveSubscriptionCount`).

### 4. Stille Server-Fehler

- `notifyAdminsNewInquiry()` returnierte bei 0 Empfängern ohne Log
- Test-Push bei Fehler nur generische Meldung
- Subscribe-API loggte nicht strukturiert

**Fix:** `lib/admin/push/log.ts` mit Events:
`push_subscription_saved`, `push_subscription_save_failed`, `test_push_send_*`, `inquiry_push_send_*`, `invalid_subscription_disabled`

### 5. Upsert ohne Rückgabe/Validierung

`upsertPushSubscription` warf bei Erfolg nichts zurück — keine Prüfung auf `enabled=true`, `revoked_at=null`, vollständige Keys.

**Fix:** `.select().single()` nach Upsert + Validierung aller Pflichtfelder.

---

## Implementierte Änderungen

### Client

| Datei | Änderung |
|-------|----------|
| `activate-flow.ts` | `verify_subscription`, `verify_server` nach POST |
| `debug-state.ts` | DB-Diagnose: User-Count, Admin-Count, `receivesInquiryPush` |
| `AdminPushNotificationsPanel.tsx` | Status A–D, „Gerät registrieren“, Push Diagnose |

### Server

| Datei | Änderung |
|-------|----------|
| `subscriptions.ts` | `upsert` mit Return + Validierung; `countActiveSubscriptionsForUser` |
| `send.ts` | Detaillierte `PushSendDetailedResult`; strukturiertes Logging |
| `log.ts` | Zentrale Push-Log-Events |
| `route.ts` (GET) | `diagnostics` mit DB-Counts |
| `subscribe/route.ts` | Logging + `subscriptionId` in Response |
| `test/route.ts` | HTTP-Status + Error-Details in Response |
| `inquiry/route.ts` | `await notifyAdminsNewInquiry()` |

---

## UI-Status (neu)

| Zustand | Status-Text | Button |
|---------|-------------|--------|
| A) Permission default, keine Sub | Noch nicht erlaubt | Benachrichtigungen aktivieren |
| B) Permission granted, keine DB-Sub | Berechtigung erlaubt, aber Gerät noch nicht registriert | Gerät registrieren |
| C) Permission granted + DB-Sub | Aktiviert | Test-Benachrichtigung + Deaktivieren |
| D) Permission denied | Im Browser blockiert | Hinweis (kein Button) |

---

## Push Diagnose (Admin)

Live-Anzeige unter **„Push Diagnose“**:

- Permission
- Subscription im Browser vorhanden
- Subscription in DB gespeichert
- Anzahl aktive Subscriptions (aktueller User)
- Anzahl aktive Admin-Subscriptions gesamt
- Erhält Anfrage-Push (Rolle administrator/manager)
- SW / PushManager / VAPID / Standalone

---

## Verifikation nach Deploy

### Schritt 1 — Aktivierung

1. Push aktivieren (oder „Gerät registrieren“)
2. Status muss **„Aktiviert“** zeigen (nicht nur „Erlaubt“)
3. Push Diagnose: Browser-Sub **ja**, DB-Sub **ja**, User-Count ≥ 1

### Schritt 2 — Test-Push

1. „Test-Benachrichtigung senden“
2. Benachrichtigung muss auf Gerät erscheinen
3. Bei Fehler: Toast mit HTTP-Status + Message

### Schritt 3 — Inquiry-Push

1. Öffentliche Anfrage über Website senden
2. Vercel-Logs prüfen:
   - `[push:inquiry_push_send_started]`
   - `[push:inquiry_push_recipients_count] {"count":N}`
   - `[push:inquiry_push_send_success]` oder `[push:inquiry_push_send_failed]` mit Grund
3. Push auf Admin-Gerät; Klick öffnet `/admin/anfragen`

### Wenn keine Push kommt — Diagnose-Matrix

| Log / Diagnose | Bedeutung |
|----------------|-----------|
| `userActiveSubscriptionCount: 0` | Keine DB-Subscription → „Gerät registrieren“ |
| `totalAdminSubscriptionCount: 0` | Kein Admin hat Push aktiv |
| `receivesInquiryPush: nein` | Rolle ist nicht administrator/manager |
| `inquiry_push_recipients_count: 0` | Keine Empfänger in DB |
| `test_push_send_failed` + HTTP 410/404 | Subscription ungültig → neu aktivieren |
| `inquiry_push_send_failed` + VAPID | Keys falsch / nicht deployed |
| Browser-Sub ja, DB nein | Speichern fehlgeschlagen → Logs `push_subscription_save_failed` |

---

## Tests

```bash
npm run test:admin-pwa-push
npm run typecheck
npm run lint
npm run build
```

---

## Noch manuell auf Gerät prüfen

Dieser Fix adressiert die identifizierten Code-Ursachen. **Nicht als vollständig verifiziert markieren**, bis auf echtem Android + iOS PWA bestätigt:

- [ ] Test-Push kommt an
- [ ] Inquiry-Push kommt an
- [ ] Klick öffnet `/admin/anfragen`

---

## Zusammenfassung

| Problem | Fix |
|---------|-----|
| Inquiry-Push stirbt auf Serverless | `await` statt fire-and-forget |
| UI zeigt „aktiv“ ohne DB | `granted_not_registered` + Server-Verifikation |
| Subscription nicht in DB | Upsert mit Validierung + verify_server |
| Fehler unsichtbar | Strukturiertes Logging + Diagnose-Panel |
| Test-Push ohne Details | HTTP-Status + webpush-Fehler in API-Response |
