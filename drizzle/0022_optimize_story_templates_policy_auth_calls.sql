-- Optimize auth.*() calls in story_templates RLS policy predicates.
-- This specifically targets the Supabase warning for:
-- "Users can view public templates"
-- by rewriting auth.<function>() to (select auth.<function>()).

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
      AND tablename = 'story_templates'
      AND policyname = 'Users can view public templates'
      AND (
        COALESCE(qual, '') ~ 'auth\\.[a-z_]+\\(\\)'
        OR COALESCE(with_check, '') ~ 'auth\\.[a-z_]+\\(\\)'
      )
  LOOP
    new_using := CASE
      WHEN policy_record.qual IS NULL THEN NULL
      ELSE regexp_replace(
        policy_record.qual,
        'auth\\.([a-z_]+)\\(\\)',
        '(select auth.\1())',
        'g'
      )
    END;

    new_with_check := CASE
      WHEN policy_record.with_check IS NULL THEN NULL
      ELSE regexp_replace(
        policy_record.with_check,
        'auth\\.([a-z_]+)\\(\\)',
        '(select auth.\1())',
        'g'
      )
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
