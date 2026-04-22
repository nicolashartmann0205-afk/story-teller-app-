-- Optimize story_maps_insert_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) in WITH CHECK.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'story_maps'
      AND policyname = 'story_maps_insert_own'
  ) THEN
    ALTER POLICY "story_maps_insert_own"
      ON "public"."story_maps"
      WITH CHECK (user_id = (select auth.uid()));
  END IF;
END $$;
