-- Optimize stories_insert_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) in WITH CHECK.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stories'
      AND policyname = 'stories_insert_own'
  ) THEN
    ALTER POLICY "stories_insert_own"
      ON "public"."stories"
      WITH CHECK (user_id = (select auth.uid()));
  END IF;
END $$;
