-- Zero Trust Release: deny direct anon/authenticated access to sensitive admin tables.
-- Service role (API routes) retains full access via bypassing RLS.
--
-- Idempotent: checks information_schema before every ALTER/DROP/CREATE.
-- Missing tables are skipped — the script never aborts on absent relations.

DO $$
DECLARE
  candidate_tables text[] := ARRAY[
    'admin_users',
    'admin_sessions',
    'admin_password_resets',
    'admin_backup_codes',
    'admin_security_settings',
    'admin_login_history',
    'admin_audit_logs',
    'email_logs',
    'email_aliases',
    'email_drafts',
    'email_templates'
  ];
  tbl text;
  table_exists boolean;
  service_policy text;
  deny_policy text;
  found_tables text[] := ARRAY[]::text[];
  skipped_tables text[] := ARRAY[]::text[];
  updated_policies text[] := ARRAY[]::text[];
BEGIN
  FOREACH tbl IN ARRAY candidate_tables
  LOOP
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = tbl
        AND table_type = 'BASE TABLE'
    ) INTO table_exists;

    IF NOT table_exists THEN
      skipped_tables := array_append(skipped_tables, tbl);
      CONTINUE;
    END IF;

    found_tables := array_append(found_tables, tbl);

    BEGIN
      EXECUTE format(
        'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
        'public',
        tbl
      );

      service_policy := tbl || '_service';
      deny_policy := tbl || '_deny_public';

      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON %I.%I',
        service_policy,
        'public',
        tbl
      );
      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON %I.%I',
        deny_policy,
        'public',
        tbl
      );

      EXECUTE format(
        'CREATE POLICY %I ON %I.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        service_policy,
        'public',
        tbl
      );
      updated_policies := array_append(updated_policies, service_policy);

      EXECUTE format(
        'CREATE POLICY %I ON %I.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
        deny_policy,
        'public',
        tbl
      );
      updated_policies := array_append(updated_policies, deny_policy);

    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Warnung: Tabelle % konnte nicht vollständig verarbeitet werden (%). Übersprungen.', tbl, SQLERRM;
        skipped_tables := array_append(skipped_tables, tbl || ' (Fehler: ' || SQLERRM || ')');
        found_tables := array_remove(found_tables, tbl);
    END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== RLS Zero Trust Hardening — Abschlussbericht ===';
  RAISE NOTICE 'Gefundene Tabellen (%): %',
    COALESCE(array_length(found_tables, 1), 0),
    COALESCE(array_to_string(found_tables, ', '), '(keine)');
  RAISE NOTICE 'Übersprungene Tabellen (%): %',
    COALESCE(array_length(skipped_tables, 1), 0),
    COALESCE(array_to_string(skipped_tables, ', '), '(keine)');
  RAISE NOTICE 'Policies erstellt/aktualisiert (%): %',
    COALESCE(array_length(updated_policies, 1), 0),
    COALESCE(array_to_string(updated_policies, ', '), '(keine)');
  RAISE NOTICE '==================================================';
END $$;
