-- Optimize stories_delete_own RLS predicate per Supabase advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) so it is evaluated once per statement.

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
      USING (user_id = (select auth.uid()));
  END IF;
END $$;
