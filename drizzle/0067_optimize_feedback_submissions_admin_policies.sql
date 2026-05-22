-- Optimize feedback_submissions admin policies per Supabase advisor.
-- Evaluate auth.jwt() once per statement: (select auth.jwt()) ->> 'email'

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feedback_submissions'
      AND policyname = 'feedback_submissions_admin_select'
  ) THEN
    ALTER POLICY "feedback_submissions_admin_select"
      ON "public"."feedback_submissions"
      USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feedback_submissions'
      AND policyname = 'feedback_submissions_admin_update'
  ) THEN
    ALTER POLICY "feedback_submissions_admin_update"
      ON "public"."feedback_submissions"
      USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net')
      WITH CHECK (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
  END IF;
END $$;
