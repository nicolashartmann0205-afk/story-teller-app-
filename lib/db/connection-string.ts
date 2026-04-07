/**
 * Single URL for Drizzle runtime and drizzle-kit migrate.
 * Prefer pooler when set so CLI and app hit the same DB as migrations.
 */
export function getDatabaseConnectionUrl(): string {
  const url =
    process.env.POOLING_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("POOLING_DATABASE_URL or DATABASE_URL is required");
  }
  return url;
}
