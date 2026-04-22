-- Optimize structure_analytics_insert_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) across full WITH CHECK predicate.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'structure_analytics'
      AND policyname = 'structure_analytics_insert_own'
  ) THEN
    ALTER POLICY "structure_analytics_insert_own"
      ON "public"."structure_analytics"
      WITH CHECK (
        (
          story_id IS NULL
          AND user_id = (select auth.uid())
        )
        OR (
          story_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.stories s
            WHERE s.id = structure_analytics.story_id
              AND s.user_id = (select auth.uid())
          )
        )
      );
  END IF;
END $$;
