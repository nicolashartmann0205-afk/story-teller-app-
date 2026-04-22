-- Optimize scenes_update_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) in USING/WITH CHECK EXISTS predicates.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scenes'
      AND policyname = 'scenes_update_own'
  ) THEN
    ALTER POLICY "scenes_update_own"
      ON "public"."scenes"
      USING (
        EXISTS (
          SELECT 1
          FROM public.stories s
          WHERE s.id = scenes.story_id
            AND s.user_id = (select auth.uid())
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.stories s
          WHERE s.id = scenes.story_id
            AND s.user_id = (select auth.uid())
        )
      );
  END IF;
END $$;
