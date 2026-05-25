/**
 * Copy env values from .env.local to clipboard for pasting into Vercel.
 * Usage:
 *   pnpm exec tsx scripts/copy-env-for-vercel.ts pooling
 *   pnpm exec tsx scripts/copy-env-for-vercel.ts database
 *   pnpm exec tsx scripts/copy-env-for-vercel.ts gemini
 *   pnpm exec tsx scripts/copy-env-for-vercel.ts all
 */
import { execSync } from "child_process";
import { config } from "dotenv";
import { resolve } from "path";
import {
  getPoolerUrlIssues,
  repairPostgresConnectionUrl,
} from "../lib/db/normalize-database-url";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const STEPS = {
  pooling: {
    envKey: "POOLING_DATABASE_URL",
    vercelName: "POOLING_DATABASE_URL",
    hint: "Supabase Transaction pooler (port 6543). Mark Sensitive. Apply to Production + Preview.",
  },
  database: {
    envKey: "DATABASE_URL",
    vercelName: "DATABASE_URL",
    hint: "Same pooler URI is OK for now, or use Supabase Direct (5432) for migrations fallback.",
  },
  gemini: {
    envKey: "GEMINI_API_KEY",
    vercelName: "GEMINI_API_KEY",
    hint: "Google AI Studio API key. Mark Sensitive. Apply to Production + Preview.",
  },
} as const;

type StepKey = keyof typeof STEPS;

function copyToClipboard(text: string) {
  if (process.platform === "darwin") {
    execSync("pbcopy", { input: text });
    return true;
  }
  return false;
}

function runStep(key: StepKey) {
  const step = STEPS[key];
  const value =
    step.envKey === "POOLING_DATABASE_URL" || step.envKey === "DATABASE_URL"
      ? repairPostgresConnectionUrl(process.env[step.envKey])
      : (process.env[step.envKey] || "").trim();
  if (!value) {
    console.error(`Missing or invalid ${step.envKey} in .env.local`);
    process.exit(1);
  }
  if (step.envKey === "POOLING_DATABASE_URL") {
    const issues = getPoolerUrlIssues(value);
    if (issues.includes("wrong_port_session_pooler")) {
      console.error("POOLING_DATABASE_URL must use Transaction pooler port 6543, not Session pooler 5432.");
      process.exit(1);
    }
  }

  const copied = copyToClipboard(value);
  console.log(`\n=== ${step.vercelName} ===`);
  console.log(step.hint);
  console.log(`Length: ${value.length} characters`);
  if (copied) {
    console.log("Copied to clipboard (macOS). Paste into Vercel → Edit → Value → Save.");
  } else {
    console.log("Copy the value from .env.local manually (pbcopy not available).");
  }
  console.log("Vercel path: Project story-teller-app → Settings → Environment Variables");
  console.log(`Edit "${step.vercelName}" → paste → Sensitive → Production + Preview → Save`);
  console.log("Then: Deployments → Redeploy latest Production (required after any env change).\n");
}

const arg = (process.argv[2] || "all").toLowerCase();

if (arg === "all") {
  for (const key of Object.keys(STEPS) as StepKey[]) {
    runStep(key);
    console.log("---");
  }
  console.log("After all three are saved: Deployments → Redeploy latest Production.");
} else if (arg in STEPS) {
  runStep(arg as StepKey);
} else {
  console.error("Usage: copy-env-for-vercel.ts [pooling|database|gemini|all]");
  process.exit(1);
}
