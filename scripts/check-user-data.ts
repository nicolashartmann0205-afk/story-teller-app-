/**
 * Check story/credit counts for a user email in the configured database.
 * Usage: pnpm exec tsx scripts/check-user-data.ts nicolas@hartmanns.net
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const email = (process.argv[2] || "nicolas@hartmanns.net").trim().toLowerCase();
  const url = process.env.POOLING_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("Set POOLING_DATABASE_URL or DATABASE_URL in .env.local");
    process.exit(1);
  }

  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    const host = new URL(url.replace(/^postgres(ql)?:/, "http:")).hostname;
    console.log(`Database host: ${host}\n`);

    const users = await sql`SELECT id, email, created_at FROM auth.users WHERE lower(email) = ${email}`;
    if (users.length === 0) {
      console.log(`No auth.users row for ${email}`);
      return;
    }

    for (const u of users) {
      console.log(`User: ${u.email}`);
      console.log(`  id: ${u.id}`);
      const [{ storyCount }] = await sql`
        SELECT count(*)::int AS "storyCount" FROM public.stories WHERE user_id = ${u.id}
      `;
      const credits = await sql`
        SELECT balance, monthly_free_quota, monthly_used, period_start
        FROM public.user_credits WHERE user_id = ${u.id}
      `;
      console.log(`  stories: ${storyCount}`);
      console.log(`  credits:`, credits[0] ?? "(no user_credits row)");
    }
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
