/**
 * Reset a user's balance to the full daily allowance (140).
 * Run: pnpm db:reset-user-credits nicolas@hartmanns.net
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";
import { DAILY_FREE_QUOTA } from "../lib/credits/service";

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
    const [user] = await sql`
      SELECT id, email FROM auth.users WHERE lower(email) = lower(${email})
    `;
    if (!user) {
      console.error(`No auth user for ${email}`);
      process.exit(1);
    }

    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);

    await sql`
      INSERT INTO public.user_credits (user_id, balance, monthly_free_quota, monthly_used, period_start, updated_at)
      VALUES (${user.id}, ${DAILY_FREE_QUOTA}, ${DAILY_FREE_QUOTA}, 0, ${dayStart}, now())
      ON CONFLICT (user_id) DO UPDATE SET
        balance = ${DAILY_FREE_QUOTA},
        monthly_free_quota = ${DAILY_FREE_QUOTA},
        monthly_used = 0,
        period_start = ${dayStart},
        updated_at = now()
    `;

    const [row] = await sql`
      SELECT balance, monthly_free_quota FROM public.user_credits WHERE user_id = ${user.id}
    `;
    console.log(
      `Reset ${user.email} → balance ${row.balance}/${row.monthly_free_quota} (daily max ${DAILY_FREE_QUOTA})`
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
