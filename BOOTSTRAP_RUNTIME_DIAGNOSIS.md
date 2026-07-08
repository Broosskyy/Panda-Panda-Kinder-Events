# Bootstrap Runtime Diagnosis

**Date:** 2026-07-08 10:30 UTC  
**Method:** Live API probes against production — no assumptions, no code changes  
**Production URL:** `https://www.pb-kinderevents.de`  
**Supabase project (from public storage URLs):** `irgsllewfrxvbtznqmxh.supabase.co`

---

## Executive Result

**Bootstrap is shown because production's server-side count of `admin_users` is exactly `0`.**

The guard logic is behaving correctly. This is **not** a client/UI bug and **not** a false-positive guard. The production database connected via `SUPABASE_SERVICE_ROLE_KEY` reports an empty `admin_users` table.

`manuel.bauch0705@gmail.com` does **not** exist as a row in `admin_users` on the production Supabase project that the live site queries.

---

## Live Evidence (Production)

### `GET https://www.pb-kinderevents.de/api/admin/login`

Captured: 2026-07-08 10:29:57 UTC

```json
{
  "authenticated": false,
  "needsBootstrap": true,
  "bootstrap": {
    "allowed": true,
    "reason": "no_admin_users",
    "adminUserCount": 0,
    "sessionActive": false,
    "legacyCookiePresent": false,
    "publicOwnerEnvExposed": false
  }
}
```

### `GET https://www.pb-kinderevents.de/api/admin/auth/bootstrap`

Captured: 2026-07-08 10:29:58 UTC

```json
{
  "bootstrap": {
    "allowed": true,
    "reason": "no_admin_users",
    "adminUserCount": 0,
    "sessionActive": false,
    "legacyCookiePresent": false,
    "publicOwnerEnvExposed": false
  }
}
```

### `POST https://www.pb-kinderevents.de/api/admin/login`

Body: `{"identifier":"manuel.bauch0705@gmail.com","password":"wrong-password-test"}`  
Captured: 2026-07-08 10:31 UTC

```json
{
  "error": "Noch kein Admin-Benutzer angelegt. Bitte zuerst den Einrichtungs-Assistenten nutzen.",
  "needsBootstrap": true
}
```

**Critical observation:** Login does **not** reach password validation. `hasAdminUsers()` returns `false` before credential lookup. The email is never matched against a user row.

### Deployment target

| Check | Result |
|-------|--------|
| Host | `www.pb-kinderevents.de` |
| Server header | `Vercel` |
| Preview URL tested | `panda-panda-kinder-events-git-cursor-auth-identity-fix-e022-broosskyy.vercel.app` → DNS does not resolve |
| Conclusion | **Production** custom domain, not a preview branch |

---

## Answers to All 10 Questions

### 1. Exists `manuel.bauch0705@gmail.com` in `admin_users`?

**No — on the production database the app currently uses.**

Evidence:
- `POST /api/admin/login` aborts with `needsBootstrap: true` before password check
- `bootstrap.reason = "no_admin_users"`
- `bootstrap.adminUserCount = 0`
- No `countError` field → query succeeded, did not fail silently

**Note:** „Manuel“ appears on the public website (reviews, about section, team). That is **CMS content** (`reviews`, `team_members`, `site_settings`) — not `admin_users`.

### 2. How many rows exist in `admin_users` right now?

**`0`** (as reported by production server using service role).

Source: `bootstrap.adminUserCount: 0` from live `GET /api/admin/login`.

Direct SQL was not run in this environment (no `SUPABASE_SERVICE_ROLE_KEY` available locally). The production API response is authoritative for what the deployed app sees.

### 3. What does `countAdminUsersSafe()` return?

On production runtime, for the current DB state:

| Function | Expected return | Explanation |
|----------|-----------------|-------------|
| `countAdminUsers()` | `0` | Query succeeds, no error thrown |
| `countAdminUsersSafe()` | `0` | Wraps successful `countAdminUsers()` — not `null` |

`null` would only occur if `countAdminUsers()` threw. Production response has **no** `countError` → no throw occurred.

### 4. What does the Bootstrap Guard return?

