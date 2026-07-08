-- Grant Admin (manager) permission to invite users without full users:write
-- Idempotent: adapts to existing RBAC schema (admin_permissions uses "area", not "category")

DO $$
DECLARE
  has_permissions boolean;
  has_roles boolean;
  has_role_permissions boolean;
  has_users boolean;
  group_col text;
BEGIN
  has_permissions := to_regclass('public.admin_permissions') IS NOT NULL;
  has_roles := to_regclass('public.admin_roles') IS NOT NULL;
  has_role_permissions := to_regclass('public.admin_role_permissions') IS NOT NULL;
  has_users := to_regclass('public.admin_users') IS NOT NULL;

  -- ─── users:invite permission ─────────────────────────────────────────────
  IF has_permissions THEN
    SELECT c.column_name
    INTO group_col
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'admin_permissions'
      AND c.column_name IN ('area', 'category')
    ORDER BY CASE c.column_name WHEN 'area' THEN 0 ELSE 1 END
    LIMIT 1;

    IF group_col IS NOT NULL THEN
      EXECUTE format(
        'INSERT INTO admin_permissions (slug, label, %I)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO NOTHING',
        group_col
      )
      USING 'users:invite', 'Benutzer einladen', 'users';
    END IF;
  END IF;

  -- ─── Role assignments ────────────────────────────────────────────────────
  IF has_permissions AND has_roles AND has_role_permissions THEN
    -- Admin + Super Admin: users:invite
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r
    JOIN admin_permissions p ON p.slug = 'users:invite'
    WHERE r.slug IN ('administrator', 'manager')
    ON CONFLICT DO NOTHING;

    -- Super Admin: ensure users:invite (redundant but harmless)
    INSERT INTO admin_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM admin_roles r
    JOIN admin_permissions p ON p.slug = 'users:invite'
    WHERE r.slug = 'administrator'
    ON CONFLICT DO NOTHING;
  END IF;

  -- ─── admin_users.must_change_password ────────────────────────────────────
  IF has_users
     AND NOT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'admin_users'
         AND column_name = 'must_change_password'
     ) THEN
    ALTER TABLE admin_users
      ADD COLUMN must_change_password boolean NOT NULL DEFAULT false;
  END IF;
END $$;
