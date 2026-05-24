/**
 * Check story/credit counts for a user email in the configured database.
 * Usage: pnpm exec tsx scripts/check-user-data.ts [email]
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const emailFilter = (process.argv[2] || "nicolas").trim();

async function main() {
  const url =
    process.env.POOLING_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("Set POOLING_DATABASE_URL or DATABASE_URL in .env.local");
    process.exit(1);
  }

  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    const [{ total_stories }] = await sql`
      SELECT count(*)::int AS total_stories FROM public.stories
    `;
    console.log(`Database host: ${new URL(url.replace(/^postgres(ql)?:/, "http:")).hostname}`);
    console.log(`Total stories in DB: ${total_stories}`);

    const users = await sql`
      SELECT
        u.id,
        u.email,
        (SELECT count(*)::int FROM public.stories s WHERE s.user_id = u.id) AS story_count,
        (SELECT balance FROM public.user_credits c WHERE c.user_id = u.id) AS credits
      FROM auth.users u
      WHERE u.email ILIKE ${"%" + emailFilter + "%"}
      ORDER BY story_count DESC
      LIMIT 10
    `;

    if (users.length === 0) {
      console.log(`No auth.users matching email filter: ${emailFilter}`);
    } else {
      console.log("\nMatching users:");
      for (const row of users) {
        console.log(
          `  ${row.email} | id=${row.id} | stories=${row.story_count} | credits=${row.credits ?? "none"}`
        );
      }
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
