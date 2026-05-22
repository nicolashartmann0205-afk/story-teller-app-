/**
 * Validate DATABASE_URL, POOLING_DATABASE_URL, and GEMINI_API_KEY.
 * Run: pnpm db:validate-env
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

function maskUrl(url: string): string {
  try {
    const u = new URL(url.replace(/^postgres(ql)?:/, "http:"));
    return `${u.hostname}${u.pathname ? u.pathname.split("/")[0] + "/…" : ""}`;
  } catch {
    return "(invalid url)";
  }
}

async function testDatabase(label: string, url: string | undefined): Promise<boolean> {
  if (!url?.trim()) {
    console.log(`  ${label}: not set`);
    return false;
  }
  const sql = postgres(url.trim(), { prepare: false, max: 1, connect_timeout: 10 });
  try {
    const [{ ok }] = await sql`SELECT 1 AS ok`;
    console.log(`  ${label}: OK (${maskUrl(url)})`);
    return ok === 1;
  } catch (error) {
    console.log(
      `  ${label}: FAIL (${maskUrl(url)}) — ${error instanceof Error ? error.message : error}`
    );
    return false;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function testGemini(key: string | undefined): Promise<boolean> {
  if (!key?.trim()) {
    console.log("  GEMINI_API_KEY: not set");
    return false;
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key.trim())}`
    );
    const body = (await res.json()) as { error?: { message?: string }; models?: unknown[] };
    if (body.error) {
      console.log(`  GEMINI_API_KEY: FAIL — ${body.error.message ?? "invalid key"}`);
      return false;
    }
    console.log(`  GEMINI_API_KEY: OK (${body.models?.length ?? 0} models)`);
    return true;
  } catch (error) {
    console.log(`  GEMINI_API_KEY: FAIL — ${error instanceof Error ? error.message : error}`);
    return false;
  }
}

async function main() {
  const pooling = process.env.POOLING_DATABASE_URL?.trim();
  const database = process.env.DATABASE_URL?.trim();
  const gemini = process.env.GEMINI_API_KEY?.trim();

  console.log("Environment validation\n");

  const poolOk = await testDatabase("POOLING_DATABASE_URL", pooling);
  const dbOk = pooling ? true : await testDatabase("DATABASE_URL", database);
  const geminiOk = await testGemini(gemini);

  const runtimeOk = poolOk || dbOk;
  console.log("");
  if (runtimeOk && geminiOk) {
    console.log("All required secrets are valid for local/production runtime.");
    if (!pooling && database) {
      console.log(
        "Tip: set POOLING_DATABASE_URL to the Supabase pooler URI (transaction mode, port 6543)."
      );
    }
    process.exit(0);
  }

  console.log("Fix missing or invalid variables in .env.local and Vercel → Settings → Environment Variables.");
  console.log("Vercel “Needs Attention” badges: rotate each secret, save, redeploy, then revoke the old key.");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
