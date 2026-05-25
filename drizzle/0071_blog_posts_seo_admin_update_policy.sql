-- Site owner can update blog SEO fields via PostgREST when Postgres pooler fails.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'blog_posts_seo_admin_update'
  ) THEN
    CREATE POLICY "blog_posts_seo_admin_update"
      ON "public"."blog_posts"
      FOR UPDATE
      USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net')
      WITH CHECK (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
  END IF;
END $$;
