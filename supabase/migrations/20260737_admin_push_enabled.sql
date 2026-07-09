-- Add enabled flag for admin push subscriptions (soft disable without delete)

ALTER TABLE admin_push_subscriptions
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS admin_push_subscriptions_enabled_active_idx
  ON admin_push_subscriptions (user_id)
  WHERE enabled = true AND revoked_at IS NULL;
