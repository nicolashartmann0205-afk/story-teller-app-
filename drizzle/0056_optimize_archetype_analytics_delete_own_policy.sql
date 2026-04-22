-- Optimize archetype_analytics_delete_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) across full USING predicate.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'archetype_analytics'
      AND policyname = 'archetype_analytics_delete_own'
  ) THEN
    ALTER POLICY "archetype_analytics_delete_own"
      ON "public"."archetype_analytics"
      USING (
        (
          story_id IS NULL
          AND user_id = (select auth.uid())
        )
        OR (
          story_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.stories s
            WHERE s.id = archetype_analytics.story_id
              AND s.user_id = (select auth.uid())
          )
        )
      );
  END IF;
END $$;
