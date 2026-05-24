import { NextResponse } from "next/server";
import postgres from "postgres";
import {
  getDatabaseUrlsFromRuntimeEnv,
  isRuntimeDatabaseConfigured,
  resolveDatabaseConnectionUrl,
} from "@/lib/db/runtime-env";
import { isValidPostgresUrl } from "@/lib/db/normalize-database-url";

export const dynamic = "force-dynamic";

/** Lightweight DB probe for production debugging (no secrets in response). */
export async function GET() {
  const { poolingUrl, databaseUrl } = getDatabaseUrlsFromRuntimeEnv();
  const configured = isRuntimeDatabaseConfigured();

  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        hasPooling: Boolean(poolingUrl),
        hasDatabase: Boolean(databaseUrl),
        hint: "Set POOLING_DATABASE_URL on Vercel (Production scope), then redeploy.",
      },
      { status: 503 }
    );
  }

  const url = resolveDatabaseConnectionUrl()!;
  if (!isValidPostgresUrl(url)) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        connected: false,
        usesPooling: Boolean(poolingUrl),
        error: "Invalid URL",
        hint: "POOLING_DATABASE_URL is malformed. Re-paste the Supabase transaction pooler URI (port 6543) with no extra quotes, then redeploy.",
      },
      { status: 503 }
    );
  }
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 8 });
  try {
    const [{ ok }] = await sql`SELECT 1 AS ok`;
    return NextResponse.json({
      ok: ok === 1,
      configured: true,
      connected: ok === 1,
      usesPooling: Boolean(poolingUrl),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        connected: false,
        usesPooling: Boolean(poolingUrl),
        error: message.slice(0, 200),
      },
      { status: 503 }
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}
