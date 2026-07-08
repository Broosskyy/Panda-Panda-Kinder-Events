# Admin Critical Fix — Onboarding, Invite Link, Email Status, More Menu

**Branch:** `cursor/admin-critical-onboarding-invites-email-e022`  
**Datum:** 2026-07-08

---

## 1. Onboarding repariert

### Probleme
- Weiter-Button auf Mobile teilweise abgeschnitten
- Footer/Buttons nicht immer sichtbar
- ✕ schloss Tutorial dauerhaft (wie „Nicht erneut anzeigen“)
- Bottom Navigation konnte durchscheinen

### Fixes
- **Scroll-Lock:** `position: fixed` + Scroll-Restore (iOS-sicher)
- **Chrome-Hide:** `data-admin-onboarding="open"` versteckt Bottom Nav, Quick Actions, Mobile Header
- **Mobile Layout:** Panel volle Breite/Höhe (`100dvh`), Footer mit Safe-Area, kompaktere Buttons
- **Button-Trennung:** ✕ → `onCloseSession` (nur schließen); „Nicht erneut anzeigen“ → `finish()`
- **Tutorial erneut starten:** weiterhin unter Einstellungen via `openWizard()`

---

## 2. Einladungslink / Zugang einrichten

### Problem
Invite-Links zeigten auf `*.vercel.app`, wenn `NEXT_PUBLIC_SITE_URL` fehlte.

### Fixes
- `lib/site-url.ts`: Fallback **immer** `https://pb-kinderevents.de`, kein `VERCEL_URL`
- `vercel.app` in Env wird blockiert/saniert
- `getAdminInviteUrl()` / `buildInviteUrl()` zentral für E-Mail, Copy-Link, Resend
- Passwort-Reset nutzt ebenfalls `getSiteUrl()`

**Ziel-URL:** `https://pb-kinderevents.de/admin/einladung/[token]`

---

## 3. E-Mail-Versand Status

### Fixes
- **API:** `sendInviteEmailSafe()` mit `emailSent` / `emailError` Response
- **Audit:** `invite_sent`, `invite_send_failed`, `email_sent`, `email_failed`
- **InvitesView:** Versandstatus-Badge (Gesendet / Fehlgeschlagen / Ausstehend), „Zuletzt gesendet“
- **Toasts:** Erfolg „E-Mail erfolgreich versendet.“ / Fehler mit Detailmeldung
- **AdminUserManageDialog:** Unterscheidet E-Mail-Erfolg/-Fehler bei Einladung & manueller Anlage
- **EmailsView:** Einheitliche Erfolgs-/Fehler-Toasts
- **E-Mail-Tests:** `invite_link` in `buildEmailVariableContext` für admin-invite-Vorlage

---

## 4. Mehr-Menü / Bottom Sheet

### Fixes
- **Solides Panel:** `background: var(--admin-surface)`, kein Transparenz-Leak
- **Backdrop:** `rgba(0.72)` + `blur(6px)`, z-index `190`
- **Chrome:** `data-admin-action-sheet="open"` versteckt Bottom Nav
- **Scroll-Lock:** iOS-sicher mit `position: fixed`
- **Desktop Dropdown:** z-index `130`
- **Löschen:** `confirmMessage` mit Bestätigungsdialog
- **Hydration:** Mobile-Sheet initial aus `matchMedia`

---

## 5. Geänderte Dateien

| Bereich | Dateien |
|---------|---------|
| Site URL | `lib/site-url.ts`, `lib/auth/invitations.ts` |
| Invites API | `src/app/api/admin/invites/route.ts`, `lib/auth/invitation-email-status.ts` |
| Onboarding | `AdminOnboardingWizard.tsx`, `AdminOnboardingProvider.tsx` |
| More Menu | `AdminActionMenu.tsx`, `globals.css` |
| UI | `InvitesView.tsx`, `AdminUserManageDialog.tsx`, `EmailsView.tsx` |
| API | `email/compose/route.ts`, `users/route.ts`, `password-reset/request/route.ts` |
| E-Mail | `lib/email/render.ts` |
| Tests | `scripts/admin-critical-onboarding-invites-email-test.mjs` |

---

## 6. Verifikation

```bash
node scripts/admin-critical-onboarding-invites-email-test.mjs  # 11/11 ✓
npm run lint        # ✓
npm run typecheck   # ✓
npm run build       # ✓
```

---

## 7. Offene Punkte

- **copy_link** rotiert Token (technisch notwendig, da nur Hash gespeichert) — alter Link wird ungültig
- **NEXT_PUBLIC_SITE_URL** in Vercel Production setzen empfohlen (`https://pb-kinderevents.de`)
- Visueller QA auf echten Geräten (360/390/430px) empfohlen
