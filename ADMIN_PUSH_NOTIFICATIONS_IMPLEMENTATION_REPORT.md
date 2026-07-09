# Admin Push Notifications — Implementation Report

**Datum:** 2026-07-09  
**Branch:** `cursor/admin-push-activate-dab0`

---

## Status

| Kriterium | Code | Produktion |
|-----------|------|------------|
| Web Push Pipeline | ✅ | ⏳ VAPID ENV erforderlich |
| DB `admin_push_subscriptions` | ✅ | ⏳ Migration ausführen |
| UI Aktivieren/Test/Deaktivieren | ✅ | ⏳ |
| SW push + notificationclick | ✅ | ✅ |
| Inquiry → Push | ✅ | ⏳ nach ENV |
| Android Chrome | ✅ Code | ⏳ Live-Test |
| iOS PWA 16.4+ | ✅ Code | ⏳ Live-Test |

**Nicht als erledigt markieren bis:** VAPID Keys in Vercel gesetzt, Subscription gespeichert, Test-Push + Inquiry-Push live funktionieren.

---

## Blocker: VAPID Keys fehlen in Produktion

Dashboard-Meldung *„Push ist serverseitig nicht konfiguriert“* = `NEXT_PUBLIC_VAPID_PUBLIC_KEY` und/oder `VAPID_PRIVATE_KEY` fehlen in Vercel.

### Sofort-Maßnahme (Super Admin)

```bash
node scripts/generate-vapid-keys.mjs
```

Dann in **Vercel → Settings → Environment Variables**:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
VAPID_PRIVATE_KEY=<private key>
VAPID_SUBJECT=mailto:info@pb-kinderevents.de
```

**Redeploy** auslösen. Vollständige Anleitung: `PUSH_SETUP.md`

---

## Implementierung

### 1. VAPID / Web Push

- `web-push` Library
- `lib/admin/push/config.ts` — Server VAPID
- `scripts/generate-vapid-keys.mjs` — Key-Generator
- `PUSH_SETUP.md` — Setup-Anleitung

### 2. Datenbank

| Migration | Inhalt |
|-----------|--------|
| `20260736_admin_push_subscriptions.sql` | Tabelle |
| `20260737_admin_push_enabled.sql` | Spalte `enabled` |

Felder: `id`, `user_id`, `endpoint`, `p256dh`, `auth`, `user_agent`, `enabled`, `created_at`, `updated_at`, `last_used_at`, `revoked_at`

### 3. Admin UI

Karte **Push-Benachrichtigungen** (Dashboard + Einstellungen):

| Status | Anzeige |
|--------|---------|
| Nicht unterstützt | Browser ohne Push APIs |
| Nicht konfiguriert | VAPID fehlt |
| Noch nicht erlaubt | Permission default |
| Blockiert | Permission denied |
| Aktiviert | Subscription gespeichert |

Plattform-Zeile: **Android unterstützt** / **iOS unterstützt** / **iOS: PWA erforderlich** / **Browser nicht unterstützt**

Buttons: Aktivieren · Test senden · Push deaktivieren

### 4. Client Subscription

1. `Notification.requestPermission()` (nur auf Klick)
2. `navigator.serviceWorker.ready` abwarten
3. `pushManager.subscribe()` mit VAPID Public Key
4. `POST /api/admin/push/subscribe`
5. Toast Erfolg/Fehler

### 5. Service Worker (`public/admin/sw.js`)

- `push` → Notification (Titel „Neue Anfrage“, generischer Body, Panda-Icon, Badge)
- `notificationclick` → `/admin/anfragen` (Fenster fokussieren oder öffnen)

### 6. Server Send

- `POST /api/inquiry` → `notifyAdminsNewInquiry()` (fire-and-forget)
- Empfänger: Super Admin + Admin mit `enabled=true`, `revoked_at IS NULL`
- Ungültige Subscriptions (410/404) → `enabled=false`, `revoked_at` gesetzt
- Anfrage-Speicherung schlägt nicht fehl wenn Push fehlschlägt

### 7. Sicherheit

- Keine sensiblen Daten im Push-Body
- Subscribe: eingeloggt + `inquiries:write`
- Test-Push: nur Super Admin / Admin

### 8. iOS Safari

- iOS 16.4+ installierte Home-Bildschirm-PWA: unterstützt
- Safari-Tab: UI zeigt „iOS: PWA erforderlich“ — kein Subscribe

---

## Geänderte / neue Dateien

- `PUSH_SETUP.md`
- `scripts/generate-vapid-keys.mjs`
- `supabase/migrations/20260737_admin_push_enabled.sql`
- `lib/admin/push/platform.ts`
- `lib/admin/push/client.ts`
- `lib/admin/push/subscriptions.ts`
- `lib/admin/push/types.ts`
- `lib/admin/push/send.ts`
- `components/admin/AdminPushNotificationsPanel.tsx`
- `src/app/api/admin/push/route.ts`
- `src/app/api/admin/push/subscribe/route.ts`
- `scripts/admin-pwa-push-notifications-test.mjs`
- `package.json` (`generate:vapid-keys`)

---

## Tests

```text
node scripts/admin-pwa-push-notifications-test.mjs  → 20/20
npm run typecheck  ✓
npm run lint       ✓
npm run build      ✓
```

### Live-Testflow (nach VAPID + Migration)

1. Migrationen auf Supabase
2. Vercel ENV + Redeploy
3. Android Chrome PWA → Push aktivieren → Test-Push
4. Neue Anfrage über Website → Push an Admin
5. Klick → `/admin/anfragen`
6. iPhone: installierte PWA → Push aktivieren → Test

---

## Offene Punkte

- **VAPID Keys in Vercel setzen** (kritischer Blocker)
- Live-Verifikation Android + iOS PWA
- Optional V2: Push bei neuer Bewertung
