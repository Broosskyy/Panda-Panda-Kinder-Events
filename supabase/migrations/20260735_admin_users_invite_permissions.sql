-- Grant Admin (manager) permission to invite users without full users:write

INSERT INTO admin_permissions (slug, label, category)
VALUES ('users:invite', 'Benutzer einladen', 'users')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug = 'users:invite'
WHERE r.slug IN ('administrator', 'manager')
ON CONFLICT DO NOTHING;

-- Super Admin already has users:write; ensure users:invite is also present
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug = 'users:invite'
WHERE r.slug = 'administrator'
ON CONFLICT DO NOTHING;

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
