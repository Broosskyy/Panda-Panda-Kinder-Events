-- Admin user invitations (one-time tokens, hashed storage)

CREATE TABLE IF NOT EXISTS admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  email text NOT NULL,
  display_name text NOT NULL,
  role_id uuid NOT NULL REFERENCES admin_roles(id),
  invited_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  accepted_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_invitations_email_idx ON admin_invitations (lower(email));
CREATE INDEX IF NOT EXISTS admin_invitations_status_idx ON admin_invitations (status, expires_at DESC);
CREATE INDEX IF NOT EXISTS admin_invitations_invited_by_idx ON admin_invitations (invited_by);

ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_invitations_service_role ON admin_invitations;
CREATE POLICY admin_invitations_service_role ON admin_invitations FOR ALL USING (true) WITH CHECK (true);
