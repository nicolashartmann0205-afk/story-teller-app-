import { NextResponse } from "next/server";
import postgres from "postgres";
import {
  diagnosePostgresUrl,
  type PostgresUrlDiagnostics,
  repairPostgresConnectionUrl,
} from "@/lib/db/normalize-database-url";

function poolingHint(
  pooling: PostgresUrlDiagnostics,
  errorMessage: string
): string {
  if (pooling.poolerIssues.includes("wrong_port_session_pooler")) {
    return "POOLING_DATABASE_URL uses port 5432 (session pooler). In Supabase → Connect choose Transaction pooler (port 6543), not Session pooler.";
  }
  if (pooling.poolerIssues.includes("wrong_username")) {
    return "POOLING_DATABASE_URL username should be postgres.YOUR_PROJECT_REF (from Supabase Connect), not postgres alone.";
  }
  if (errorMessage.toLowerCase().includes("password authentication")) {
    return "Password rejected. In Supabase reset the database password, copy a fresh Transaction pooler URI (port 6543), update POOLING_DATABASE_URL on Vercel, redeploy.";
  }
  if (pooling.length > 0 && pooling.length !== 110) {
    return `POOLING_DATABASE_URL length is ${pooling.length} chars; a valid transaction pooler URI is usually ~110. Copy again from Supabase → Connect → Transaction pooler.`;
  }
  if (!pooling.passesUrlParse) {
    return "POOLING_DATABASE_URL cannot be parsed. Copy the full URI from Supabase (no extra quotes).";
  }
  return "Confirm Transaction pooler (port 6543) and redeploy Production after saving the env var.";
}
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
        hint: poolingHint(poolingDiag, message),
      },
      { status: 503 }
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}
