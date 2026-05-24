import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { isDatabaseConfigured } from "./is-configured";

export type DatabaseProbeResult =
  | { ok: true }
  | { ok: false; code: "NOT_CONFIGURED" | "CONNECTION_FAILED"; message: string };

export async function probeDatabase(): Promise<DatabaseProbeResult> {
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "POOLING_DATABASE_URL or DATABASE_URL is not set in this environment.",
    };
  }

  try {
    await db.execute(sql`SELECT 1 AS ok`);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not connect to the database.";
    return {
      ok: false,
      code: "CONNECTION_FAILED",
      message,
    };
  }
}
