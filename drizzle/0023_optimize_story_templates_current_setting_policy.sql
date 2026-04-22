-- Optimize per-row current_setting() usage in story_templates RLS policy.
-- Supabase advisor flags current_setting/auth function calls when evaluated per row.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'story_templates'
      AND policyname = 'Users can view public templates'
  ) THEN
    ALTER POLICY "Users can view public templates"
      ON "public"."story_templates"
      USING (
        (is_public = true)
        OR (
          created_by IN (
            SELECT u.id
            FROM public.users u
            WHERE u.stytch_user_id = (select current_setting('app.stytch_user_id'::text, true))
          )
        )
      );
  END IF;
END $$;
