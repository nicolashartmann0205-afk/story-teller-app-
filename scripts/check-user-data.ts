/**
 * Check stories + credits for a user by email (uses .env.local DB).
 * Usage: pnpm exec tsx scripts/check-user-data.ts nicolas@hartmanns.net
 */
import { config } from "dotenv";
import { resolve } from "path";
import { count, eq, sql } from "drizzle-orm";
import postgres from "postgres";
import { stories, userCredits } from "../lib/db/schema";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const email = (process.argv[2] || "nicolas@hartmanns.net").trim().toLowerCase();
const url =
  process.env.POOLING_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  if (!url) {
    console.error("Set POOLING_DATABASE_URL or DATABASE_URL in .env.local");
    process.exit(1);
  }

  const sqlClient = postgres(url, { prepare: false, max: 1 });
  try {
    const users = await sqlClient`
      SELECT id, email FROM auth.users WHERE lower(email) = ${email} LIMIT 1
    `;
    const user = users[0];
    if (!user) {
      console.error(`No auth.users row for ${email}`);
      process.exit(1);
    }

    const [storyRow] = await sqlClient`
      SELECT count(*)::int AS c FROM public.stories WHERE user_id = ${user.id}
    `;
    const [creditRow] = await sqlClient`
      SELECT balance, monthly_free_quota FROM public.user_credits WHERE user_id = ${user.id}
    `;

    console.log(`User: ${user.email}`);
    console.log(`ID:   ${user.id}`);
    console.log(`Stories in DB: ${storyRow?.c ?? 0}`);
    console.log(
      `Credits: ${creditRow?.balance ?? "(no row)"} / quota ${creditRow?.monthly_free_quota ?? "—"}`,
    );
  } finally {
    await sqlClient.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
