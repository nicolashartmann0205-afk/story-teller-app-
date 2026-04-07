/**
 * Copy marketing blog rows from a source Postgres (e.g. local Supabase) to a target (e.g. production).
 * author_id is set to NULL on the target to avoid FK mismatches across projects.
 *
 * Usage:
 *   SOURCE_DATABASE_URL="postgresql://...local..." TARGET_DATABASE_URL="postgresql://...prod..." pnpm exec tsx scripts/sync-blog-posts.ts
 *   pnpm run db:sync-blog-posts   # TARGET_DATABASE_URL required; SOURCE defaults to POOLING_DATABASE_URL or DATABASE_URL
 *
 * Dry run (no writes):
 *   ... pnpm exec tsx scripts/sync-blog-posts.ts --dry-run
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const dryRun = process.argv.includes("--dry-run");

const sourceUrl =
  (process.env.SOURCE_DATABASE_URL || "").trim() ||
  (process.env.POOLING_DATABASE_URL || "").trim() ||
  (process.env.DATABASE_URL || "").trim();
const targetUrl = (process.env.TARGET_DATABASE_URL || "").trim();

type Row = {
  slug: string;
  title: string;
  description: string;
  content: string;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
};

async function main() {
  if (!sourceUrl) {
    console.error(
      "Set SOURCE_DATABASE_URL or POOLING_DATABASE_URL / DATABASE_URL (source dev DB).",
    );
    process.exit(1);
  }
  if (!targetUrl) {
    console.error(
      "Set TARGET_DATABASE_URL (production pooler or direct Postgres URL).",
    );
    process.exit(1);
  }
  if (sourceUrl === targetUrl) {
    console.error("SOURCE_DATABASE_URL and TARGET_DATABASE_URL must differ.");
    process.exit(1);
  }

  const source = postgres(sourceUrl, { prepare: false, max: 1 });
  const target = postgres(targetUrl, { prepare: false, max: 1 });

  try {
    const rows = await source<Row[]>`
      SELECT slug, title, description, content, published_at, created_at, updated_at
      FROM blog_posts
      ORDER BY published_at ASC
    `;

    if (rows.length === 0) {
      console.log("No rows in source blog_posts.");
      return;
    }

    console.log(`Found ${rows.length} post(s) in source.`);

    if (dryRun) {
      for (const r of rows) {
        console.log(`  [dry-run] ${r.slug} — ${r.title}`);
      }
      return;
    }

    for (const r of rows) {
      await target`
        INSERT INTO blog_posts (slug, title, description, content, published_at, author_id, created_at, updated_at)
        VALUES (
          ${r.slug},
          ${r.title},
          ${r.description},
          ${r.content},
          ${r.published_at},
          NULL,
          ${r.created_at},
          ${r.updated_at}
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          content = EXCLUDED.content,
          published_at = EXCLUDED.published_at,
          author_id = NULL,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      `;
      console.log(`  synced: ${r.slug}`);
    }

    console.log("Done.");
  } finally {
    await source.end({ timeout: 5 });
    await target.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
