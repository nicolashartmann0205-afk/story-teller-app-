ALTER TABLE "blog_posts"
  ADD COLUMN IF NOT EXISTS "seo_title" text;

ALTER TABLE "blog_posts"
  ADD COLUMN IF NOT EXISTS "meta_description" text;

ALTER TABLE "blog_posts"
  ADD COLUMN IF NOT EXISTS "canonical_url" text;
