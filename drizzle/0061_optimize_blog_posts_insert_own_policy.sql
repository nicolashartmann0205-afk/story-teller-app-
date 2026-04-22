-- Optimize blog_posts_insert_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) in WITH CHECK.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'blog_posts'
      AND policyname = 'blog_posts_insert_own'
  ) THEN
    ALTER POLICY "blog_posts_insert_own"
      ON "public"."blog_posts"
      WITH CHECK (
        ((select auth.uid()) IS NOT NULL)
        AND (author_id = (select auth.uid()))
      );
  END IF;
END $$;
