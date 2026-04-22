-- Batch optimize public *_delete_own RLS predicates.
-- Rewrites auth.uid() to (select auth.uid()) in USING/WITH CHECK.

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
      AND policyname LIKE '%_delete_own'
      AND (
        COALESCE(qual, '') LIKE '%auth.uid()%'
        OR COALESCE(with_check, '') LIKE '%auth.uid()%'
      )
  LOOP
    new_using := CASE
      WHEN policy_record.qual IS NULL THEN NULL
      ELSE replace(policy_record.qual, 'auth.uid()', '(select auth.uid())')
    END;

    new_with_check := CASE
      WHEN policy_record.with_check IS NULL THEN NULL
      ELSE replace(policy_record.with_check, 'auth.uid()', '(select auth.uid())')
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
