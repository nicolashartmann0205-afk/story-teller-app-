-- Optimize blog_posts_delete_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) in USING.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_posts'
      AND policyname = 'blog_posts_delete_own'
  ) THEN
    ALTER POLICY "blog_posts_delete_own"
      ON "public"."blog_posts"
      USING (author_id = (select auth.uid()));
  END IF;
END $$;
