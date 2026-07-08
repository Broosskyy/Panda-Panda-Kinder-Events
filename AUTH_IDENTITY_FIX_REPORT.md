# Auth Identity Fix — Report

**Date:** 2026-07-08  
**Branch:** `cursor/auth-identity-fix-e022`  
**Priority:** Critical — session/user identity mismatch

## Symptom

- Original user `manuel.bauch0705@gmail.com` not visible in admin user list after RBAC changes
- After F5 or re-login, session sometimes showed as generic **„Administrator“** instead of the real account
- Risk: wrong identity / permissions in the admin UI

## Root Cause

Three interacting bugs in the custom admin auth (`admin_users` + `admin_sessions`, **not** Supabase `auth.users`):

### 1. Legacy cookie fallback (critical)

`resolveAdminContext()` checked the modern session cookie first, but if that failed it could fall back to the **legacy** cookie `pb_admin_auth` and return a synthetic identity:

- `userId: null`
- `displayName: "Administrator"`
- `isLegacy: true`

This happened when:

- A stale legacy cookie remained in the browser after multi-user setup, **and**
- `countAdminUsersSafe()` returned `0` on transient DB errors (catch → `0`), **or**
- Multi-user mode was active but legacy path was still reachable in edge cases

### 2. Module-level context cache (critical)

`lib/auth/context.ts` cached `AdminContext` for 1 second in a **module-level variable**. In serverless/Node workers, this could return **another request’s user context** within the same process window.

### 3. Virtual „legacy-session“ user in UI

`resolveUsersForSession()` injected a fake user `legacy-session` / „Administrator“ into the users list when `isLegacy` was true — even when real `admin_users` rows existed in the database.

## Architecture Clarification

| Table | Used for admin login? |
|-------|----------------------|
| `admin_users` | **Yes** — credentials, role, display name |
| `admin_sessions` | **Yes** — session token → `user_id` |
| `auth.users` (Supabase Auth) | **No** — not used for this admin panel |
| `team_members` | **No** — public website team only (optional link) |
| `profiles` | **No** — not present in this codebase |

Admin identity is always `admin_users.id` (UUID), resolved via `admin_sessions.user_id`.

## Fixes Applied

### Auth core (`lib/auth/context.ts`)

- Removed module-level context cache entirely
- Legacy cookie **never** authenticates when `hasAdminUsers()` is true
- Session → `getUserById(session.user_id)` only; no fallback identity
- Added `email` to `AdminContext`

### Reliable user-count (`lib/auth/users.ts`)

- New `hasAdminUsers()` — `SELECT id LIMIT 1`, throws on DB error (fail closed)
- Legacy virtual user only when `ctx.isLegacy && !ctx.userId`

### Login (`src/app/api/admin/login/route.ts`)

- Multi-user login uses `hasAdminUsers()` instead of `countAdminUsersSafe()`
- On successful multi-user login: **clears** legacy cookie `pb_admin_auth`
- `GET /api/admin/login` returns full identity: `userId`, `displayName`, `email`, `roleSlug`, `roleLabel`

### Database (`supabase/migrations/20260728_auth_identity_fix.sql`)

- Ensures `manuel.bauch0705@gmail.com` keeps role `administrator` if the row exists
- Deletes orphaned sessions
- Index on `lower(email)` for reliable login lookup

### UI

- `AdminIdentityPanel` in sidebar — shows Name, E-Mail, Rolle, User-ID
- Users list: CRM-style table with avatar, status, actions
- Simplified flat navigation

## Diagnostic Script

```bash
node scripts/diagnose-admin-users.mjs manuel.bauch0705@gmail.com
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## SQL to verify in Supabase

```sql
SELECT u.id, u.email, u.display_name, u.active, r.slug AS role
FROM admin_users u
JOIN admin_roles r ON r.id = u.role_id
ORDER BY u.created_at;

SELECT * FROM admin_users WHERE lower(email) = 'manuel.bauch0705@gmail.com';
```

## Session Guarantee (post-fix)

| Rule | Enforcement |
|------|-------------|
| Identity from session user_id only | `getSessionByToken` → `session.user_id` → `getUserById` |
| No role-based identity | Role loaded **after** user resolved |
| No first-row fallback | Removed |
| No email without password check | Login still uses `findUserByIdentifier` + password verify |
| No legacy when users exist | `hasAdminUsers()` → legacy blocked |
| No cross-request cache | Module cache removed |

## Deployment Steps

1. Deploy code
2. Run migration `20260728_auth_identity_fix.sql`
3. **All users: log out once** (clears stale `pb_admin_auth` cookie)
4. Log in again with `manuel.bauch0705@gmail.com` + password
5. Confirm sidebar shows correct name, email, role, UUID
6. Run diagnostic script or SQL above

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

## Confirmation (v2 — legacy fully removed)

- **No** `legacy-session` virtual user in code
- **No** `pb_admin_auth` authentication path — cookie cleared on every login check when users exist
- **No** `isLegacy` flag on `AdminContext`
- **Only** `admin_sessions.user_id` → `admin_users.id` resolves identity
- Bootstrap wizard shown when zero `admin_users` rows exist
- User list loads **exclusively** from `admin_users` table

After deploy: log out, log in with `manuel.bauch0705@gmail.com`. Sidebar must show Manuel Bauch, email, Super Admin, real UUID.
