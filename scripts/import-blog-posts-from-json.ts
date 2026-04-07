/**
 * Import blog posts from a JSON file (e.g. temp_blogs.json) into `blog_posts`.
 * Upserts by `slug` (same behavior as scripts/sync-blog-posts.ts).
 *
 * Prepare data locally (export from DB or API), save as JSON, then run against production:
 *
 *   TARGET_DATABASE_URL="postgresql://..." pnpm exec tsx scripts/import-blog-posts-from-json.ts
 *   pnpm run db:import-blog-json
 *
 * Default input path: ./temp_blogs.json (override: first CLI arg)
 *
 * Accepted JSON shapes:
 *   - [ { "slug", "title", "description", "content", "publishedAt" | "published_at" }, ... ]
 *   - { "posts": [ ... ] }
 *
 * Optional fields: author_id | authorId (UUID; set null if missing/invalid for cross-env safety)
 *
 * Flags: --dry-run (parse + print, no DB writes)
 */
import { config } from "dotenv";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const dryRun = process.argv.includes("--dry-run");
const positional = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const filePath = resolve(process.cwd(), positional[0] ?? "temp_blogs.json");

const dbUrl =
  (process.env.TARGET_DATABASE_URL || "").trim() ||
  (process.env.POOLING_DATABASE_URL || "").trim() ||
  (process.env.DATABASE_URL || "").trim();

type Raw = Record<string, unknown>;

function str(r: Raw, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function parsePublishedAt(r: Raw): Date {
  const s = str(r, "publishedAt", "published_at");
  if (!s) return new Date();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function parseAuthorId(r: Raw): string | null {
  const s = str(r, "authorId", "author_id");
  if (!s) return null;
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRe.test(s) ? s : null;
}

function normalizeRows(parsed: unknown): Raw[] {
  if (Array.isArray(parsed)) return parsed as Raw[];
  if (parsed && typeof parsed === "object" && "posts" in parsed && Array.isArray((parsed as { posts: unknown }).posts)) {
    return (parsed as { posts: Raw[] }).posts;
  }
  throw new Error('JSON must be an array of posts or { "posts": [...] }');
}

function toRow(r: Raw) {
  const slug = str(r, "slug");
  const title = str(r, "title");
  const description = str(r, "description") || "";
  const content = str(r, "content") || "";
  const publishedAt = parsePublishedAt(r);
  const authorId = parseAuthorId(r);
  return { slug, title, description, content, publishedAt, authorId };
}

async function main() {
  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.error("Copy temp_blogs.example.json to temp_blogs.json and add your export.");
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error("Invalid JSON:", e);
    process.exit(1);
  }

  const rawRows = normalizeRows(parsed);
  const rows = rawRows.map(toRow).filter((row) => row.slug && row.title);

  if (rows.length === 0) {
    console.error("No valid rows (need slug + title per post).");
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] Would upsert ${rows.length} post(s) from ${filePath}:`);
    for (const r of rows) {
      console.log(`  - ${r.slug} — ${r.title}`);
    }
    return;
  }

  if (!dbUrl) {
    console.error("Set TARGET_DATABASE_URL or POOLING_DATABASE_URL / DATABASE_URL.");
    process.exit(1);
  }

  const sql = postgres(dbUrl, { prepare: false, max: 1 });
  const now = new Date();

  try {
    for (const r of rows) {
      await sql`
        INSERT INTO blog_posts (slug, title, description, content, published_at, author_id, created_at, updated_at)
        VALUES (
          ${r.slug},
          ${r.title},
          ${r.description},
          ${r.content},
          ${r.publishedAt},
          ${r.authorId},
          ${now},
          ${now}
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          content = EXCLUDED.content,
          published_at = EXCLUDED.published_at,
          author_id = EXCLUDED.author_id,
          updated_at = EXCLUDED.updated_at
      `;
      console.log(`  upserted: ${r.slug}`);
    }
    console.log(`Done. ${rows.length} post(s).`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
