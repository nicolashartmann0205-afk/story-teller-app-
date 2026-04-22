-- Enable RLS for public.blog_posts and allow public reads.
-- Writes are limited to the authenticated author_id owner.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'blog_posts'
        AND policyname = 'blog_posts_public_select'
    ) THEN
      CREATE POLICY "blog_posts_public_select"
        ON "public"."blog_posts"
        FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'blog_posts'
        AND policyname = 'blog_posts_insert_own'
    ) THEN
      CREATE POLICY "blog_posts_insert_own"
        ON "public"."blog_posts"
        FOR INSERT
        WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'blog_posts'
        AND policyname = 'blog_posts_update_own'
    ) THEN
      CREATE POLICY "blog_posts_update_own"
        ON "public"."blog_posts"
        FOR UPDATE
        USING (author_id = auth.uid())
        WITH CHECK (author_id = auth.uid());
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'blog_posts'
        AND policyname = 'blog_posts_delete_own'
    ) THEN
      CREATE POLICY "blog_posts_delete_own"
        ON "public"."blog_posts"
        FOR DELETE
        USING (author_id = auth.uid());
    END IF;
  END IF;
END $$;
