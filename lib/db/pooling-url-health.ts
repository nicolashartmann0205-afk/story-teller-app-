import {
  diagnosePostgresUrl,
  type PostgresUrlDiagnostics,
} from "./normalize-database-url";
import { getRawDatabaseUrlsFromRuntimeEnv } from "./runtime-env";

/** Raw Vercel pastes under ~105 chars are almost always truncated (full URI is ~110). */
const MIN_HEALTHY_POOLING_URL_LENGTH = 105;

export function getPoolingUrlDiagnostics(): PostgresUrlDiagnostics | null {
  const { poolingRaw } = getRawDatabaseUrlsFromRuntimeEnv();
  if (!poolingRaw) return null;
  return diagnosePostgresUrl(poolingRaw);
}

export function isPoolingUrlLikelyBroken(): boolean {
  const { poolingRaw } = getRawDatabaseUrlsFromRuntimeEnv();
  if (!poolingRaw?.trim()) return true;

  const diag = diagnosePostgresUrl(poolingRaw);
  if (poolingRaw.length < MIN_HEALTHY_POOLING_URL_LENGTH) return true;
  if (!diag.hasPostgresqlPrefix) return true;
  if (diag.poolerIssues.includes("wrong_port_session_pooler")) return true;
  if (diag.poolerIssues.includes("wrong_username")) return true;
  return false;
}

/** Prefer PostgREST (user JWT or service role) when the pooler secret on Vercel is truncated or malformed. */
export function shouldPreferSupabaseOverPostgres(): boolean {
  return isPoolingUrlLikelyBroken();
}
