import { sql } from "drizzle-orm";
import { isDatabaseConfigured } from "./is-configured";
import { db } from "./index";

export type DatabaseDiagnostics = {
  configured: boolean;
  connected: boolean;
  host: string | null;
  error: string | null;
};

function maskDatabaseHost(): string | null {
  const url =
    process.env.POOLING_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url.replace(/^postgres(ql)?:/, "http:")).hostname;
  } catch {
    return null;
  }
}

export async function getDatabaseDiagnostics(): Promise<DatabaseDiagnostics> {
  const configured = isDatabaseConfigured();
  if (!configured) {
    return {
      configured: false,
      connected: false,
      host: null,
      error: "POOLING_DATABASE_URL is not set",
    };
  }

  try {
    await db.execute(sql`SELECT 1`);
    return {
      configured: true,
      connected: true,
      host: maskDatabaseHost(),
      error: null,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      host: maskDatabaseHost(),
      error: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

export async function getStoryCountForUser(userId: string): Promise<number | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }
  try {
    const [row] = await db.execute<{ count: string }>(sql`
      SELECT count(*)::int AS count FROM public.stories WHERE user_id = ${userId}
    `);
    return Number(row?.count ?? 0);
  } catch {
    return null;
  }
}
