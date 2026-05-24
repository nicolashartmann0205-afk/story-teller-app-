/**
 * Print story + credit counts for a user email (sanity check for prod DB).
 * Run: pnpm exec tsx scripts/check-user-stories.ts nicolas@hartmanns.net
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const email = (process.argv[2] || "nicolas@hartmanns.net").trim();
const url =
  (process.env.POOLING_DATABASE_URL || "").trim() ||
  (process.env.DATABASE_URL || "").trim();

if (!url) {
  console.error("Set POOLING_DATABASE_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

async function main() {
  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    const users = await sql`
      SELECT
        u.id,
        u.email,
        (SELECT count(*)::int FROM public.stories s WHERE s.user_id = u.id) AS story_count,
        (SELECT balance FROM public.user_credits uc WHERE uc.user_id = u.id) AS credits
      FROM auth.users u
      WHERE lower(u.email) = lower(${email})
    `;
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM public.stories`;
    console.log(JSON.stringify({ email, users, totalStoriesInDb: total }, null, 2));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
