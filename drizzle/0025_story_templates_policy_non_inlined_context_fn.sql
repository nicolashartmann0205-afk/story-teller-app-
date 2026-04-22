-- Use a non-inlined helper function for request context in RLS policy predicates.
-- SQL-language helper functions may be inlined back to current_setting(...).

CREATE OR REPLACE FUNCTION "public"."request_stytch_user_id_rls"()
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN current_setting('app.stytch_user_id'::text, true);
END;
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
            WHERE u.stytch_user_id = (select public.request_stytch_user_id_rls())
          )
        )
      );
  END IF;
END $$;