From live production `GET /api/admin/login`:

```json
{
  "allowed": true,
  "reason": "no_admin_users",
  "adminUserCount": 0,
  "sessionActive": false,
  "legacyCookiePresent": false,
  "publicOwnerEnvExposed": false
}
```

### 5. Which condition ultimately sets `bootstrap = true`?

**Client (`AdminGate.tsx`):**

```
bootstrapShown =
  data.authenticated === false
  AND data.bootstrap?.allowed === true
  AND data.needsBootstrap === true
```

**Server (`evaluateBootstrapAccess()`):**

```
needsBootstrap = bootstrap.allowed

bootstrap.allowed = true ONLY when:
  - resolveAdminContext() === null   (no valid session)
  AND countAdminUsers() === 0        (successful query, zero rows)
```

On production right now, all three client conditions are `true` because the server guard returns `allowed: true`.

### 6. Is `true` returned somewhere despite an error?

**No.**

| Error path | `allowed` | `reason` | Production |
|------------|-----------|----------|------------|
| DB count fails | `false` | `count_query_failed` | Not triggered |
| Users exist | `false` | `admin_users_exist` | Not triggered |
| Valid session | `false` | `authenticated_session` | Not triggered |
| Zero users, no session | `true` | `no_admin_users` | **Active** |

Production response contains no `error` field and no `countError` inside `bootstrap`.

### 7. Are RLS / permissions interpreted as „0 users“?

**No.**

- API routes use `getSupabaseAdmin()` → `SUPABASE_SERVICE_ROLE_KEY`
- Service role **bypasses RLS** in Supabase
- Migration `20260725_zero_trust_rls_hardening.sql` adds explicit `service_role` policies on `admin_users`
- If RLS blocked the service role, Supabase would return an **error**, not an empty success with `count: 0`
- Guard would then return `reason: "count_query_failed"`, `allowed: false` → login page, not bootstrap

Production shows successful count with zero rows — not a permission-denied-as-zero scenario.

### 8. Wrong database / wrong Supabase project?

**Unlikely — CMS and admin use the same project ref.**

Public site images resolve to:

```
https://irgsllewfrxvbtznqmxh.supabase.co/storage/v1/object/public/...
```

`getSupabaseAdmin()` uses `process.env.NEXT_PUBLIC_SUPABASE_URL` (same project URL as client) + `SUPABASE_SERVICE_ROLE_KEY`.

Gallery, reviews, and site assets load from `irgsllewfrxvbtznqmxh` → URL is correct and live.

**Remaining risk (cannot verify without Vercel dashboard):** `SUPABASE_SERVICE_ROLE_KEY` could theoretically belong to a different project than `NEXT_PUBLIC_SUPABASE_URL`. If that were true, most server DB operations would fail with JWT/auth errors. CMS reads work, and the count query returns a clean `0` (not an error) — strongly indicating a **valid key for this project with an empty `admin_users` table**.

### 9. Production or Preview?

**Production:** `https://www.pb-kinderevents.de` (Vercel, HSTS, custom domain).

The deployed code includes the new `bootstrap` diagnostic object (from commit `dfc429b`), so production is running the hardened guard — and the guard still allows bootstrap because count is zero.

---

## 10. Complete Decision Logic

### Production snapshot (no cookies, new browser)

| Field | Value |
|-------|-------|
| `authenticated` | `false` |
| `adminUsersCount` | `0` |
| `bootstrapAllowed` | `true` |
| `reason` | `no_admin_users` |
| `sessionUserId` | `null` |
| `adminUserId` | `null` |
| `matched` | `false` |
| `countError` | `null` |
| `legacyCookiePresent` | `false` |
| `publicOwnerEnvExposed` | `false` |
| **AdminGate result** | **`bootstrap`** |

### Decision flow (code path)

```
AdminGate mount
  → fetch GET /api/admin/login
    → evaluateBootstrapAccess()
      → resolveAdminContext()
          session cookie missing → ctx = null
      → countAdminUsers()
          SELECT id FROM admin_users (head count)
          → success, count = 0
      → return { allowed: true, reason: "no_admin_users" }
    → response: { authenticated: false, needsBootstrap: true, bootstrap.allowed: true }
  → bootstrap.allowed && needsBootstrap → gateState = "bootstrap"
```

