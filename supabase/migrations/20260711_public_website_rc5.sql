-- Public Website RC5 — CMS service extensions (idempotent)
alter table cms_services add column if not exists price_from text default '';
alter table cms_services add column if not exists highlights jsonb default '[]'::jsonb;
