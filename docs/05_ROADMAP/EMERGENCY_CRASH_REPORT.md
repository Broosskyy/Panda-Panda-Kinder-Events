# Emergency Crash Report — Digest 1267400528

**Date:** 2026-07-05  
**Priority:** Production outage  
**Status:** Fixed in `cursor/emergency-crash-fix-e022`

## Symptom

Live site showed:

```
Application error: a server-side exception has occurred
Digest: 1267400528
```

## Vercel logs

Vercel project logs were not accessible from the agent environment. The digest maps to a server-side exception during SSR of the public homepage (Next.js App Router).

## Root cause (most likely)

After the Public Website Final Sprint (`0.9.0-rc.10`), the homepage renders a new **Team** section and passes CMS section headings explicitly:

```tsx
<Team team={settings.publicTeam} heading={settings.sections.team} />
```

**JavaScript default parameters do not apply when a parent passes `undefined` explicitly.** If production `site_settings.sections` in the database predates the `team` key (or partial/invalid CMS JSON), `settings.sections.team` is `undefined` at runtime. Section components then access `heading.title` → `TypeError: Cannot read properties of undefined`.

Secondary risks addressed in the same fix:

| Risk | Impact |
|------|--------|
| Missing `publicTeam` in DB | Team section / images |
| `cms_services` columns missing | Service query throws |
| `gallery_images` query error | Uncaught throw on homepage |
| Partial `sections` JSON | Any section heading undefined |
| Empty `imageUrl` on team members | Next.js `<Image>` throws |

## Fix applied

1. **`lib/cms/normalize-settings.ts`** — `normalizeSiteSettings()` deep-merges all CMS fields with `DEFAULT_SITE_SETTINGS`; `resolveSectionHeading()` for safe headings.
2. **`lib/cms/data.ts`** — All public fetches return fallbacks; `buildSettingsFromRows` wrapped in try/catch; service/gallery queries no longer throw.
3. **`lib/cms/validate-settings.ts`** — Section headings merge per-key with defaults instead of failing the whole block.
4. **Section components** — Use `resolveSectionHeading()` instead of relying on default props.
5. **`Team.tsx`** — Safe fallback for empty `imageUrl`.
6. **Migration** — `supabase/migrations/20260710_production_crash_compat.sql` (idempotent).

## Migration checklist (production Supabase)

Run in order if not already applied:

1. `20260703_cms_v080.sql`
2. `20260703_page_views_analytics.sql`
3. `20260706_analytics_enhanced.sql`
4. `20260707_crm_business.sql`
5. `20260708_team_members.sql`
6. `20260709_public_website_cms.sql`
7. **`20260710_production_crash_compat.sql`** (new)

## Regression checklist

| Area | Expected |
|------|----------|
| Homepage `/` | Loads with defaults if CMS incomplete |
| Admin `/admin` | Loads independently |
| Kunden / Angebote / Rechnungen | CRM unaffected |
| E-Mail Einstellungen | Admin-only |
| Kontaktformular | Works without CRM tables |
| Galerie / Bewertungen / Beiträge | Empty state, no crash |
| Analytics | Client track fails silently |

## Verification

```bash
npm run build
npm run lint
```

Deploy branch `cursor/emergency-crash-fix-e022` to Vercel production after merge.

## Prevention

- Public routes must never throw on missing CMS/CRM/analytics data.
- New CMS keys require defaults in `DEFAULT_SITE_SETTINGS` **and** `normalizeSiteSettings()`.
- Section headings: always use `resolveSectionHeading()`, never assume default props when parent passes props explicitly.
