# Push Gerät registrieren + 2FA Passwort-Flow Fix Report

**Datum:** 2026-07-09  
**Branch:** `cursor/push-register-invite-password-fix-dab0`

---

## 1. Push: „Gerät registrieren“ + Diagnose hängt

### Root Cause

`navigator.serviceWorker.ready` konnte **unbegrenzt hängen**. Dadurch:
- `beginPushSubscriptionInClick()` kehrte nie zurück → Button blieb im Loading ohne Toast
- `collectPushLiveDebugState()` kehrte nie zurück → „Diagnose wird geladen …“ für immer
- `refreshDebugState()` setzte bei Fehler keinen Fallback-State

### Fix

| Änderung | Datei |
|----------|-------|
| `withTimeout()` + 15s Limit für `serviceWorker.ready` | `lib/admin/push/timeout.ts` |
| Timeout in Subscribe-Kette + Register-Flow | `activate-flow.ts` |
| Diagnose: parallele SW + API, Timeout, Fallback-Snapshot | `debug-state.ts` |
| `buildSyncPushDebugSnapshot()` — sofortige Anzeige beim Klick | `debug-state.ts` |
| Permission bereits `granted` → sync resolve (kein unnötiger Prompt) | `activate-flow.ts` |
| Loading-Spinner + Statuszeile + Toast bei jedem Fehler | `AdminPushNotificationsPanel.tsx` |
| Diagnose zeigt: Permission, SW ready, PushManager, Browser-Sub, DB-Sub, Serverantwort, Fehler, Test-Push | Panel |

### Ablauf „Gerät registrieren“

1. Klick → sofortiger Debug-Snapshot + Loading
2. `beginPermissionRequest()` (sync wenn granted)
3. `beginPushSubscriptionInClick()` (sync Kette mit Timeout)
4. Subscription validieren → Server speichern → DB verifizieren
5. Toast „Push aktiviert“ → Status **Aktiviert** → **Test-Push-Button**

Bei Fehler: Toast + `Letzter Fehler` in Diagnose (z. B. SW-Timeout nach 15s).

---

## 2. 2FA Einladung: Passwortfehler zu spät

### Root Cause

- Client erlaubte Passwort mit `minLength={8}`, Server verlangt **12 Zeichen**
- Validierung erst beim „Account aktivieren“ (Schritt 2)
- Kein Zurück zum Passwort-Schritt

### Fix

| Änderung | Datei |
|----------|-------|
| `passwordPolicy` in `/api/admin/invites/validate` | `validate/route.ts` |
| Live-Regeln (Länge, Großbuchstabe, Zahl, Übereinstimmung) | `AdminInviteAcceptForm.tsx` |
| `lib/auth/password-rules.ts` — clientseitige Validierung | neu |
| „Weiter zu 2FA“ nur aktiv wenn Passwort gültig | Form |
| „← Zurück zum Passwort ändern“ auf Schritt 2 | Form |
| Server: `field: "password"` → zurück zu Schritt 1 | `accept/route.ts` |

### Akzeptanz

- Zu kurzes Passwort **sofort** im Passwort-Schritt sichtbar
- Jederzeit zurück zum Passwort
- QR + manueller Schlüssel + Kopieren auf Schritt 2
- Account aktivieren nur mit gültigem Passwort + 2FA-Code

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
1. Permission erlaubt, Status „Gerät noch nicht registriert“
2. „Gerät registrieren“ → Loading sichtbar
3. Diagnose zeigt Werte (nicht dauerhaft „wird geladen …“)
4. Erfolg: „Aktiviert“ + Test-Button ODER konkrete Fehlermeldung

### 2FA Einladung
1. Passwort &lt; 12 Zeichen → Regel rot, Button deaktiviert
2. Gültiges Passwort → Weiter zu 2FA
3. Zurück-Link → Passwort änderbar
4. QR + Schlüssel + Account aktivieren

---

## Geänderte Dateien

- `lib/admin/push/timeout.ts` (neu)
- `lib/admin/push/activate-flow.ts`
- `lib/admin/push/debug-state.ts`
- `components/admin/AdminPushNotificationsPanel.tsx`
- `lib/auth/password-rules.ts` (neu)
- `components/admin/AdminInviteAcceptForm.tsx`
- `src/app/api/admin/invites/validate/route.ts`
- `src/app/api/admin/invites/accept/route.ts`
