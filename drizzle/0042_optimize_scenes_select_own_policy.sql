-- Optimize scenes_select_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) inside EXISTS predicate.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scenes'
      AND policyname = 'scenes_select_own'
  ) THEN
    ALTER POLICY "scenes_select_own"
      ON "public"."scenes"
      USING (
        EXISTS (
          SELECT 1
          FROM public.stories s
          WHERE s.id = scenes.story_id
            AND s.user_id = (select auth.uid())
        )
      );
  END IF;
END $$;
