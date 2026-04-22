-- Optimize style_guides_insert_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) in WITH CHECK.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'style_guides'
      AND policyname = 'style_guides_insert_own'
  ) THEN
    ALTER POLICY "style_guides_insert_own"
      ON "public"."style_guides"
      WITH CHECK (user_id = (select auth.uid()));
  END IF;
END $$;
