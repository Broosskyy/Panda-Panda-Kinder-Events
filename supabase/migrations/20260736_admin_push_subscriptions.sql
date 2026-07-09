-- Admin PWA Web Push subscriptions (per user, per device endpoint)

CREATE TABLE IF NOT EXISTS admin_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_push_subscriptions_endpoint_uidx
  ON admin_push_subscriptions (endpoint);

CREATE INDEX IF NOT EXISTS admin_push_subscriptions_user_active_idx
  ON admin_push_subscriptions (user_id)
  WHERE revoked_at IS NULL;

ALTER TABLE admin_push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_push_subscriptions_service ON admin_push_subscriptions;
CREATE POLICY admin_push_subscriptions_service ON admin_push_subscriptions
  FOR ALL USING (true) WITH CHECK (true);
