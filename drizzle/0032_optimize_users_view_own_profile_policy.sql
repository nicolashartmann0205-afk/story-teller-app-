-- Optimize users profile read policy to avoid per-row current_setting() evaluation.
-- Supabase advisor recommends wrapping request-context functions in SELECT.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can view own profile'
  ) THEN
    ALTER POLICY "Users can view own profile"
      ON "public"."users"
      USING (
        stytch_user_id = (
          select current_setting('app.stytch_user_id'::text, true)
        )
      );
  END IF;
END $$;
