-- Optimize style_guides_select_own predicate per Supabase advisor recommendation.
-- Replace auth.uid() with (select auth.uid()).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'style_guides'
      AND policyname = 'style_guides_select_own'
  ) THEN
    ALTER POLICY "style_guides_select_own"
      ON "public"."style_guides"
      USING (user_id = (select auth.uid()));
  END IF;
END $$;
