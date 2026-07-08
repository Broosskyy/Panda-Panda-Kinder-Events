-- RBAC final simplification: 4 practical roles (idempotent)

-- Friendly role labels
UPDATE admin_roles SET label = 'Super Admin' WHERE slug = 'administrator';
UPDATE admin_roles SET label = 'Admin' WHERE slug = 'manager';
UPDATE admin_roles SET label = 'Mitarbeiter' WHERE slug = 'employee';
UPDATE admin_roles SET label = 'Nur Lesen' WHERE slug = 'readonly';

-- Migrate legacy roles to Admin (manager)
UPDATE admin_users
SET role_id = (SELECT id FROM admin_roles WHERE slug = 'manager')
WHERE role_id IN (
  SELECT id FROM admin_roles WHERE slug IN ('editor', 'accounting')
);

-- ─── Admin (manager): daily business, no system/security ─────────────────
DELETE FROM admin_role_permissions
WHERE role_id = (SELECT id FROM admin_roles WHERE slug = 'manager');

INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug IN (
  'dashboard:read',
  'analytics:read',
  'website:read',
  'website:write',
  'hero:write',
  'gallery:write',
  'faq:write',
  'reviews:write',
  'posts:write',
  'crm:read',
  'customers:write',
  'inquiries:write',
  'quotes:write',
  'invoices:write',
  'team:write',
  'email:write',
  'settings:write',
  'audit:read'
)
WHERE r.slug = 'manager'
ON CONFLICT DO NOTHING;

-- ─── Mitarbeiter: inquiries + customers only ─────────────────────────────
DELETE FROM admin_role_permissions
WHERE role_id = (SELECT id FROM admin_roles WHERE slug = 'employee');

INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug IN (
  'dashboard:read',
  'website:read',
  'crm:read',
  'customers:write',
  'inquiries:write'
)
WHERE r.slug = 'employee'
ON CONFLICT DO NOTHING;

-- ─── Nur Lesen: read-only ────────────────────────────────────────────────
DELETE FROM admin_role_permissions
WHERE role_id = (SELECT id FROM admin_roles WHERE slug = 'readonly');

INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug LIKE '%:read'
WHERE r.slug = 'readonly'
ON CONFLICT DO NOTHING;
