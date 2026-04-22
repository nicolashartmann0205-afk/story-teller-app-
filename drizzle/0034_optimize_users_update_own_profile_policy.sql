-- Optimize users update-own-profile policy to avoid per-row function evaluation.
-- Wrap current_setting() in SELECT for USING + WITH CHECK.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can update own profile'
  ) THEN
    ALTER POLICY "Users can update own profile"
      ON "public"."users"
      USING (
        stytch_user_id = (
          select current_setting('app.stytch_user_id'::text, true)
        )
      )
      WITH CHECK (
        stytch_user_id = (
          select current_setting('app.stytch_user_id'::text, true)
        )
      );
  END IF;
END $$;
