# Bootstrap Owner Data Leak Fix Report

**Date:** 2026-07-08  
**Branch:** `cursor/auth-identity-fix-e022`  
**Severity:** Critical (PII exposure)

## Problem

`AdminBootstrapWizard` prefilled the first-admin setup form with hardcoded owner data:

- Username: `manuel`
- Email: `manuel.bauch0705@gmail.com`
- Display name: `Manuel Bauch`

Any visitor who reached the bootstrap screen (new browser, incognito, no login) could see this personal information before entering credentials.

## Root Cause

```tsx
// components/admin/AdminBootstrapWizard.tsx (before fix)
const [username, setUsername] = useState("manuel");
const [email, setEmail] = useState("manuel.bauch0705@gmail.com");
const [displayName, setDisplayName] = useState("Manuel Bauch");
```

These were developer convenience defaults committed into production client code.

## Fix

1. **Empty form defaults** — all identity fields initialize to `""`.
2. **No `NEXT_PUBLIC_*` owner variables** — audited codebase: no `ADMIN_EMAIL`, `ADMIN_NAME`, or `NEXT_PUBLIC_ADMIN_*` env vars exist.
3. **`ADMIN_PASSWORD`** remains server-only (bootstrap POST verification); never sent to client except as user input.
4. **Bootstrap diagnostics** — `evaluateBootstrapAccess()` logs decision metadata without passwords or PII.

## Verification

| Scenario | Expected | Result |
|----------|----------|--------|
| New browser, no login, bootstrap allowed | Empty name/email/username fields | ✅ |
| Incognito, users exist | Login page, no owner data | ✅ |
| After login | Real user from `admin_users` only | ✅ |
| Grep for hardcoded Manuel in UI components | None in live forms | ✅ |

## Files Changed

- `components/admin/AdminBootstrapWizard.tsx` — removed hardcoded defaults
- `lib/auth/bootstrap-guard.ts` — detects `NEXT_PUBLIC_*` owner env exposure (diagnostic)

## Rule Compliance

| Rule | Status |
|------|--------|
| No personal data without valid session | ✅ |
| First-admin setup shows empty fields only | ✅ |
| Owner data never via `NEXT_PUBLIC_*` | ✅ |
| `ADMIN_EMAIL`/`ADMIN_NAME` not used client-side | ✅ |
