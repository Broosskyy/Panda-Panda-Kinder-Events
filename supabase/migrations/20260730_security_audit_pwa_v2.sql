-- Security / Audit / PWA V2: enriched client context on audit + login history

ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS device_label text;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS os_label text;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS browser_label text;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE admin_login_history ADD COLUMN IF NOT EXISTS role_slug text;
ALTER TABLE admin_login_history ADD COLUMN IF NOT EXISTS ip_masked text;
ALTER TABLE admin_login_history ADD COLUMN IF NOT EXISTS country_code text;
ALTER TABLE admin_login_history ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE admin_login_history ADD COLUMN IF NOT EXISTS city text;

CREATE INDEX IF NOT EXISTS admin_login_history_success_idx ON admin_login_history (success, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_login_history_ip_masked_idx ON admin_login_history (ip_masked);
