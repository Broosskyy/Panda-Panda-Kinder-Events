-- Email System V2 — aliases, extended logs, white-label ready (tenant_id nullable)

-- ─── E-Mail Aliase & Weiterleitungen ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  alias_address text NOT NULL,
  forward_to text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_aliases_tenant_idx ON email_aliases (tenant_id);
CREATE INDEX IF NOT EXISTS email_aliases_active_idx ON email_aliases (is_active);
CREATE UNIQUE INDEX IF NOT EXISTS email_aliases_address_tenant_idx
  ON email_aliases (lower(alias_address), COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- ─── E-Mail Logs erweitern ───────────────────────────────────────────────────
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS original_recipient text;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS sender_from text;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS body_preview text;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS opened_at timestamptz;
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS tenant_id uuid;

CREATE INDEX IF NOT EXISTS email_logs_customer_idx ON email_logs (related_customer_id);
CREATE INDEX IF NOT EXISTS email_logs_recipient_idx ON email_logs (recipient);

ALTER TABLE email_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_aliases_service ON email_aliases;
CREATE POLICY email_aliases_service ON email_aliases FOR ALL USING (true) WITH CHECK (true);
