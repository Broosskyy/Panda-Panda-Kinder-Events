# Admin User Invite Links + Mandatory 2FA — Implementation Report

## Summary

Secure employee onboarding via one-time invite links (no password sharing) and mandatory 2FA for all admin panel users.

## Features Delivered

### 1. One-Time Invite Links
- **UI:** Sicherheit → Benutzer & Rollen → Tab „Einladungen“ with „Benutzer einladen“ form
- **Fields:** Name, E-Mail, Rolle (Admin / Mitarbeiter / Nur Lesen / Super Admin), optional message
- **Permissions:**
  - Super Admin → all roles
  - Admin → Mitarbeiter + Nur Lesen only
  - Mitarbeiter / Nur Lesen → cannot invite

### 2. Invitation Technical Model
- Table `admin_invitations` with hashed `token_hash` (SHA-256)
- 48-hour expiry (`INVITE_EXPIRY_HOURS`)
- Single-use on accept; revoke and resend supported
- Resend rotates token and extends expiry

### 3. Registration Page
- Route: `/admin/einladung/[token]`
- Flow: validate token → show name/email/role → set password → setup 2FA → activate → redirect to login
- Public route (no admin session required)

### 4. Mandatory 2FA
- Password-only login no longer creates a session
- Users with 2FA → existing verify flow
- Users without 2FA → forced setup flow (`requires2faSetup`)
- 2FA disable blocked for all users
- Super Admin can view 2FA status and reset 2FA per user

### 5. Email
- Template `admin-invite` with subject **„Einladung zum Panda-Bande Admin“**
- Panda-Bande branding, CTA „Zugang einrichten“, expiry notice, no password in email

### 6. Audit Log Actions
| Action | Area |
|--------|------|
| `invite_created` | admin_invites |
| `invite_sent` | admin_invites |
| `invite_resent` | admin_invites |
| `invite_revoked` | admin_invites |
| `invite_accepted` | admin_invites |
| `2fa_enable` | security |
| `2fa_reset` | security |
| `2fa_failed` | auth |
| `login` | auth |

All entries include IP, device, user agent via existing audit infrastructure.

### 7. UI Tabs (Benutzer & Rollen)
- Benutzer
- Einladungen
- 2FA
- Login-Historie
- Aktivitätsprotokoll

### 8. Security
- Tokens stored hashed only
- Server-side role permission checks
- Rate limits on invite create and accept
- Generic error messages (no account enumeration on invite validate)

## Files Added / Changed

| Area | Key Files |
|------|-----------|
| Migration | `supabase/migrations/20260733_admin_invitations_mandatory_2fa.sql` |
| Auth lib | `lib/auth/invitations.ts`, `lib/auth/invite-permissions.ts` |
| API | `src/app/api/admin/invites/*`, `src/app/api/admin/login/2fa-setup/route.ts` |
| Login | `src/app/api/admin/login/route.ts` (mandatory 2FA) |
| Users API | `src/app/api/admin/users/route.ts` (`reset2fa`) |
| Email | `lib/email.ts`, `lib/email/templates-db.ts` |
| UI | `InvitesView`, `UsersTwoFaOverview`, `UsersSecurityTabs`, `AdminInviteAcceptForm` |
| Pages | `/admin/einladung/[token]`, `/admin/sicherheit/benutzer/*` sub-routes |
| Tests | `scripts/admin-invites-mandatory-2fa-test.mjs` |

## Verification

```bash
node scripts/admin-invites-mandatory-2fa-test.mjs  # 25 passed
npm run lint                                        # clean
npm run typecheck                                   # clean
npm run build                                       # success
```

## Manual QA Checklist

- [ ] Super Admin invites Admin → email received, link works
- [ ] Admin invites Mitarbeiter → success
- [ ] Admin cannot invite Super Admin → 403
- [ ] Expired invite → invalid page
- [ ] Used invite → invalid on second use
- [ ] Login without 2FA → forced setup
- [ ] Login with 2FA → code required
- [ ] Super Admin resets 2FA → user must re-setup on next login
- [ ] Audit log shows invite and 2FA events
