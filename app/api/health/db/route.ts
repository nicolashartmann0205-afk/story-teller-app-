import { NextResponse } from "next/server";
import postgres from "postgres";
import {
  diagnosePostgresUrl,
  repairPostgresConnectionUrl,
} from "@/lib/db/normalize-database-url";
import {
  getDatabaseUrlsFromRuntimeEnv,
  getRawDatabaseUrlsFromRuntimeEnv,
  isRuntimeDatabaseConfigured,
  resolveDatabaseConnectionUrl,
} from "@/lib/db/runtime-env";

export const dynamic = "force-dynamic";

/** Lightweight DB probe for production debugging (no secrets in response). */
export async function GET() {
  const { poolingUrl, databaseUrl } = getDatabaseUrlsFromRuntimeEnv();
  const { poolingRaw, databaseRaw } = getRawDatabaseUrlsFromRuntimeEnv();
  const configured = isRuntimeDatabaseConfigured();

  const poolingDiag = diagnosePostgresUrl(poolingRaw);
  const databaseDiag = diagnosePostgresUrl(databaseRaw);
  const repairedPooling = repairPostgresConnectionUrl(poolingRaw);
  const repairedDatabase = repairPostgresConnectionUrl(databaseRaw);

  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        hasPooling: Boolean(poolingRaw),
        hasDatabase: Boolean(databaseRaw),
        pooling: poolingDiag,
        database: databaseDiag,
        hint: "Set POOLING_DATABASE_URL on Vercel (Production scope), then redeploy.",
      },
      { status: 503 }
    );
  }

  const url = resolveDatabaseConnectionUrl()!;
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 8 });
  try {
    const [{ ok }] = await sql`SELECT 1 AS ok`;
    return NextResponse.json({
      ok: ok === 1,
      configured: true,
      connected: ok === 1,
      usesPooling: Boolean(poolingUrl),
      pooling: poolingDiag,
      database: databaseDiag,
      repaired: {
        pooling: Boolean(repairedPooling),
        database: Boolean(repairedDatabase),
      },
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
        pooling: poolingDiag,
        database: databaseDiag,
        repaired: {
          pooling: Boolean(repairedPooling),
          database: Boolean(repairedDatabase),
        },
        hint:
          poolingDiag.length > 0 && poolingDiag.length !== 110
            ? `POOLING_DATABASE_URL length on server is ${poolingDiag.length} chars; a valid Supabase pooler URI is usually ~110. Delete the variable in Vercel, paste again from Supabase → Connect → Transaction pooler (port 6543), save, redeploy.`
            : !poolingDiag.passesUrlParse
              ? "POOLING_DATABASE_URL cannot be parsed. Password may need encoding, or the value is truncated. Copy the full URI from Supabase again."
              : "URL parses but connection failed. Confirm transaction pooler (port 6543) and that the password matches the current database password.",
      },
      { status: 503 }
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}
