-- Optimize blog_posts_update_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) in USING and WITH CHECK.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_posts'
      AND policyname = 'blog_posts_update_own'
  ) THEN
    ALTER POLICY "blog_posts_update_own"
      ON "public"."blog_posts"
      USING (author_id = (select auth.uid()))
      WITH CHECK (author_id = (select auth.uid()));
  END IF;
END $$;
