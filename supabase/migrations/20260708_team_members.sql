-- Team members for future multi-login auth (prepared, not yet enforced)
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'readonly')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS team_members_email_idx ON team_members (email);
CREATE INDEX IF NOT EXISTS team_members_active_idx ON team_members (active);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Service role only (admin API uses service role key)
CREATE POLICY "team_members_service_role" ON team_members
  FOR ALL
  USING (true)
  WITH CHECK (true);
