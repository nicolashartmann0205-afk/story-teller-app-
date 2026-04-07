/**
 * Creates public.blog_posts if missing (repair drift vs drizzle.__drizzle_migrations).
 * Run: pnpm exec tsx scripts/apply-blog-posts-table.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const url =
  (process.env.POOLING_DATABASE_URL || "").trim() ||
  (process.env.DATABASE_URL || "").trim();

if (!url) {
  console.error("No POOLING_DATABASE_URL or DATABASE_URL");
  process.exit(1);
}

async function main() {
  const sql = postgres(url, { prepare: false });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "slug" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "content" text NOT NULL,
        "published_at" timestamp with time zone NOT NULL,
        "author_id" uuid,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
      )
    `;
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_author_id_users_id_fk'
        ) THEN
          ALTER TABLE "blog_posts"
            ADD CONSTRAINT "blog_posts_author_id_users_id_fk"
            FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id")
            ON DELETE set null ON UPDATE no action;
        END IF;
      END $$
    `;
    console.log("blog_posts table ensured.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
