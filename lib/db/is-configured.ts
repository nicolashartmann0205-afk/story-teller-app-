/** True when a real database URL is available at runtime (not build placeholder). */
export function isDatabaseConfigured(): boolean {
  return Boolean(
    process.env.POOLING_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  );
}
