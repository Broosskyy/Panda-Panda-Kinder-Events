# Admin Identity Flash Fix Report

**Date:** 2026-07-08  
**Issue:** Dashboard briefly showed generic user „Admin“ before real identity loaded

## Root Cause

`DashboardView.tsx` rendered the greeting header **before** session data arrived:

```tsx
const displayName = payload?.user?.displayName ?? "Admin";
```

On first paint `payload` was `null` → fallback `"Admin"` appeared for 2–3 seconds until `/api/admin/dashboard` returned.

`ErsteSchritteView.tsx` had the same pattern via `useState("Admin")`.

`AdminSidebar` already hid identity until fetch completed (`identity === null`), but the dashboard header was independent and used a hardcoded fallback.

## Fix

1. **`AdminSessionProvider`** — single `/api/admin/login` fetch shared across admin shell
2. **`AdminGate`** — wraps authenticated layout with session provider
3. **`AdminSidebar`** — uses session context; shows `AdminIdentitySkeleton` while loading
4. **`DashboardView`** — no `"Admin"` fallback; shows `DashboardHeaderSkeleton` until `identityReady`
5. **`ErsteSchritteView`** — no `"Admin"` default; skeleton until session ready
6. **Role hints** — only rendered when identity is fully loaded

## Behaviour After Fix

| Phase | UI |
|-------|-----|
| Session loading | Neutral skeleton (sidebar + dashboard header) |
| Session ready | Real name, email, role from `admin_users` |
| Dashboard stats loading | „Übersicht wird geladen…“ (no wrong identity) |

## Files Changed

- `components/admin/AdminSessionProvider.tsx` (new)
- `components/admin/AdminGate.tsx`
- `components/admin/AdminIdentityPanel.tsx`
- `components/admin/AdminSidebar.tsx`
- `components/admin/views/DashboardView.tsx`
- `components/admin/views/ErsteSchritteView.tsx`

## Verification

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
