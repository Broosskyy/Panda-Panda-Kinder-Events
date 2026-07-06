-- Admin Control Center v1 — extends site_settings keys (JSON, no schema change)
-- Keys: bank, invoice, seo, legal are merged from defaults in application code.
-- Idempotent: documents new settings keys only.

comment on table site_settings is 'CMS key-value settings. Keys: hero, contact, business, email, bank, invoice, seo, legal, ...';
