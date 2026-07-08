# Bootstrap Guard Fix Report

**Date:** 2026-07-08  
**Branch:** `cursor/auth-identity-fix-e022`  
**Severity:** Critical (incorrect bootstrap exposure)

## Problem A — Bootstrap shown when users exist

The first-setup wizard appeared even when `admin_users` already contained records or a valid session existed. The static UI text always claimed „Noch kein Benutzer in der Datenbank“, independent of actual database state.

## Root Causes

1. **Client gate trusted `needsBootstrap` alone** — `AdminGate` did not require explicit `bootstrap.allowed === true`.
2. **No centralized guard** — login GET and bootstrap POST each had separate count logic.
3. **`countAdminUsersSafe()` returned `0` on DB errors** — could mislead non-auth code paths (fixed separately).

## Fix

### Central guard: `lib/auth/bootstrap-guard.ts`

`evaluateBootstrapAccess()` is the single source of truth:

| Condition | `allowed` | `reason` |
|-----------|-----------|----------|
| Valid `pb_admin_session` → `admin_users` row | `false` | `authenticated_session` |
| `admin_users` count > 0 | `false` | `admin_users_exist` |
| DB count query fails | `false` | `count_query_failed` |
| `admin_users` count === 0, no session | `true` | `no_admin_users` |

**Fail-closed:** errors never imply zero users.

### API updates

- `GET /api/admin/login` — uses guard; returns `bootstrap` diagnostics; `needsBootstrap` only when `allowed === true`.
- `GET /api/admin/auth/bootstrap` — status endpoint with diagnostics (no PII).
- `POST /api/admin/auth/bootstrap` — uses guard + `hasAdminUsers()` double-check before insert.

### Client guard: `AdminGate.tsx`

Decision order:

1. `authenticated` → dashboard
2. `bootstrap.allowed && needsBootstrap` → bootstrap wizard
3. Everything else (DB error, users exist, no session) → login

### Diagnostic logging

Server logs `[auth/bootstrap-guard]` with:

- `adminUserCount`, `reason`, `sessionActive`, `sessionUserId`
- `legacyCookiePresent`, `publicOwnerEnvExposed`
- `countError` when applicable
- No passwords

## Verification Matrix

| Scenario | Bootstrap | Screen |
|----------|-----------|--------|
| New browser, users exist | ❌ | Login |
| Incognito, users exist | ❌ | Login |
| Valid session | ❌ | Dashboard |
| Empty `admin_users` | ✅ | Empty setup form |
| DB count error | ❌ | Login (+ error in API) |
| F5 with session | ❌ | Dashboard |
| Logout → revisit | ❌ | Login |

## Files Changed

- `lib/auth/bootstrap-guard.ts` (new)
- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/auth/bootstrap/route.ts`
- `components/admin/AdminGate.tsx`
- `lib/auth/users.ts` — `countAdminUsersSafe()` returns `null` on error, not `0`
- `lib/admin/dashboard-stats.ts` — uses `hasAdminUsers()` instead of safe count
