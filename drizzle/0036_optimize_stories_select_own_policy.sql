-- Optimize stories_select_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stories'
      AND policyname = 'stories_select_own'
  ) THEN
    ALTER POLICY "stories_select_own"
      ON "public"."stories"
      USING (user_id = (select auth.uid()));
  END IF;
END $$;
