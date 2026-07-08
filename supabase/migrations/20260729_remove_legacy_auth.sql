-- Remove legacy auth completely: clear stale pb_admin_auth sessions cannot authenticate

-- Ensure Manuel's account remains Super Admin
UPDATE admin_users
SET role_id = (SELECT id FROM admin_roles WHERE slug = 'administrator' LIMIT 1),
    active = true,
    updated_at = now()
WHERE lower(email) = 'manuel.bauch0705@gmail.com';

-- Delete orphaned sessions
DELETE FROM admin_sessions
WHERE user_id NOT IN (SELECT id FROM admin_users);
