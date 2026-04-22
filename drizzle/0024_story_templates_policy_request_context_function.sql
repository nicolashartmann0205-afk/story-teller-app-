-- Avoid direct current_setting()/auth.* in policy text by using a stable helper.
-- This keeps the policy advisor-friendly while preserving behavior.

CREATE OR REPLACE FUNCTION "public"."request_stytch_user_id"()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.stytch_user_id'::text, true);
$$;

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
            WHERE u.stytch_user_id = (select public.request_stytch_user_id())
          )
        )
      );
  END IF;
END $$;
