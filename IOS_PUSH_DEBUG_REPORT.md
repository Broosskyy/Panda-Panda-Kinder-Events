# iOS-PWA Push Debug Report

**Datum:** 2026-07-09  
**Scope:** Ausschließlich iOS-PWA-Push-Aktivierungsflow  
**Branch:** `cursor/ios-push-debug-fix-dab0`

---

## Symptom (gemeldet)

- VAPID Keys vorhanden
- PWA installiert, Safari iOS 16.4+
- Button „Benachrichtigungen aktivieren“ reagiert nicht sichtbar
- Kein Permission-Dialog
- Keine Subscription
- Keine Fehlermeldung

---

## Root Cause (tatsächlich, nicht geschätzt)

### 1. Falscher API-Gate: `PushManager in window`

**Datei:** `lib/admin/push/platform.ts` (vorher)

Die alte Hilfsfunktion `hasPushApis()` verlangte:

```ts
"PushManager" in window
```

**Auf iOS 16.4+ in einer installierten PWA existiert `PushManager` nicht auf `window`.**  
Push ist dort nur über `ServiceWorkerRegistration.pushManager` verfügbar.

**Folge:** `detectPushPlatform().canSubscribe === false` → UI-Status `unsupported` → **Aktivierungs-Button wurde ausgeblendet** → Klick unmöglich, kein Toast, kein Permission-Dialog.

### 2. Stilles Abbrechen bei `permission === "default"`

**Datei:** `components/admin/AdminPushNotificationsPanel.tsx` (vorher)

```ts
if (result !== "granted") return; // ohne Toast
```

Wenn der Nutzer den Dialog schließt oder iOS keinen Prompt zeigt, blieb die UI ohne Feedback.

### 3. Kein Schritt-für-Schritt-Logging

Fehler in Service Worker, `pushManager` oder `subscribe()` wurden verschluckt (`catch { toast("…fehlgeschlagen") }` ohne Detail).

### 4. Plattform-Erkennung einmalig gecacht

`useMemo(() => detectPushPlatform(), [])` — nach PWA-Installation ohne Reload konnte `canSubscribe` veraltet bleiben.

---

## Prüfplan (Schritt für Schritt)

| # | Prüfung | Implementierung |
|---|---------|-----------------|
| 1 | `Notification.requestPermission()` ausgeführt? | `beginPermissionRequest()` + Log `[push:step] request_permission` |
| 2 | `navigator.serviceWorker.ready` erreicht? | `runPushActivateFlow` Step `service_worker_ready` |
| 3 | `registration.pushManager` vorhanden? | Step `push_manager` |
| 4 | `pushManager.subscribe()` aufgerufen? | Step `subscribe` |
| 5 | Welche Exception? | `console.error('[push:fail] …')` + Toast mit Message |
| 6 | Subscription am Server gespeichert? | Step `save_server` → `POST /api/admin/push/subscribe` |
| 7 | Jeder Fehler sichtbar? | Toast + „Letzter Fehler“-Box im Panel |
| 8 | `console.error` pro Schritt | `activate-flow.ts` → `logStep()` |
| 9 | Live-Debug-Status | `debug-state.ts` + Panel „Debug-Status“ |

---

## Änderungen

### `lib/admin/push/platform.ts`

- `hasBasicNotificationSupport()`: nur `Notification` + `serviceWorker`, **kein** `PushManager in window`
- iOS: `canSubscribe: true` nur wenn `isStandaloneDisplay()` (Home-Bildschirm-PWA)
- iPadOS Desktop-UA erkannt (`MacIntel` + `maxTouchPoints > 1`)

### `lib/admin/push/activate-flow.ts` (neu)

- `beginPermissionRequest()` — **synchron im Click-Handler** (iOS User-Gesture)
- `runPushActivateFlow()` — sequenzieller Flow mit `console.error` pro Schritt
- Explizite Fehlermeldungen für `default`, `denied`, fehlendes `pushManager`, Subscribe- und Server-Fehler

### `lib/admin/push/debug-state.ts` (neu)

- `collectPushLiveDebugState()` — live: Permission, SW, pushManager, Subscription, Server, Plattform, UA

### `components/admin/AdminPushNotificationsPanel.tsx`

- Button **immer sichtbar** solange nicht `activated` (auch bei `unsupported` / `not_configured`)
- Klick zeigt **immer** Toast bei Fehler — Button tut nie „nichts“
- Debug-Panel mit Live-Status + letzte Aktivierungsschritte
- Plattform wird bei jedem Klick und `loadStatus` neu ermittelt

### `lib/admin/push/client.ts`

- Entfernt: Export von `hasPushApis` (kaputter iOS-Gate)
- Export: `hasBasicNotificationSupport`

---

## Verifikation auf iPhone (nach Deploy)

1. Admin-PWA vom **Home-Bildschirm** öffnen (nicht Safari-Tab)
2. Einstellungen → Push → **„Debug-Status“** öffnen
3. Prüfen:
   - `Standalone (display-mode): ja` oder `navigator.standalone: ja`
   - `canSubscribe: ja`
   - `VAPID Public Key: ja`
4. **„Benachrichtigungen aktivieren“** tippen
5. iOS Permission-Dialog sollte erscheinen
6. Nach Erlaubnis: Debug zeigt `PushManager (Registration): ja`, `Browser-Subscription: ja`, `Server-Subscription: ja`
7. **Test-Benachrichtigung senden**

### Wenn Permission nicht erscheint

Debug-Panel + Safari Web Inspector (Mac → Entwickler → iPhone):

- `[push:fail] permission_result: …` — genauer Grund im Toast und in der Schrittliste
- `canSubscribe: nein` + `Standalone: nein` → App nicht als PWA geöffnet
- `pushManager (Registration): nein` → SW-Scope oder nicht installierte PWA
- `VAPID Public Key: nein` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY` fehlt im Build / Redeploy nötig

### Wenn `permission === default` nach Klick

Toast: *„Permission nicht erteilt (Status: default). Bitte erneut tippen.“*  
→ iOS hat den Prompt nicht gezeigt (häufig: nicht aus User-Gesture gestartet — jetzt behoben via `beginPermissionRequest()`).

---

## ENV (weiterhin erforderlich)

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@example.com
```

Nach ENV-Änderung: **Vercel Redeploy** (Public Key wird beim Build eingebettet).

---

## Tests

```bash
npm run test:admin-pwa-push
npm run typecheck
npm run lint
npm run build
```

---

## Zusammenfassung

| Problem | Fix |
|---------|-----|
| Button unsichtbar auf iOS-PWA | `PushManager in window`-Check entfernt |
| Kein Permission-Dialog | Sync `beginPermissionRequest()` im Click |
| Keine Fehlermeldung | Jeder Schritt → Toast + UI-Fehlerbox |
| Keine Diagnose | Live-Debug-Panel + `console.error` pro Schritt |

Der Button darf nicht mehr still fehlschlagen: Jeder Klick führt entweder zum Permission-Flow oder zu einer **konkreten** Fehlermeldung.
