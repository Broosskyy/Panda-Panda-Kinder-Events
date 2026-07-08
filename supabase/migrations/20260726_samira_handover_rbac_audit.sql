-- Samira handover: RBAC tightening, audit columns, module permissions (idempotent)

-- Audit log: IP and user agent
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS admin_audit_logs_user_idx ON admin_audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_action_idx ON admin_audit_logs (action);

-- Friendly role labels for Samira
UPDATE admin_roles SET label = 'Super Admin' WHERE slug = 'administrator';
UPDATE admin_roles SET label = 'Admin' WHERE slug = 'manager';
UPDATE admin_roles SET label = 'Mitarbeiter' WHERE slug = 'employee';
UPDATE admin_roles SET label = 'Nur Lesen' WHERE slug = 'readonly';

-- New permissions
INSERT INTO admin_permissions (slug, label, area) VALUES
  ('invoices:delete', 'Rechnungen löschen/stornieren', 'crm'),
  ('settings:system', 'Systemeinstellungen (Domain, E-Mail)', 'settings'),
  ('modules:write', 'Module aktivieren/deaktivieren', 'settings'),
  ('backup:write', 'Backup erstellen', 'settings'),
  ('audit:export', 'Aktivitätsprotokoll exportieren', 'audit')
ON CONFLICT (slug) DO NOTHING;

-- Super Admin: all new permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.slug = 'administrator'
  AND p.slug IN ('invoices:delete', 'settings:system', 'modules:write', 'backup:write', 'audit:export')
ON CONFLICT DO NOTHING;

-- Admin (manager): invoices write but not delete; no system/modules/backup
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug = 'invoices:delete'
WHERE r.slug = 'manager'
ON CONFLICT DO NOTHING;
-- Remove invoices:delete from manager if mistakenly added above - manager should NOT delete
DELETE FROM admin_role_permissions
WHERE role_id = (SELECT id FROM admin_roles WHERE slug = 'manager')
  AND permission_id = (SELECT id FROM admin_permissions WHERE slug = 'invoices:delete');

-- Tighten Mitarbeiter: only dashboard, website read, CRM read, inquiries
DELETE FROM admin_role_permissions
WHERE role_id = (SELECT id FROM admin_roles WHERE slug = 'employee');

INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug IN (
  'dashboard:read', 'website:read', 'crm:read', 'inquiries:write'
)
WHERE r.slug = 'employee'
ON CONFLICT DO NOTHING;

-- Accounting: add invoices:delete? No - only super admin deletes invoices per spec
-- Manager gets settings:write for content settings? Currently manager lacks settings:write - good

-- Admin manager: ensure quotes/invoices/customers but not users/security write
-- (already seeded in 20260712 migration)
