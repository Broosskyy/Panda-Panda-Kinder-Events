-- Team vs Admin Users cleanup (idempotent, no data deletion)

-- Optional link: admin user ↔ public team member
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS team_member_id uuid REFERENCES team_members(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS admin_users_team_member_idx ON admin_users (team_member_id);

-- Team email is optional (public contact only)
ALTER TABLE team_members ALTER COLUMN email DROP NOT NULL;

-- Mark legacy role column as non-login (kept for backwards compatibility)
COMMENT ON COLUMN team_members.role IS 'Legacy CMS role label — not used for admin login. Admin access via admin_users.';
