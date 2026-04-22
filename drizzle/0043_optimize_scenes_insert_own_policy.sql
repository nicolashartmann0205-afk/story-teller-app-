-- Optimize scenes_insert_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) inside WITH CHECK EXISTS predicate.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scenes'
      AND policyname = 'scenes_insert_own'
  ) THEN
    ALTER POLICY "scenes_insert_own"
      ON "public"."scenes"
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
