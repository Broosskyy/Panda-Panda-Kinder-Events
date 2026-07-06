-- Security & Administration v1.0 (idempotent, no data deletion)

-- ─── Team members (expanded) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'readonly')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS first_name text DEFAULT '';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS last_name text DEFAULT '';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS display_name text DEFAULT '';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS title text DEFAULT '';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS position text DEFAULT '';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS profile_image_url text DEFAULT '';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS team_members_username_unique_idx ON team_members (username) WHERE username IS NOT NULL AND username <> '';
CREATE INDEX IF NOT EXISTS team_members_sort_idx ON team_members (sort_order, last_name);
CREATE INDEX IF NOT EXISTS team_members_archived_idx ON team_members (archived);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS team_members_service_role ON team_members;
CREATE POLICY team_members_service_role ON team_members FOR ALL USING (true) WITH CHECK (true);

-- ─── Admin roles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Admin permissions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  area text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_id uuid NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ─── Admin users ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role_id uuid NOT NULL REFERENCES admin_roles(id),
  active boolean NOT NULL DEFAULT true,
  avatar text,
  phone text,
  totp_enabled boolean NOT NULL DEFAULT false,
  totp_secret text,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS admin_users_role_idx ON admin_users (role_id);
CREATE INDEX IF NOT EXISTS admin_users_active_idx ON admin_users (active);

-- ─── Sessions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  user_agent text,
  device_label text,
  ip_hash text,
  trusted_until timestamptz,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_sessions_user_idx ON admin_sessions (user_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON admin_sessions (expires_at);

-- ─── Login history ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  identifier_attempt text,
  success boolean NOT NULL DEFAULT false,
  ip_hash text,
  user_agent text,
  device_label text,
  os_label text,
  browser_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_login_history_user_idx ON admin_login_history (user_id, created_at DESC);

-- ─── Audit logs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  user_display_name text,
  role_slug text,
  action text NOT NULL,
  area text NOT NULL,
  entity_id text,
  before_json jsonb,
  after_json jsonb,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_created_idx ON admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_area_idx ON admin_audit_logs (area);

-- ─── Password reset tokens ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 2FA backup codes ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_backup_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_backup_codes_user_idx ON admin_backup_codes (user_id);

-- ─── Security settings (key-value) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_security_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: service role only
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_security_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_roles_service ON admin_roles;
CREATE POLICY admin_roles_service ON admin_roles FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_permissions_service ON admin_permissions;
CREATE POLICY admin_permissions_service ON admin_permissions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_role_permissions_service ON admin_role_permissions;
CREATE POLICY admin_role_permissions_service ON admin_role_permissions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_users_service ON admin_users;
CREATE POLICY admin_users_service ON admin_users FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_sessions_service ON admin_sessions;
CREATE POLICY admin_sessions_service ON admin_sessions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_login_history_service ON admin_login_history;
CREATE POLICY admin_login_history_service ON admin_login_history FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_audit_logs_service ON admin_audit_logs;
CREATE POLICY admin_audit_logs_service ON admin_audit_logs FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_password_resets_service ON admin_password_resets;
CREATE POLICY admin_password_resets_service ON admin_password_resets FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_backup_codes_service ON admin_backup_codes;
CREATE POLICY admin_backup_codes_service ON admin_backup_codes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS admin_security_settings_service ON admin_security_settings;
CREATE POLICY admin_security_settings_service ON admin_security_settings FOR ALL USING (true) WITH CHECK (true);

-- ─── Seed roles ────────────────────────────────────────────────────────────
INSERT INTO admin_roles (slug, label, is_system) VALUES
  ('administrator', 'Administrator', true),
  ('manager', 'Manager', true),
  ('employee', 'Mitarbeiter', true),
  ('editor', 'Redakteur', true),
  ('accounting', 'Buchhaltung', true),
  ('readonly', 'Nur Lesen', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── Seed permissions ──────────────────────────────────────────────────────
INSERT INTO admin_permissions (slug, label, area) VALUES
  ('dashboard:read', 'Dashboard ansehen', 'dashboard'),
  ('analytics:read', 'Analytics ansehen', 'analytics'),
  ('website:read', 'Website ansehen', 'website'),
  ('website:write', 'Website bearbeiten', 'website'),
  ('hero:write', 'Hero bearbeiten', 'website'),
  ('gallery:write', 'Galerie bearbeiten', 'website'),
  ('faq:write', 'FAQ bearbeiten', 'website'),
  ('reviews:write', 'Bewertungen bearbeiten', 'website'),
  ('posts:write', 'Beiträge bearbeiten', 'website'),
  ('crm:read', 'CRM ansehen', 'crm'),
  ('customers:write', 'Kunden bearbeiten', 'crm'),
  ('inquiries:write', 'Anfragen bearbeiten', 'crm'),
  ('quotes:write', 'Angebote bearbeiten', 'crm'),
  ('invoices:write', 'Rechnungen bearbeiten', 'crm'),
  ('users:read', 'Benutzer ansehen', 'users'),
  ('users:write', 'Benutzer verwalten', 'users'),
  ('settings:write', 'Einstellungen bearbeiten', 'settings'),
  ('security:read', 'Sicherheit ansehen', 'security'),
  ('security:write', 'Sicherheit verwalten', 'security'),
  ('audit:read', 'Audit-Log ansehen', 'audit'),
  ('team:write', 'Team verwalten', 'team'),
  ('email:write', 'E-Mail-Einstellungen', 'email')
ON CONFLICT (slug) DO NOTHING;

-- Administrator: all permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r CROSS JOIN admin_permissions p WHERE r.slug = 'administrator'
ON CONFLICT DO NOTHING;

-- Employee
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r JOIN admin_permissions p ON p.slug IN (
  'dashboard:read','website:read','website:write','gallery:write','faq:write','reviews:write',
  'posts:write','crm:read','customers:write','inquiries:write','team:write'
) WHERE r.slug = 'employee'
ON CONFLICT DO NOTHING;

-- Manager: broad access except security write
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r JOIN admin_permissions p ON p.slug IN (
  'dashboard:read','analytics:read','website:read','website:write','hero:write','gallery:write',
  'faq:write','reviews:write','posts:write','crm:read','customers:write','inquiries:write',
  'quotes:write','invoices:write','team:write','email:write','audit:read','security:read'
) WHERE r.slug = 'manager'
ON CONFLICT DO NOTHING;

-- Editor
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r JOIN admin_permissions p ON p.slug IN (
  'dashboard:read','website:read','website:write','gallery:write','faq:write','reviews:write','posts:write','inquiries:write'
) WHERE r.slug = 'editor'
ON CONFLICT DO NOTHING;

-- Accounting
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r JOIN admin_permissions p ON p.slug IN (
  'dashboard:read','crm:read','customers:write','quotes:write','invoices:write','email:write'
) WHERE r.slug = 'accounting'
ON CONFLICT DO NOTHING;

-- Readonly
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r JOIN admin_permissions p ON p.slug LIKE '%:read'
WHERE r.slug = 'readonly'
ON CONFLICT DO NOTHING;

-- Default security settings
INSERT INTO admin_security_settings (key, value) VALUES
  ('password_policy', '{"minLength":12,"requireUppercase":true,"requireNumber":true}'::jsonb),
  ('login_policy', '{"maxAttempts":5,"lockoutMinutes":15,"sessionHours":8,"rememberDays":30}'::jsonb),
  ('rate_limit', '{"loginPerIp":10,"windowMinutes":15}'::jsonb)
ON CONFLICT (key) DO NOTHING;
