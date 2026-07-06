-- Branding + Email CMS (idempotent)

-- ─── E-Mail Vorlagen ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  body_text text,
  area text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  variables text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_templates_area_idx ON email_templates (area);
CREATE INDEX IF NOT EXISTS email_templates_active_idx ON email_templates (is_active);

-- ─── E-Mail Logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  subject text NOT NULL,
  template_slug text,
  area text,
  status text NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message text,
  sent_by_admin_id uuid,
  related_customer_id uuid,
  related_quote_id uuid,
  related_invoice_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_logs_created_idx ON email_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS email_logs_area_idx ON email_logs (area);

-- ─── E-Mail Entwürfe ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text,
  subject text,
  body_html text,
  template_slug text,
  created_by_admin_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_drafts_updated_idx ON email_drafts (updated_at DESC);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_templates_service ON email_templates;
CREATE POLICY email_templates_service ON email_templates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS email_logs_service ON email_logs;
CREATE POLICY email_logs_service ON email_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS email_drafts_service ON email_drafts;
CREATE POLICY email_drafts_service ON email_drafts FOR ALL USING (true) WITH CHECK (true);

-- Seed default templates (only if empty)
INSERT INTO email_templates (slug, name, subject, body_html, body_text, area, is_default, variables)
SELECT * FROM (VALUES
  (
    'general-message',
    'Allgemeine Nachricht',
    'Nachricht von {{company_name}}',
    '<p>Guten Tag {{customer_name}},</p><p>{{message}}</p>',
    'Guten Tag {{customer_name}},\n\n{{message}}',
    'general',
    true,
    ARRAY['company_name','customer_name','message','company_email','company_phone','company_website']
  ),
  (
    'inquiry-auto-reply',
    'Kontaktformular Auto-Reply',
    'Vielen Dank für Ihre Anfrage — {{company_name}}',
    '<p>Guten Tag {{customer_name}},</p><p>vielen Dank für Ihre Anfrage. Wir melden uns innerhalb von 24 Stunden.</p>',
    'Guten Tag {{customer_name}},\n\nvielen Dank für Ihre Anfrage. Wir melden uns innerhalb von 24 Stunden.',
    'inquiry',
    true,
    ARRAY['company_name','customer_name','company_email','company_phone']
  ),
  (
    'quote-send',
    'Angebot senden',
    'Ihr Angebot {{quote_number}} — {{company_name}}',
    '<p>Guten Tag {{customer_name}},</p><p>anbei erhalten Sie unser Angebot <strong>{{quote_number}}</strong>.</p><p>Gesamtbetrag: <strong>{{total_amount}}</strong></p>',
    'Guten Tag {{customer_name}},\n\nanbei erhalten Sie unser Angebot {{quote_number}}.\nGesamtbetrag: {{total_amount}}',
    'quote',
    true,
    ARRAY['company_name','customer_name','quote_number','total_amount','company_email','company_phone','company_website']
  ),
  (
    'invoice-send',
    'Rechnung senden',
    'Ihre Rechnung {{invoice_number}} — {{company_name}}',
    '<p>Guten Tag {{customer_name}},</p><p>anbei erhalten Sie Ihre Rechnung <strong>{{invoice_number}}</strong>.</p><p>Gesamtbetrag: <strong>{{total_amount}}</strong></p><p>Fällig: {{due_date}}</p>',
    'Guten Tag {{customer_name}},\n\nanbei Ihre Rechnung {{invoice_number}}.\nGesamtbetrag: {{total_amount}}\nFällig: {{due_date}}',
    'invoice',
    true,
    ARRAY['company_name','customer_name','invoice_number','total_amount','due_date','payment_terms','iban','bic']
  ),
  (
    'password-reset',
    'Passwort zurücksetzen',
    'Passwort zurücksetzen — {{company_name}}',
    '<p>Guten Tag,</p><p>Sie haben eine Passwort-Zurücksetzung angefordert.</p>',
    'Guten Tag,\n\nSie haben eine Passwort-Zurücksetzung angefordert.',
    'password_reset',
    true,
    ARRAY['company_name','company_website']
  ),
  (
    'security-login',
    'Login/Security Hinweis',
    'Sicherheitshinweis — {{company_name}}',
    '<p>Es gab eine Anmeldung in Ihrem Admin-Konto.</p>',
    'Es gab eine Anmeldung in Ihrem Admin-Konto.',
    'security',
    true,
    ARRAY['company_name','admin_name']
  )
) AS v(slug, name, subject, body_html, body_text, area, is_default, variables)
WHERE NOT EXISTS (SELECT 1 FROM email_templates LIMIT 1);
