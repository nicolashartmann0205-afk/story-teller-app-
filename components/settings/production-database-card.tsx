import Link from "next/link";
import {
  diagnosePostgresUrl,
  diagnoseRepairedPostgresUrl,
} from "@/lib/db/normalize-database-url";
import { isPoolingUrlLikelyBroken } from "@/lib/db/pooling-url-health";
import { getRawDatabaseUrlsFromRuntimeEnv } from "@/lib/db/runtime-env";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export function ProductionDatabaseCard() {
  const { poolingRaw } = getRawDatabaseUrlsFromRuntimeEnv();
  const rawDiag = diagnosePostgresUrl(poolingRaw);
  const repairedDiag = diagnoseRepairedPostgresUrl(poolingRaw);
  const broken = isPoolingUrlLikelyBroken();
  const hasServiceRole = Boolean(getServiceRoleClient());

  const ok = !broken;

  return (
    <div className="mt-8 bg-white dark:bg-brand-ink/80 shadow rounded-lg overflow-hidden border border-brand-seafoam/30">
      <div className="px-4 py-5 sm:px-6 border-b border-brand-seafoam/30">
        <h3 className="text-lg font-medium leading-6 text-brand-ink dark:text-brand-yellow">
          Admin: Production database
        </h3>
        <p className="mt-1 text-sm text-brand-ink/80 dark:text-brand-seafoam">
          Status of <code className="text-xs">POOLING_DATABASE_URL</code> on this deployment (no secrets shown).
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6 space-y-4">
        <div
          className={`rounded-md border px-4 py-3 ${
            ok
              ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30"
              : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
          }`}
        >
          <p className="text-sm font-medium text-brand-ink dark:text-brand-yellow">
            {ok ? "Database URL looks healthy" : "Database URL needs to be replaced on Vercel"}
          </p>
          <ul className="mt-2 text-sm text-brand-ink/85 dark:text-brand-seafoam space-y-1">
            <li>
              Raw length: <strong>{poolingRaw?.length ?? 0}</strong> characters (expect ~110)
            </li>
            <li>
              After repair: port <strong>{repairedDiag.port ?? "—"}</strong>, user role{" "}
              <strong>{repairedDiag.passesUrlParse ? "valid" : "invalid"}</strong>
            </li>
            <li>Service role fallback: {hasServiceRole ? "configured" : "not set (Usage admin uses owner session if migrations 0070–0071 are applied)"}</li>
          </ul>
        </div>

        {!ok ? (
          <div className="text-sm text-brand-ink/90 dark:text-brand-seafoam space-y-3">
            <p>
              Your stories still load via Supabase API, but direct Postgres (faster, full features) fails because
              the password on Vercel is truncated or wrong.
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                On your Mac, in the project folder:{" "}
                <code className="rounded bg-brand-cream/80 px-1 text-xs dark:bg-brand-ink/70">
                  pnpm db:copy-env-vercel pooling
                </code>
              </li>
              <li>
                Vercel → Settings → Environment Variables → delete the old{" "}
                <code className="text-xs">POOLING_DATABASE_URL</code> value → paste from clipboard → Production +
                Preview → Save
              </li>
              <li>Deployments → Redeploy Production</li>
            <li>
              Optional: add <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> (Supabase → Settings → API →
              service_role) — required for <strong>Usage admin</strong> when the pooler URL is broken
            </li>
            </ol>
            <p>
              <Link
                href="/api/health/db"
                className="font-medium text-brand-teal underline underline-offset-2 dark:text-brand-yellow"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open /api/health/db
              </Link>{" "}
              after redeploy — you want <code className="text-xs">connected: true</code>.
            </p>
          </div>
        ) : (
          <p className="text-sm text-brand-ink/85 dark:text-brand-seafoam">
            Direct Postgres should work. If the dashboard still shows issues, redeploy or check{" "}
            <Link href="/api/health/db" className="underline" target="_blank" rel="noopener noreferrer">
              /api/health/db
            </Link>
            .
          </p>
        )}

        {rawDiag.poolerIssues.length > 0 ? (
          <p className="text-xs text-brand-ink/75 dark:text-brand-seafoam">
            Detected: {rawDiag.poolerIssues.join(", ").replaceAll("_", " ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
