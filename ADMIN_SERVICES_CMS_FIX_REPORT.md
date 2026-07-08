# Admin Services CMS Fix — Report

## Problem

The public homepage showed 8 services (Kinderschminken, Kindergeburtstage, etc.) from hardcoded `lib/services.ts`, while the admin **Leistungen** page read only from the empty `cms_services` table — so admins saw no editable entries.

## Solution

### One-time seed (no duplicates)
- On first `GET /api/admin/services`, `ensureCmsServicesSeeded()` imports all 8 static services into `cms_services` when the table is empty
- Unique index on `lower(title)` prevents duplicate titles
- Toast in admin confirms when seed runs

### Public website
- When `cms_services` has rows → **only CMS data** is used (no silent fallback to hardcoded duplicates)
- When table is empty (no DB) → static fallback still works for local dev
- `revalidatePublicCms()` after every mutation for immediate visibility

### Admin UI (`/admin/leistungen`)
- Mobile-friendly service cards with image, title, category, status
- **Leistung hinzufügen** button in page header
- Per service: Bearbeiten, Ausblenden/Einblenden, Reihenfolge ↑↓, Löschen
- Full edit form: title, description, detail text, image URL/upload, button text/link, category, price, highlights, visibility

### Extended fields
| Field | DB column | Public |
|-------|-----------|--------|
| Titel | `title` | ✓ |
| Beschreibung | `description` | ✓ |
| Detailtext | `detail_text` | Modal |
| Bild | `image_url` | Card + modal |
| Button-Text | `button_label` | Card |
| Button-Link | `button_link` | Modal CTA |
| Kategorie | `category` | Admin only (display) |
| Preis ab | `price_from` | Card |
| Highlights | `highlights` | Card |
| Reihenfolge | `sort_order` | ✓ |
| Sichtbar | `visible` | ✓ |

### Audit log (`area: cms_services`)
- `service_create`
- `service_update`
- `service_image_change`
- `service_visibility_change` / `service_archive`
- `service_sort_change`
- `service_delete`

## Files

| File | Change |
|------|--------|
| `lib/cms/services-db.ts` | Seed + list + reorder helpers |
| `lib/services.ts` | Categories + button links on static defaults |
| `lib/cms/admin-schemas.ts` | Extended Zod schema |
| `lib/cms/data.ts` | CMS-only when table has rows |
| `src/app/api/admin/services/route.ts` | Seed, audit, reorder |
| `components/admin/views/ServicesView.tsx` | Full mobile admin UI |
| `components/sections/Services.tsx` | Button link in modal |
| `supabase/migrations/20260734_...sql` | category, button_link, unique title |

## Verification

```bash
node scripts/admin-services-cms-fix-test.mjs  # 17 passed
npm run lint      # clean
npm run typecheck # clean
npm run build     # success
```

## Manual QA

- [ ] Open Admin → Leistungen → 8 services appear after first load
- [ ] Edit Kinderschminken title → homepage updates
- [ ] Hide service → disappears on homepage
- [ ] Add new service → appears on homepage
- [ ] Reorder changes card order
- [ ] No duplicate services after reload
- [ ] Mobile cards readable, actions not clipped

## Migration

Run `supabase/migrations/20260734_cms_services_category_button_link.sql` before deploy.
