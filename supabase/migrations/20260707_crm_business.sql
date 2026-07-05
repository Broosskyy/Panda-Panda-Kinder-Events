-- Sprint 3 — Business CRM (Kunden, Angebote, Rechnungen)
-- Schlankes CRM für kleines Unternehmen — kein DATEV, keine Buchhaltung

-- ── Kunden ──
create table if not exists crm_customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'lead'))
);

create index if not exists idx_crm_customers_name on crm_customers(name);
create index if not exists idx_crm_customers_email on crm_customers(email);

alter table crm_customers enable row level security;
create policy "No public access on crm_customers" on crm_customers for all using (false);

-- ── Anfragen → Kunde verknüpfen ──
alter table booking_requests add column if not exists customer_id uuid references crm_customers(id);

create index if not exists idx_booking_requests_customer on booking_requests(customer_id);

-- ── Nummernkreise ──
create table if not exists crm_number_sequences (
  doc_type text not null,
  year int not null,
  last_number int not null default 0,
  primary key (doc_type, year)
);

alter table crm_number_sequences enable row level security;
create policy "No public access on crm_number_sequences" on crm_number_sequences for all using (false);

-- ── Angebote ──
create table if not exists crm_quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_id uuid not null references crm_customers(id) on delete restrict,
  booking_request_id uuid references booking_requests(id) on delete set null,
  quote_number text not null unique,
  title text not null default 'Angebot',
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'confirmed', 'paid', 'open', 'cancelled')),
  remarks text,
  discount_percent numeric(5,2) not null default 0,
  tax_rate numeric(5,2) not null default 19.00,
  subtotal_cents int not null default 0,
  discount_cents int not null default 0,
  tax_cents int not null default 0,
  total_cents int not null default 0,
  valid_until date,
  sent_at timestamptz
);

create index if not exists idx_crm_quotes_customer on crm_quotes(customer_id);
create index if not exists idx_crm_quotes_status on crm_quotes(status);

alter table crm_quotes enable row level security;
create policy "No public access on crm_quotes" on crm_quotes for all using (false);

create table if not exists crm_quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references crm_quotes(id) on delete cascade,
  sort_order int not null default 0,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price_cents int not null default 0,
  line_total_cents int not null default 0
);

create index if not exists idx_crm_quote_items_quote on crm_quote_items(quote_id);

alter table crm_quote_items enable row level security;
create policy "No public access on crm_quote_items" on crm_quote_items for all using (false);

-- ── Rechnungen ──
create table if not exists crm_invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_id uuid not null references crm_customers(id) on delete restrict,
  quote_id uuid references crm_quotes(id) on delete set null,
  invoice_number text not null unique,
  title text not null default 'Rechnung',
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'confirmed', 'paid', 'open', 'cancelled')),
  remarks text,
  discount_percent numeric(5,2) not null default 0,
  tax_rate numeric(5,2) not null default 19.00,
  subtotal_cents int not null default 0,
  discount_cents int not null default 0,
  tax_cents int not null default 0,
  total_cents int not null default 0,
  issue_date date not null default current_date,
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz
);

create index if not exists idx_crm_invoices_customer on crm_invoices(customer_id);
create index if not exists idx_crm_invoices_status on crm_invoices(status);

alter table crm_invoices enable row level security;
create policy "No public access on crm_invoices" on crm_invoices for all using (false);

create table if not exists crm_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references crm_invoices(id) on delete cascade,
  sort_order int not null default 0,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price_cents int not null default 0,
  line_total_cents int not null default 0
);

create index if not exists idx_crm_invoice_items_invoice on crm_invoice_items(invoice_id);

alter table crm_invoice_items enable row level security;
create policy "No public access on crm_invoice_items" on crm_invoice_items for all using (false);

-- ── Kundenhistorie / Events ──
create table if not exists crm_customer_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_id uuid not null references crm_customers(id) on delete cascade,
  event_type text not null,
  title text not null,
  details text,
  reference_id uuid,
  reference_type text
);

create index if not exists idx_crm_customer_events_customer on crm_customer_events(customer_id);

alter table crm_customer_events enable row level security;
create policy "No public access on crm_customer_events" on crm_customer_events for all using (false);
