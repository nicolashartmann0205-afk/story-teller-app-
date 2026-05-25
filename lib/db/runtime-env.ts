import { repairPostgresConnectionUrl } from "./normalize-database-url";

/** Env keys as variables so bundlers do not inline a single build-time value. */
const POOLING_VAR = "POOLING_DATABASE_URL";
const DATABASE_VAR = "DATABASE_URL";

/**
 * Read Postgres URLs at request time.
 * Prefer bracket access on `process.env` so a deploy that adds env vars after an
 * older build is not stuck with `undefined` from static `process.env.FOO` inlining.
 */
export function getDatabaseUrlsFromRuntimeEnv(): {
  poolingUrl?: string;
  databaseUrl?: string;
} {
  const env = process.env;
  const poolingUrl = repairPostgresConnectionUrl(env[POOLING_VAR]);
  const databaseUrl = repairPostgresConnectionUrl(env[DATABASE_VAR]);
  return { poolingUrl, databaseUrl };
}

export function resolveDatabaseConnectionUrl(): string | undefined {
  const { poolingUrl, databaseUrl } = getDatabaseUrlsFromRuntimeEnv();
  return poolingUrl || databaseUrl;
}

/** Raw env values before repair — for diagnostics only. */
export function getRawDatabaseUrlsFromRuntimeEnv(): {
  poolingRaw?: string;
  databaseRaw?: string;
} {
  const env = process.env;
  return {
    poolingRaw: env[POOLING_VAR]?.trim() || undefined,
    databaseRaw: env[DATABASE_VAR]?.trim() || undefined,
  };
}

export function isRuntimeDatabaseConfigured(): boolean {
  return Boolean(resolveDatabaseConnectionUrl());
}
