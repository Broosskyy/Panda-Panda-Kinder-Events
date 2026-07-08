# RBAC Final Simplified — Implementation Report

**Date:** 2026-07-08  
**Branch:** `cursor/zero-trust-release-audit-e022`

## Summary

The admin RBAC was simplified to **four practical roles** with consistent server-side enforcement, a personalized dashboard, and role-based UI filtering. Legacy roles (`editor`, `accounting`) are migrated to **Admin** (`manager`) without removing existing tables or working features.

## Roles & Permissions

| Role | Slug | Intent |
|------|------|--------|
| **Super Admin** | `administrator` | Full access: users, modules, domain/SEO, email provider, backup, audit export, security |
| **Admin** | `manager` | Daily business: content, CRM, quotes/invoices, contact, email templates — no system settings |
| **Mitarbeiter** | `employee` | Inquiries + customers only |
| **Nur Lesen** | `readonly` | View-only (`*:read` permissions) |

### Admin (`manager`) — granted
- `dashboard:read`, `analytics:read`, `website:read/write`, content writes (`hero`, `gallery`, `faq`, `reviews`, `posts`, `team`)
- CRM: `crm:read`, `customers:write`, `inquiries:write`, `quotes:write`, `invoices:write`
- `email:write`, `settings:write` (business/contact/opening hours — not system)
- `audit:read` (view only)

### Admin — **not** granted
- `users:read/write`, `settings:system`, `modules:write`, `backup:write`, `security:read/write`, `audit:export`, `invoices:delete`

### Mitarbeiter (`employee`)
- `dashboard:read`, `website:read`, `crm:read`, `customers:write`, `inquiries:write`

### Super Admin only (API-enforced)
- Modules (`modules:write`)
- Email provider / SEO / branding (`settings:system`)
- User & role management (`users:write`)
- Audit export (`audit:export`)
- Invoice delete (`invoices:delete`)
- Backup (`backup:write`)

## Files Changed

### Database
- `supabase/migrations/20260727_rbac_final_simplified.sql` — remaps permissions, migrates `editor`/`accounting` users → `manager`

### Auth & API
- `lib/admin-route.ts` — friendly 403: *„Du hast für diesen Bereich keine Berechtigung.“*
- `src/app/api/admin/settings/route.ts` — `email`/`seo`/`branding` require `settings:system` (no fallback)
- `src/app/api/admin/users/route.ts` — returns only 4 active roles in UI
- `src/app/api/admin/dashboard/route.ts` — returns user name, role, role help, dynamic tasks

### New libraries
- `lib/admin/roles.ts` — active role slugs, display labels, filter helper
- `lib/admin/role-help.ts` — role-specific dashboard hints
- `lib/admin/dashboard-tasks.ts` — task cards from real data + permissions

### UI
- `components/admin/views/DashboardView.tsx` — dynamic greeting, role label, permission-filtered cards, empty state *„Alles erledigt.“*
- `components/admin/views/ErsteSchritteView.tsx` — dynamic name, permission-filtered steps
- `components/admin/AdminQuickActions.tsx` — filtered by permissions
- `components/admin/views/AuditView.tsx` — export buttons only with `audit:export`
- `components/admin/views/UsersView.tsx` — 4 roles only, updated descriptions
- `lib/admin/quickActions.ts` — permission field on each action
- `lib/admin/filter-nav.ts` — settings nav requires `settings:write` or `settings:system`
- `lib/admin/role-descriptions.ts` — 4-role descriptions

## Dashboard Personalization

- Greeting uses session `displayName` (no hardcoded names)
- Role label shown under greeting
- **Heute zu tun** cards built from `buildDashboardTasks()` using live counts + permissions
- Schnellaktionen, Statistik, Sicherheit, CRM sections shown only when permitted
- Empty state when no tasks: *„Alles erledigt.“*
- Role-specific help blocks (Super Admin = technical, Admin = business, etc.)

## Audit Logs

- **View:** `audit:read` — Admin + Super Admin
- **Export:** `audit:export` — Super Admin only (UI + API)
- No delete endpoint exists; export is the guarded critical action

## Verification

```bash
npm run lint    ✅ (0 errors)
npm run typecheck ✅
npm run build   ✅
```

### Manual test matrix

| Check | Super Admin | Admin | Mitarbeiter | Nur Lesen |
|-------|-------------|-------|-------------|-----------|
| Dashboard greeting with real name | ✅ | ✅ | ✅ | ✅ |
| Role label shown | ✅ | ✅ | ✅ | ✅ |
| System/security cards | ✅ | ❌ | ❌ | ❌ |
| Content/CRM cards | ✅ | ✅ | partial | view only |
| Settings (system tabs) | ✅ | ❌ | ❌ | ❌ |
| Audit view | ✅ | ✅ | ❌ | ❌ |
| Audit export | ✅ | ❌ | ❌ | ❌ |
| Samira hardcodes | ❌ removed | | | |

## Migration Notes

Run the new migration on Supabase:

```sql
-- supabase/migrations/20260727_rbac_final_simplified.sql
```

Users on `editor` or `accounting` are automatically reassigned to `manager` (Admin).

## Constraints Respected

- No working admin features removed
- Existing permission tables reused; permissions remapped, not deleted
- Legacy role slugs remain in DB for referential integrity
- Server-side checks on all protected API routes via `requireAdmin(permission)`
