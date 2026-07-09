# Admin PWA Push Notifications — Report

**Datum:** 2026-07-09  
**Branch:** `cursor/admin-pwa-push-notifications-dab0`

---

## Zusammenfassung

Web Push für die Admin-PWA implementiert. Bei neuer Anfrage erhalten Super Admin und Admin eine Push-Benachrichtigung (keine sensiblen Daten im Body).

---

## Geänderte / neue Dateien

| Datei | Änderung |
|-------|----------|
| `supabase/migrations/20260736_admin_push_subscriptions.sql` | Neue Tabelle |
| `lib/admin/push/config.ts` | VAPID-Konfiguration (Server) |
| `lib/admin/push/public-config.ts` | Public Key (Client) |
| `lib/admin/push/types.ts` | Typen |
| `lib/admin/push/subscriptions.ts` | DB CRUD |
| `lib/admin/push/send.ts` | Web-Push-Versand |
| `lib/admin/push/client.ts` | Client Subscribe-Helfer |
| `src/app/api/admin/push/route.ts` | GET Status |
| `src/app/api/admin/push/subscribe/route.ts` | POST/DELETE Subscription |
| `src/app/api/admin/push/test/route.ts` | POST Test-Push |
| `src/app/api/inquiry/route.ts` | Push nach neuer Anfrage (fire-and-forget) |
| `public/admin/sw.js` | `push` + `notificationclick`, Cache v7 |
| `components/admin/AdminPushNotificationsPanel.tsx` | UI + Permission-Flow |
| `components/admin/AdminPushNotificationsCard.tsx` | Settings-Karte |
| `components/admin/dashboard/DashboardPushNotificationsCard.tsx` | Dashboard-Karte |
| `components/admin/views/SettingsView.tsx` | Karte eingebunden |
| `components/admin/dashboard/DashboardViewV2.tsx` | Karte eingebunden |
| `.env.example` | VAPID ENV dokumentiert |
| `package.json` | `web-push` Dependency |
| `scripts/admin-pwa-push-notifications-test.mjs` | Smoke-Tests |

---

## Neue Tabelle: `admin_push_subscriptions`

| Feld | Typ |
|------|-----|
| `id` | uuid PK |
| `user_id` | uuid → admin_users |
| `endpoint` | text UNIQUE |
| `p256dh` | text |
| `auth` | text |
| `user_agent` | text |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |
| `last_used_at` | timestamptz |
| `revoked_at` | timestamptz |

Migration ausführen: `supabase/migrations/20260736_admin_push_subscriptions.sql`

---

## ENV Variablen

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
VAPID_PRIVATE_KEY=<private key>
VAPID_SUBJECT=mailto:info@pb-kinderevents.de
```

Generieren: `npx web-push generate-vapid-keys`

Wenn ENV fehlt: UI zeigt „Nicht konfiguriert“, App läuft normal weiter.

---

## Funktionen

### Permission Flow (nur auf Klick)

- Karte „Push-Benachrichtigungen“ in **Einstellungen** und **Dashboard**
- Status: nicht unterstützt / nicht konfiguriert / noch nicht gefragt / blockiert / erlaubt / aktiviert
- Button „Benachrichtigungen aktivieren“ → `Notification.requestPermission()` → `PushManager.subscribe()` → API speichern

### Service Worker

- `push` → zeigt Notification (Titel „Neue Anfrage“, generischer Body, Panda-Icon)
- `notificationclick` → fokussiert bestehendes `/admin`-Fenster oder öffnet `/admin/anfragen`

### Server Send

- Nach erfolgreichem `booking_requests` Insert in `POST /api/inquiry`
- Empfänger: aktive Subscriptions von Nutzern mit Rolle **Super Admin** oder **Admin**
- Ungültige Subscriptions (410/404) werden automatisch revoked
- Fehler blockieren Anfrage-Erstellung nicht

### Security

- Subscribe/Test: `inquiries:write` + eingeloggt
- Test-Button: nur Super Admin / Admin
- Push-Body enthält keine E-Mail, Telefonnummer oder Namen

---

## Tests

```text
node scripts/admin-pwa-push-notifications-test.mjs  → 11/11
npm run typecheck  ✓
npm run lint       ✓
npm run build      ✓
```

### Manueller Testflow (nach Deploy)

1. Migration auf Supabase ausführen
2. VAPID Keys in Vercel ENV setzen + redeploy
3. Chrome Android: Admin-PWA installiert öffnen
4. Einstellungen → Push-Benachrichtigungen → aktivieren
5. „Test-Benachrichtigung senden“ → Notification erscheint
6. Klick → öffnet `/admin/anfragen`
7. Neue Anfrage über Website-Formular → Push an Super Admin/Admin
8. Logout → Admin-API weiterhin geschützt (401)

---

## Offene Punkte

| Punkt | Status |
|-------|--------|
| Live-Test Chrome Android PWA | ⏳ Manuell nach ENV + Migration |
| Push bei neuer Bewertung | 🔜 V2 (optional) |
| Push bei Kundenaktivität | 🔜 V2 (optional) |
| Mitarbeiter mit `inquiries:write` können Push aktivieren, erhalten aber keine Inquiry-Pushes (nur Super Admin/Admin) | By design V1 |

---

## Akzeptanz

| Kriterium | Code |
|-----------|------|
| Web Push V1 neue Anfrage | ✅ |
| Permission nur auf Klick | ✅ |
| SW push + notificationclick | ✅ |
| Subscription in DB | ✅ |
| VAPID via ENV | ✅ |
| Fehlende ENV bricht App nicht | ✅ |
| Keine sensiblen Daten im Push | ✅ |
