/**
 * One-off: print drizzle migration rows + whether public.blog_posts exists.
 * Run: pnpm exec tsx scripts/check-db-state.ts
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

let host = "unknown";
try {
  host = new URL(url).hostname;
} catch {
  /* ignore */
}

async function main() {
  const sql = postgres(url, { prepare: false });
  try {
    const migrations = await sql`
      SELECT id, hash, created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY created_at
    `;
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
          usesPoolingFirst: !!(process.env.POOLING_DATABASE_URL || "").trim(),
          migrationCount: migrations.length,
          migrations: migrations.map((m) => ({
            id: Number(m.id),
            hashPrefix: String(m.hash).slice(0, 20) + "...",
            created_at: m.created_at,
          })),
          blog_posts_exists: exists,
          blog_posts_row_count: rowCount,
        },
        null,
        2,
      ),
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