### If Manuel existed in `admin_users` (expected behavior)

| Field | Expected |
|-------|----------|
| `authenticated` | `false` (no session cookie) |
| `adminUsersCount` | `≥ 1` |
| `bootstrapAllowed` | `false` |
| `reason` | `admin_users_exist` |
| `needsBootstrap` | `false` |
| **AdminGate result** | **login** |

### If valid session existed (expected behavior)

| Field | Expected |
|-------|----------|
| `authenticated` | `true` |
| `bootstrapAllowed` | `false` |
| `reason` | `authenticated_session` |
| `sessionUserId` | UUID from `admin_users` |
| **AdminGate result** | **dashboard** |

---

## Why the user believed an account exists

Historical auth architecture (now removed):

| Mechanism | Required `admin_users` row? |
|-----------|----------------------------|
| Legacy `pb_admin_auth` + `ADMIN_PASSWORD` | **No** |
| Modern `pb_admin_session` + `admin_users` | **Yes** |

Prior reports (`AUTH_IDENTITY_FIX_REPORT.md`, `ADMIN_BOOTSTRAP_FIX_REPORT.md`) document that legacy login created a valid admin session **without** a database user. After legacy removal:

- Cookie-only sessions no longer authenticate
- Empty `admin_users` → bootstrap is the only path
- Public „Manuel“ content on the website ≠ admin login account

Migrations `20260728` / `20260729` only **UPDATE** Manuel's row **if it exists** — they do not INSERT a user:

```sql
UPDATE admin_users ... WHERE lower(email) = 'manuel.bauch0705@gmail.com';
```

No migration seeds `admin_users`. First user must be created via bootstrap or manual SQL insert.

---

## Local / Agent Environment

| Check | Result |
|-------|--------|
| `.env.local` | Not present |
| `SUPABASE_SERVICE_ROLE_KEY` in agent | Not set |
| Direct `diagnose-admin-users.mjs` | Could not run — missing credentials |

Production API probes were used instead.

---

## Root Cause (definitive)

| Layer | Status |
|-------|--------|
| Bootstrap guard logic | ✅ Correct |
| AdminGate routing | ✅ Correct |
| Client prefilled PII | ✅ Fixed (empty fields) |
| **`admin_users` data on production** | ❌ **Empty (0 rows)** |

**Bootstrap appears because the production Supabase project `irgsllewfrxvbtznqmxh` has no `admin_users` records. The guard correctly interprets this as first-time setup.**

---

## Recommended Next Steps (data, not guard code)

1. **Supabase Dashboard** → project `irgsllewfrxvbtznqmxh` → SQL:
   ```sql
   SELECT id, email, display_name, active FROM admin_users;
   SELECT count(*) FROM admin_users;
   ```
2. **Vercel** → Environment Variables → confirm `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` belong to the **same** project.
3. If count is 0 in dashboard (matches live API):
   - Run bootstrap once with `ADMIN_PASSWORD`, **or**
   - Insert Manuel's row manually + password hash, **or**
   - Restore `admin_users` from backup if a row existed before.
4. After insert, re-test:
   ```bash
   curl -s https://www.pb-kinderevents.de/api/admin/login | jq .
   ```
   Expected: `"needsBootstrap": false`, `"reason": "admin_users_exist"`.

---

## Verification Commands

```bash
# Bootstrap decision
curl -s https://www.pb-kinderevents.de/api/admin/login | jq .

# Login before users exist
curl -s -X POST https://www.pb-kinderevents.de/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"manuel.bauch0705@gmail.com","password":"test"}' | jq .

# With Supabase credentials locally
node scripts/diagnose-admin-users.mjs manuel.bauch0705@gmail.com
```

---

## Conclusion

Do **not** change bootstrap guard code to „fix“ this — the guard is doing the right thing.

The fix is **database state**: create or restore the `admin_users` row for `manuel.bauch0705@gmail.com` in the production Supabase project, then bootstrap will stop automatically.
