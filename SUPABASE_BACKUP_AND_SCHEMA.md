# Supabase — Schema & Backup

**Version:** v1.0-checkpoint · **Keine Secrets in diesem Dokument**

## Migrationen (Reihenfolge)

| # | Datei | Inhalt |
|---|-------|--------|
| 1 | `20260703_cms_v080.sql` | CMS, site_settings, booking/reviews RLS |
| 2 | `20260703_page_views_analytics.sql` | page_views, Analytics-Funktionen |
| 3 | `20260704_storage_buckets_public.sql` | gallery, reviews, site-assets |
| 4 | `20260705_rc2_security_rls.sql` | Analytics-RPC-Rechte |
| 5 | `20260706_analytics_enhanced.sql` | browser/os Spalten |
| 6 | `20260707_crm_business.sql` | CRM-Tabellen |
| 7 | `20260708_team_members.sql` | team_members |
| 8 | `20260709_public_website_cms.sql` | Service-Detailfelder |
| 9 | `20260710_production_crash_compat.sql` | Idempotente Fixes |
| 10 | `20260711_public_website_rc5.sql` | price_from, highlights |
| 11 | `20260712_security_admin_v1.sql` | Admin-Auth komplett |
| 12 | `20260713_team_users_cleanup.sql` | team_member_id Verknüpfung |

**Basis-Schema:** `supabase/schema.sql` (booking_requests, reviews — falls nicht nur via Migration)

---

## Tabellen (25 in public)

### Öffentlich / CMS
- `site_settings` (key, value jsonb)
- `cms_services`, `cms_faqs`, `cms_posts`, `gallery_images`
- `team_members`
- `reviews`, `booking_requests`
- `page_views`

### CRM
- `crm_customers`, `crm_quotes`, `crm_quote_items`
- `crm_invoices`, `crm_invoice_items`
- `crm_customer_events`, `crm_number_sequences`

### Admin / Security
- `admin_roles`, `admin_permissions`, `admin_role_permissions`
- `admin_users`, `admin_sessions`, `admin_login_history`
- `admin_audit_logs`, `admin_password_resets`, `admin_backup_codes`
- `admin_security_settings`

---

## Wichtige Beziehungen

```
crm_customers ← booking_requests, crm_quotes, crm_invoices
crm_quotes → crm_quote_items
crm_invoices → crm_invoice_items
admin_users → admin_roles
admin_users → team_members (optional)
team_members ← admin_users.team_member_id
```

---

## Storage Buckets

| Bucket | Public read | Max 5MB | MIME |
|--------|-------------|---------|------|
| gallery | Ja | Ja | jpeg, png, webp |
| reviews | Ja | Ja | jpeg, png, webp |
| site-assets | Ja | Ja | jpeg, png, webp |

---

## RLS (Row Level Security)

**Muster 1 — Deny all (CMS, CRM, Analytics):**  
`anon` und `authenticated` haben keinen direkten Tabellenzugriff. Die Next.js-API nutzt den **Service Role Key** serverseitig.

**Muster 2 — Service policies (admin_*):**  
Policies erlauben technisch alles; Zugriff nur über geschützte API.

**Storage:** Nur `SELECT` (Lesen) öffentlich pro Bucket.

---

## Analytics-Funktionen (RPC)

Nur für Service Role: `analytics_daily_stats`, `analytics_top_pages`, `analytics_live_stats`, u. a.  
Revoked für `public`, `anon`, `authenticated`.

---

## Backup

Siehe `backups/checkpoint-v1/DATABASE_BACKUP_GUIDE.md` und:

```bash
npm run export:cms
npm run export:crm
```

---

## Restore

Siehe `SUPABASE_RESTORE_GUIDE.md`
