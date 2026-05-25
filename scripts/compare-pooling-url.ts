/**
 * Compare local POOLING_DATABASE_URL shape vs what Vercel needs.
 * Run: pnpm db:compare-pooling-url
 */
import { config } from "dotenv";
import { resolve } from "path";
import {
  diagnosePostgresUrl,
  diagnoseRepairedPostgresUrl,
  repairPostgresConnectionUrl,
} from "../lib/db/normalize-database-url";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const raw = process.env.POOLING_DATABASE_URL;
const repaired = repairPostgresConnectionUrl(raw);

function safeUser(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const at = url.lastIndexOf("@");
  if (at < 0) return undefined;
  const userinfo = url.slice(url.indexOf("://") + 3, at);
  return userinfo.split(":")[0];
}

console.log("Local POOLING_DATABASE_URL checklist\n");
console.log(`  Raw length:        ${raw?.length ?? 0} (expect ~110)`);
console.log(`  Repaired length:   ${repaired?.length ?? 0}`);
console.log(`  Raw user:          ${safeUser(raw) ?? "(missing)"}`);
console.log(`  Repaired user:     ${safeUser(repaired) ?? "(missing)"}`);
console.log(`  Raw port:          ${diagnosePostgresUrl(raw).port ?? "(missing)"}`);
console.log(`  Repaired port:     ${diagnoseRepairedPostgresUrl(raw).port ?? "(missing)"}`);
console.log(`  Raw issues:        ${diagnosePostgresUrl(raw).poolerIssues.join(", ") || "none"}`);
console.log(`  Repaired issues:   ${diagnoseRepairedPostgresUrl(raw).poolerIssues.join(", ") || "none"}`);
console.log(`  NEXT_PUBLIC_SUPABASE_URL set: ${Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)}`);

if (!repaired) {
  console.log("\n❌ Local POOLING_DATABASE_URL is invalid. Fix .env.local first.");
  process.exit(1);
}

if ((raw?.length ?? 0) < 100) {
  console.log("\n⚠️  URL looks too short — may be truncated.");
}

console.log("\nPaste the REPAIRED value into Vercel (pnpm db:copy-env-vercel pooling copies raw local value).");
console.log("After saving on Vercel, redeploy Production, then open /api/health/db");
