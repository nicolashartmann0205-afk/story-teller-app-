import { resolveDatabaseConnectionUrl } from "./runtime-env";

/**
 * Single URL for Drizzle runtime and drizzle-kit migrate.
 * Prefer pooler when set so CLI and app hit the same DB as migrations.
 */
const BUILD_TIME_PLACEHOLDER_URL =
  "postgresql://build:build@127.0.0.1:5432/build?connect_timeout=1";

function isNextProductionBuild(): boolean {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return true;
  }
  // Fallback for CI/Vercel when NEXT_PHASE is not propagated to a worker chunk.
  return process.env.npm_lifecycle_event === "build";
}

export function getDatabaseConnectionUrl(): string {
  const url = resolveDatabaseConnectionUrl();
  if (url) {
    return url;
  }
  if (isNextProductionBuild()) {
    // Builds import server modules before runtime-only env vars are available.
    // Runtime must still set POOLING_DATABASE_URL or DATABASE_URL for real queries.
    return BUILD_TIME_PLACEHOLDER_URL;
  }
  throw new Error("POOLING_DATABASE_URL or DATABASE_URL is required");
}
