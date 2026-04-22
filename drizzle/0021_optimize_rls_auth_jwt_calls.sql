-- Optimize RLS policy expressions by evaluating auth.jwt() once per statement.
-- Rewrites all public-schema policy expressions from auth.jwt() to (select auth.jwt()).

DO $$
DECLARE
  policy_record RECORD;
  new_using text;
  new_with_check text;
  alter_sql text;
BEGIN
  FOR policy_record IN
    SELECT
      schemaname,
      tablename,
      policyname,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        COALESCE(qual, '') LIKE '%auth.jwt()%'
        OR COALESCE(with_check, '') LIKE '%auth.jwt()%'
      )
  LOOP
    new_using := CASE
      WHEN policy_record.qual IS NULL THEN NULL
      ELSE replace(policy_record.qual, 'auth.jwt()', '(select auth.jwt())')
    END;

    new_with_check := CASE
      WHEN policy_record.with_check IS NULL THEN NULL
      ELSE replace(policy_record.with_check, 'auth.jwt()', '(select auth.jwt())')
    END;

    alter_sql := format(
      'ALTER POLICY %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );

    IF new_using IS NOT NULL THEN
      alter_sql := alter_sql || format(' USING (%s)', new_using);
    END IF;

    IF new_with_check IS NOT NULL THEN
      alter_sql := alter_sql || format(' WITH CHECK (%s)', new_with_check);
    END IF;

    EXECUTE alter_sql;
  END LOOP;
END $$;
