# Admin User Management — Complete Invite & Create Flow Report

**Branch:** `cursor/admin-user-management-complete-e022`  
**Date:** 2026-07-08

---

## Summary

The admin user management flow is now complete: the **„Benutzer einladen“** button opens a unified dialog (no page navigation), supporting both **invite-by-link** (recommended) and **manual user creation**, with an improved invitation list, user list, role permissions, and mobile-friendly UX.

---

## Changes

### 1. Unified dialog (`AdminUserManageDialog`)

- Opens from **Benutzer** and **Einladungen** tabs without leaving the page
- **Mobile:** bottom sheet / fullscreen panel (`admin-user-manage-root`)
- **Desktop:** centered dialog (max 42rem)
- Two tabs:
  - **Benutzer einladen** — marked „Empfohlen“
  - **Manuell erstellen**
- Touch targets ≥ 44px via `min-h-[2.75rem]` buttons and tab chips

### 2. Invite flow

- Form: Vorname, Nachname, E-Mail, Rolle, optionale Nachricht
- API creates hashed token (SHA-256), 48h expiry, sends email, writes audit logs
- Success shows optional copyable invite URL
- Invitation appears immediately in list

### 3. Manual create flow

- Form: Vorname, Nachname, E-Mail, Rolle
- Auto-generated or custom temporary password
- Checkbox: Passwort beim ersten Login ändern (`must_change_password`)
- Checkbox: 2FA verpflichtend (always on, enforced at login)
- Optional welcome email via `account-created` template
- User appears immediately in Benutzerliste

### 4. Invitation list improvements

- Columns: Name, E-Mail, Rolle, Status, Erstellt von, Erstellt am, Läuft ab
- Status badges: Ausstehend / Angenommen / Abgelaufen / Widerrufen
- Actions via `AdminActionMenu`: Erneut senden, Link kopieren, Widerrufen, Löschen
- Empty state with 📨 icon, text, and CTA button (no blank card)

### 5. User list improvements

- Avatar, Name, E-Mail, Rolle, Status, 2FA, Letzter Login, Erstellt am, Erstellt von
- Overflow menu: Bearbeiten, Rolle ändern, Passwort zurücksetzen, 2FA zurücksetzen (Super Admin), Deaktivieren, Löschen
- Delete uses `CriticalActionModal` with password confirmation

### 6. RBAC fix

**Problem:** Admin (`manager`) could not invite — `canInviteUsers()` returned true but API required `users:read` / `users:write` (Super Admin only).

**Solution:** New permission `users:invite` granted to Super Admin and Admin.

| Role | Invite | Manual create | Assignable roles |
|------|--------|---------------|------------------|
| Super Admin | ✓ | ✓ (all roles) | All 4 roles |
| Admin | ✓ | ✓ (limited) | Mitarbeiter, Nur Lesen |
| Others | ✗ | ✗ | — |

### 7. Security

| Measure | Implementation |
|---------|----------------|
| Invite token | SHA-256 hash, single-use accept, 48h expiry |
| Revoke / delete | Any time via API + audit |
| Mandatory 2FA | Login blocks session until 2FA setup complete |
| Password change | `must_change_password` flag + login step before 2FA |
| Audit actions | `invite_created`, `invite_sent`, `invite_resent`, `invite_revoked`, `invite_accepted`, `invite_deleted`, `invite_link_copied`, `user_created`, `user_updated`, `password_reset`, `2fa_reset` |

### 8. Login password-change step

- After credentials, if `must_change_password`: returns `requiresPasswordChange`
- `AdminLoginForm` shows new password + confirm fields
- After change → continues to 2FA verification or mandatory 2FA setup

---

## Files changed

| File | Change |
|------|--------|
| `components/admin/AdminUserManageDialog.tsx` | **New** — unified invite + create dialog |
| `components/admin/views/UsersView.tsx` | Dialog trigger, action menu, extended columns |
| `components/admin/views/InvitesView.tsx` | Dialog, empty state, full list, actions |
| `components/admin/AdminLoginForm.tsx` | Password-change login step |
| `src/app/api/admin/invites/route.ts` | RBAC fix, copy_link, DELETE |
| `src/app/api/admin/users/route.ts` | Meta flags, manual create for Admin |
| `src/app/api/admin/login/route.ts` | Forced password change flow |
| `lib/auth/invite-permissions.ts` | `canManageInvites`, `canCreateUsersManually` |
| `lib/auth/invitations.ts` | `deleteInvitation`, `issueInvitationLink` |
| `lib/auth/users.ts` | `created_by_name`, `must_change_password` |
| `lib/email.ts` | `sendAccountCreatedEmail` |
| `supabase/migrations/20260735_admin_users_invite_permissions.sql` | `users:invite` + password flag |
| `src/app/globals.css` | Dialog + empty state styles |
| `scripts/admin-user-management-complete-test.mjs` | **New** — smoke tests |

---

## Verification

```bash
node scripts/admin-user-management-complete-test.mjs  # 10 passed
node scripts/admin-invites-mandatory-2fa-test.mjs     # 25 passed
npm run lint                                         # ✓
npm run typecheck                                    # ✓
npm run build                                        # ✓
```

### Manual checks

- [ ] „Benutzer einladen“ opens dialog on Benutzer tab (no navigation)
- [ ] Invite saved, email sent, appears in Einladungen list
- [ ] Copy link / resend / revoke / delete work
- [ ] Manual user appears in Benutzer list
- [ ] Admin can invite Mitarbeiter/Nur Lesen but not Super Admin
- [ ] Mobile 360/390/430px — dialog fullscreen, no horizontal scroll
- [ ] Login with temp password → password change → 2FA setup

---

## Open points

1. **Copy link rotates token** — plaintext tokens are never stored; copying generates a fresh link (invalidates previous link). Documented behavior.
2. **Invite resend from user row** — not implemented (only via Einladungen list); users without pending invites have no row action.
3. **Dedicated `users:invite` nav filter** — Benutzer area still gated by `users:read`; Admins with only `users:invite` see self profile but can use Einladungen tab.
4. **Migration apply** — run `20260735_admin_users_invite_permissions.sql` on Supabase before production deploy.
