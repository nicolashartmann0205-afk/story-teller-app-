import { normalizeDatabaseUrl } from "./normalize-database-url";

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
  const poolingUrl = normalizeDatabaseUrl(env[POOLING_VAR]);
  const databaseUrl = normalizeDatabaseUrl(env[DATABASE_VAR]);
  return { poolingUrl, databaseUrl };
}

export function resolveDatabaseConnectionUrl(): string | undefined {
  const { poolingUrl, databaseUrl } = getDatabaseUrlsFromRuntimeEnv();
  return poolingUrl || databaseUrl;
}

export function isRuntimeDatabaseConfigured(): boolean {
  return Boolean(resolveDatabaseConnectionUrl());
}
