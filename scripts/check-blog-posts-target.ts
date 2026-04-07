/**
 * Verify public.blog_posts exists on a database (e.g. production before/after sync).
 * Uses TARGET_DATABASE_URL only — does not read DATABASE_URL (avoids accidental local checks).
 *
 *   TARGET_DATABASE_URL="postgresql://...prod..." pnpm exec tsx scripts/check-blog-posts-target.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const url = (process.env.TARGET_DATABASE_URL || "").trim();

async function main() {
  if (!url) {
    console.error("Set TARGET_DATABASE_URL to the production (or staging) Postgres URL.");
    process.exit(1);
  }

  let host = "unknown";
  try {
    host = new URL(url).hostname;
  } catch {
    /* ignore */
  }

  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    const [{ exists }] = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'blog_posts'
      ) AS exists
    `;
    let rowCount: number | null = null;
    if (exists) {
      const [r] = await sql`SELECT count(*)::int AS c FROM blog_posts`;
      rowCount = r.c;
    }
    console.log(
      JSON.stringify(
        {
          connectionHost: host,
          blog_posts_exists: exists,
          blog_posts_row_count: rowCount,
        },
        null,
        2,
      ),
    );
    if (!exists) {
      process.exitCode = 2;
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
