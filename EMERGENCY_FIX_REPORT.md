# Emergency Fix Report — Server/Client Boundary Crash

**Date:** 2026-07-06  
**Error:** `GET /` → 500  
**Digest:** `1267400528`  
**Runtime message:**

```
Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
Or maybe you meant to call this function rather than return it.
```

## Root cause

The homepage (`src/app/page.tsx`) is a **Server Component**. It fetches services and passes them to the **Client Component** `components/sections/Services.tsx` (`"use client"`).

The `Service` type stored **Lucide React icon components** (functions) in each item:

```ts
// lib/services.ts (before)
export interface Service {
  icon: LucideIcon; // ← React component, not serializable
  title: string;
  ...
}
```

`fetchCmsServices()` in `lib/cms/data.ts` resolved DB `icon_key` values into components via `resolveServiceIcon()` **on the server**, then returned the array to the page. Next.js cannot serialize functions/components across the Server → Client boundary, so production SSR crashed immediately on `/`.

This is the correct explanation for digest `1267400528` — the earlier CMS-defaults fix (PR #29) addressed a different class of errors (`heading.title` on `undefined`). The icon boundary violation remained and caused the persistent 500 after deploy.

## Affected files

| File | Role |
|------|------|
| `src/app/page.tsx` | Server Component passing `services` to `<Services />` |
| `lib/services.ts` | Static services defined with `icon: Paintbrush` etc. |
| `lib/cms/data.ts` | `queryCmsServices()` mapped `icon: resolveServiceIcon(...)` |
| `components/sections/Services.tsx` | Client Component receiving non-serializable props |

## Secondary hardening (same pattern)

| File | Change |
|------|--------|
| `lib/admin/nav.ts` | `icon: Home` → `iconKey: "Home"` |
| `lib/admin/quickActions.ts` | Same pattern |
| `lib/admin/icons.ts` | **New** — `resolveAdminIcon()` client-side map |
| `components/admin/AdminSidebar.tsx` | Resolve icons in client |
| `components/admin/AdminQuickActions.tsx` | Resolve icons in client |
| `components/admin/views/DashboardView.tsx` | Resolve icons in client |

Admin views are already client-only, but storing icon components in shared lib modules is fragile if ever imported from Server Components.

## What was NOT the cause

- Metadata / favicon / manifest — all use string URLs only ✓
- `lib/admin/nav.ts` passed from server — nav is only consumed inside `"use client"` admin shell ✓
- `Contact.tsx` icons — built inside a Server Component, not passed as props ✓
- CMS `iconKey` fields for USPs, process, trust badges — already serializable ✓

## Changes made

1. **`Service.icon` → `Service.iconKey`** (`lib/services.ts`)
2. **`fetchCmsServices()`** returns `iconKey` string from DB, no server-side icon resolution
3. **`Services.tsx`** calls `resolveServiceIcon(service.iconKey)` inside the client component
4. **Admin navigation** migrated to `iconKey` + `resolveAdminIcon()`
5. **Lint:** inlined fetch logic in CRM `useEffect` hooks (Customers, Quotes, Invoices)
6. **`npm run typecheck`** script added

## Verification

```bash
npm install
npm run lint      # 0 errors
npm run typecheck # passes
npm run build     # passes, homepage route ƒ /
```

## Remaining TODOs

- [ ] Deploy `cursor/server-client-boundary-fix-e022` to Vercel production
- [ ] Confirm live `GET /` returns 200
- [ ] Optional: refactor legacy `lib/trust-badges.ts`, `lib/usps.ts`, `lib/process-steps.ts` to `iconKey` only (currently unused for server props; only text imported in defaults)
- [ ] Optional: `AdminEmptyState` could use `iconKey` prop for consistency

## Prevention

**Rule:** Data crossing Server → Client props must be JSON-serializable (strings, numbers, booleans, plain objects/arrays).

**Icons:** Always use `iconKey: string` in shared data types; resolve to Lucide components only inside `"use client"` modules.
