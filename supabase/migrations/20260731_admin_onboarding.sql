-- Per-user admin onboarding completion timestamp
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

CREATE INDEX IF NOT EXISTS admin_users_onboarding_completed_idx
  ON admin_users (onboarding_completed_at);
