-- Optimize story_maps_update_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) in USING and WITH CHECK.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'story_maps'
      AND policyname = 'story_maps_update_own'
  ) THEN
    ALTER POLICY "story_maps_update_own"
      ON "public"."story_maps"
      USING (user_id = (select auth.uid()))
      WITH CHECK (user_id = (select auth.uid()));
  END IF;
END $$;
