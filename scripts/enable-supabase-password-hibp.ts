/**
 * Enable HaveIBeenPwned leaked-password protection on a Supabase project.
 *
 * Requires:
 * - SUPABASE_ACCESS_TOKEN (Personal Access Token from https://supabase.com/dashboard/account/tokens)
 * - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL (used to derive project ref)
 *
 * Run: pnpm db:enable-password-hibp
 *
 * Note: Leaked password protection requires a Supabase plan that includes the password_hibp entitlement (Pro+).
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

function getProjectRef(): string {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).trim();
  if (!url) {
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
  }
  const hostname = new URL(url).hostname;
  const ref = hostname.split(".")[0];
  if (!ref) {
    throw new Error(`Could not parse project ref from Supabase URL: ${url}`);
  }
  return ref;
}

async function main() {
  const token = (process.env.SUPABASE_ACCESS_TOKEN || "").trim();
  if (!token) {
    console.error(
      "SUPABASE_ACCESS_TOKEN is required.\n" +
        "Create one at https://supabase.com/dashboard/account/tokens and add it to .env.local"
    );
    process.exit(1);
  }

  const projectRef = getProjectRef();
  const base = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const getRes = await fetch(base, { headers });
  if (!getRes.ok) {
    const body = await getRes.text();
    throw new Error(`GET auth config failed (${getRes.status}): ${body}`);
  }

  const current = (await getRes.json()) as { password_hibp_enabled?: boolean };
  console.log(`Project: ${projectRef}`);
  console.log(`Current password_hibp_enabled: ${current.password_hibp_enabled ?? "unknown"}`);

  if (current.password_hibp_enabled === true) {
    console.log("HaveIBeenPwned protection is already enabled.");
    return;
  }

  const patchRes = await fetch(base, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ password_hibp_enabled: true }),
  });

  if (!patchRes.ok) {
    const body = await patchRes.text();
    throw new Error(
      `PATCH auth config failed (${patchRes.status}): ${body}\n` +
        "If your project is on the Free plan, upgrade to Pro or enable the setting in the dashboard."
    );
  }

  const updated = (await patchRes.json()) as { password_hibp_enabled?: boolean };
  console.log(`Updated password_hibp_enabled: ${updated.password_hibp_enabled}`);
  console.log("Done. Re-run Supabase Security Advisor to confirm the warning is cleared.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
