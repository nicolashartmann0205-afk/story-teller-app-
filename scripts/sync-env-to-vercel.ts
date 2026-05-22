/**
 * Push database + Gemini env vars from .env.local to Vercel (Production + Preview).
 *
 * Prerequisites:
 *   1. Create a token: https://vercel.com/account/tokens
 *   2. Add to .env.local: VERCEL_TOKEN=...
 *   3. Optional: VERCEL_PROJECT_NAME=story-teller-app- (default)
 *
 * Usage:
 *   pnpm db:sync-env-vercel
 *   pnpm db:sync-env-vercel --deploy   # also trigger a Production redeploy
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const PROJECT_NAME = (process.env.VERCEL_PROJECT_NAME || "story-teller-app-").trim();
const VERCEL_TOKEN = (process.env.VERCEL_TOKEN || "").trim();
const SHOULD_DEPLOY = process.argv.includes("--deploy");

const ENV_KEYS = ["POOLING_DATABASE_URL", "DATABASE_URL", "GEMINI_API_KEY"] as const;

type VercelEnv = {
  id: string;
  key: string;
  target: string[];
};

type VercelProject = {
  id: string;
  name: string;
  accountId?: string;
};

async function vercelFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const body = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) {
    const message = body.error?.message || res.statusText || "Vercel API error";
    throw new Error(`${init.method || "GET"} ${path} failed: ${message}`);
  }
  return body;
}

async function getProject(): Promise<VercelProject> {
  return vercelFetch<VercelProject>(`/v9/projects/${encodeURIComponent(PROJECT_NAME)}`);
}

async function listEnv(projectId: string): Promise<VercelEnv[]> {
  const data = await vercelFetch<{ envs: VercelEnv[] }>(`/v9/projects/${projectId}/env`);
  return data.envs || [];
}

async function deleteEnv(projectId: string, envId: string): Promise<void> {
  await vercelFetch(`/v9/projects/${projectId}/env/${envId}`, { method: "DELETE" });
}

async function createEnv(projectId: string, key: string, value: string): Promise<void> {
  await vercelFetch(`/v10/projects/${projectId}/env`, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      type: "encrypted",
      target: ["production", "preview"],
    }),
  });
}

async function upsertEnv(projectId: string, key: string, value: string): Promise<void> {
  const existing = (await listEnv(projectId)).filter((env) => env.key === key);
  for (const env of existing) {
    await deleteEnv(projectId, env.id);
  }
  await createEnv(projectId, key, value);
}

async function triggerProductionDeploy(project: VercelProject): Promise<void> {
  const list = await vercelFetch<{ deployments: { uid: string; url: string; state: string }[] }>(
    `/v6/deployments?projectId=${project.id}&target=production&limit=1`,
  );
  const latest = list.deployments?.[0];
  if (!latest?.uid) {
    throw new Error("No Production deployment found to redeploy.");
  }

  await vercelFetch("/v13/deployments", {
    method: "POST",
    body: JSON.stringify({
      deploymentId: latest.uid,
      name: project.name,
      project: project.id,
      target: "production",
    }),
  });
  console.log(`Triggered Production redeploy (${latest.url})`);
}

async function main() {
  if (!VERCEL_TOKEN) {
    console.error(
      "Missing VERCEL_TOKEN in .env.local.\n" +
        "Create one at https://vercel.com/account/tokens then run:\n" +
        "  pnpm db:sync-env-vercel\n\n" +
        "Or paste manually with: pnpm db:copy-env-vercel all",
    );
    process.exit(1);
  }

  const project = await getProject();
  console.log(`Vercel project: ${project.name} (${project.id})\n`);

  for (const key of ENV_KEYS) {
    const value = (process.env[key] || "").trim();
    if (!value) {
      console.warn(`Skipping ${key}: not set in .env.local`);
      continue;
    }
    await upsertEnv(project.id, key, value);
    console.log(`Updated ${key} (Production + Preview, encrypted)`);
  }

  if (SHOULD_DEPLOY) {
    await triggerProductionDeploy(project);
  } else {
    console.log("\nEnv vars saved. Redeploy Production in Vercel, or run:");
    console.log("  pnpm db:sync-env-vercel --deploy");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
