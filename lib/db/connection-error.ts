import { isRuntimeDatabaseConfigured } from "./runtime-env";

export function isDatabaseNotConfiguredError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("database_not_configured") ||
    message.includes("database_url is required")
  );
}

function isInvalidDatabaseUrlError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.toLowerCase().includes("invalid url");
}

function isLikelyConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("enotfound") ||
    message.includes("password authentication") ||
    message.includes("connect_timeout") ||
    message.includes("connection") ||
    message.includes("ssl") ||
    message.includes("tenant or user not found")
  );
}

export function dashboardDataLoadWarning(
  error: unknown,
  options?: { isOwner?: boolean }
): string {
  const base =
    "Your stories and credits are stored safely, but the live site cannot load them right now.";
  const configuredNow = isRuntimeDatabaseConfigured();

  if (isDatabaseNotConfiguredError(error)) {
    if (options?.isOwner) {
      if (configuredNow) {
        return `${base} The database URL is present on this server, but the app could not open a connection. Confirm POOLING_DATABASE_URL is the Supabase transaction pooler (port 6543), then redeploy Production.`;
      }
      return `${base} If POOLING_DATABASE_URL is already in Vercel, you must redeploy Production after saving it (Deployments → ⋯ → Redeploy) — new variables are not picked up by a running deployment. Scope must include Production, not Development only. Or run: pnpm db:sync-env-vercel --deploy`;
    }
    return `${base} Please try again in a few minutes.`;
  }

  if (isInvalidDatabaseUrlError(error)) {
    if (options?.isOwner) {
      return `${base} POOLING_DATABASE_URL on Vercel is malformed (Invalid URL). In Supabase → Connect → Transaction pooler, copy the full URI again. In Vercel, delete the old value, paste with no extra quotes, enable Production, Save, then Redeploy. Or run locally: pnpm db:copy-env-vercel pooling`;
    }
    return `${base} Please try again in a few minutes.`;
  }

  if (isLikelyConnectionError(error)) {
    if (options?.isOwner) {
      const msg = error instanceof Error ? error.message.toLowerCase() : "";
      if (msg.includes("password authentication")) {
        return `${base} Database password rejected on Vercel. In Supabase → Connect → Transaction pooler (port 6543), copy a fresh URI (not Session pooler on 5432), update POOLING_DATABASE_URL, redeploy.`;
      }
      return `${base} Database connection failed. Use Supabase Transaction pooler (port 6543), not Session pooler (5432), then redeploy Production.`;
    }
    return `${base} Please try again in a few minutes.`;
  }

  const errMsg = error instanceof Error ? error.message : String(error);
  if (options?.isOwner && errMsg.includes("Failed query")) {
    return `${base} Connected to the database but queries failed — usually wrong pooler URL (use Transaction pooler port 6543) or wrong password. Check /api/health/db then fix POOLING_DATABASE_URL on Vercel and redeploy.`;
  }
  return `We could not load your story stats (${errMsg}).`;
}

export function adminMetricsLoadWarning(error: unknown): string {
  return `Could not load usage metrics. ${dashboardDataLoadWarning(error, { isOwner: true })}`;
}
