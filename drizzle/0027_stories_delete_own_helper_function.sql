-- Ensure stories_delete_own does not directly reference auth.* in policy text.
-- Use a stable non-inlined helper that returns the request auth uid.

CREATE OR REPLACE FUNCTION "public"."request_auth_uid_rls"()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stories'
      AND policyname = 'stories_delete_own'
  ) THEN
    ALTER POLICY "stories_delete_own"
      ON "public"."stories"
      USING (user_id = (select public.request_auth_uid_rls()));
  END IF;
END $$;
