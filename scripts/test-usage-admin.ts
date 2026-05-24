/**
 * Sanity-check admin usage metrics against the configured database.
 * Run: pnpm db:test-usage-admin
 */
import { config } from "dotenv";
import { resolve } from "path";
import { getAdminUsageStats, getRecentSignups } from "../lib/admin/usage-queries";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const stats = await getAdminUsageStats();
  const signups = await getRecentSignups(5);
  console.log(JSON.stringify({ stats, recentSignups: signups }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
