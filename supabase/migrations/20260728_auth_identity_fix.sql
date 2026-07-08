-- Auth identity fix: preserve original super admin account (idempotent)

-- Ensure Manuel's original account remains Super Admin if present
UPDATE admin_users
SET role_id = (SELECT id FROM admin_roles WHERE slug = 'administrator' LIMIT 1),
    active = true,
    updated_at = now()
WHERE lower(email) = 'manuel.bauch0705@gmail.com';

-- Invalidate orphaned sessions pointing to deleted users (safety)
DELETE FROM admin_sessions
WHERE user_id NOT IN (SELECT id FROM admin_users);

-- Index for reliable email lookup at login
CREATE INDEX IF NOT EXISTS admin_users_email_lower_idx ON admin_users (lower(email));
