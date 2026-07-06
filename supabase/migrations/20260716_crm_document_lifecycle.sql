-- CRM document lifecycle: soft delete, archive, cancel

alter table crm_quotes add column if not exists deleted_at timestamptz;
alter table crm_quotes add column if not exists archived_at timestamptz;
alter table crm_quotes add column if not exists cancelled_at timestamptz;
alter table crm_quotes add column if not exists cancelled_reason text;

alter table crm_invoices add column if not exists deleted_at timestamptz;
alter table crm_invoices add column if not exists archived_at timestamptz;
alter table crm_invoices add column if not exists cancelled_at timestamptz;
alter table crm_invoices add column if not exists cancelled_reason text;

create index if not exists idx_crm_quotes_deleted on crm_quotes(deleted_at) where deleted_at is null;
create index if not exists idx_crm_quotes_archived on crm_quotes(archived_at);
create index if not exists idx_crm_invoices_deleted on crm_invoices(deleted_at) where deleted_at is null;
create index if not exists idx_crm_invoices_archived on crm_invoices(archived_at);
