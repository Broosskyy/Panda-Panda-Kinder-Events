# Admin Push — VAPID Setup

Web Push für neue Anfragen benötigt ein VAPID-Schlüsselpaar auf dem Server.

## 1. Keys generieren

```bash
node scripts/generate-vapid-keys.mjs
```

Oder:

```bash
npx web-push generate-vapid-keys
```

## 2. Umgebungsvariablen setzen

| Variable | Wo | Beschreibung |
|----------|-----|--------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Client + Server | Öffentlicher VAPID-Key |
| `VAPID_PRIVATE_KEY` | **Nur Server** | Privater Key — geheim halten |
| `VAPID_SUBJECT` | Server | `mailto:info@pb-kinderevents.de` |

### Lokal (`.env.local`)

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BAi...
VAPID_PRIVATE_KEY=abc...
VAPID_SUBJECT=mailto:info@pb-kinderevents.de
```

### Vercel (Produktion)

1. Vercel Dashboard → Projekt → **Settings** → **Environment Variables**
2. Alle drei Variablen für **Production** (und ggf. Preview) setzen
3. **Redeploy** auslösen (Deployments → Redeploy)

Ohne diese Variablen zeigt das Admin-Dashboard: *„Push ist serverseitig nicht konfiguriert“*.

## 3. Datenbank-Migration

```bash
# Supabase SQL Editor oder CLI
supabase/migrations/20260736_admin_push_subscriptions.sql
supabase/migrations/20260737_admin_push_enabled.sql
```

## 4. Aktivierung im Admin

1. Admin-PWA öffnen (Android Chrome oder iOS Home-Bildschirm-PWA)
2. Dashboard oder Einstellungen → **Push-Benachrichtigungen**
3. **Benachrichtigungen aktivieren** → Permission erlauben
4. **Test-Benachrichtigung senden** (nur Super Admin / Admin)

## 5. Plattform-Hinweise

| Plattform | Push |
|-----------|------|
| Android Chrome / Edge / Samsung | ✅ Browser oder installierte PWA |
| iOS Safari Tab | ❌ Nicht unterstützt |
| iOS installierte PWA (16.4+) | ✅ Home-Bildschirm-App erforderlich |
| Desktop Chrome / Edge | ✅ |

## 6. Verifikation

```bash
node scripts/admin-pwa-push-notifications-test.mjs
npm run typecheck
npm run build
```

Live-Check:

1. Test-Push kommt an
2. Neue Anfrage über Website-Formular → Push an Super Admin/Admin
3. Klick auf Notification → `/admin/anfragen`
