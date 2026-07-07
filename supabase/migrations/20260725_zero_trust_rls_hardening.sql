-- Zero Trust Release: deny direct anon/authenticated access to sensitive admin tables
-- Service role (API routes) retains full access via bypassing RLS

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'admin_users',
    'admin_sessions',
    'admin_password_resets',
    'admin_backup_codes',
    'admin_security_settings',
    'admin_login_history',
    'admin_audit_log',
    'email_logs',
    'email_aliases',
    'email_drafts',
    'email_templates'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_service', tbl);
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', tbl || '_service', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_deny_public', tbl);
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)', tbl || '_deny_public', tbl);
  END LOOP;
END $$;
