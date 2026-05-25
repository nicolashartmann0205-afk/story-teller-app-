/**
 * Clean and repair Supabase/Vercel Postgres connection strings.
 * Does not log or persist the URL — callers only use the return value at runtime.
 */

function decodeCredentialPart(value: string): string {
  if (!value) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function encodeCredentialPart(value: string): string {
  return encodeURIComponent(decodeCredentialPart(value));
}

export function normalizeDatabaseUrl(raw: string | undefined): string | undefined {
  if (raw == null) {
    return undefined;
  }

  let url = raw.trim();
  if (!url) {
    return undefined;
  }

  // Vercel / .env.local sometimes include literal wrapping quotes.
  for (let i = 0; i < 2; i++) {
    if (
      (url.startsWith('"') && url.endsWith('"')) ||
      (url.startsWith("'") && url.endsWith("'"))
    ) {
      url = url.slice(1, -1).trim();
    }
  }

  // Strip UTF-8 BOM and stray whitespace/newlines from bad pastes.
  url = url.replace(/^\uFEFF/, "").replace(/[\r\n\t]+/g, "");

  if (!url) {
    return undefined;
  }

  return url;
}

export function isValidPostgresUrl(url: string): boolean {
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    return false;
  }
  try {
    new URL(url.replace(/^postgres(ql)?:/, "http:"));
    return true;
  } catch {
    return false;
  }
}

/**
 * Rebuild a postgres URL with encoded credentials when URL() cannot parse it
 * (common when the password contains @, :, /, #, or %).
 */
function rebuildWithEncodedCredentials(url: string): string | undefined {
  const schemeMatch = url.match(/^(postgres(?:ql)?):\/\//i);
  if (!schemeMatch) {
    return undefined;
  }

  const protocol =
    schemeMatch[1].toLowerCase() === "postgres" ? "postgresql" : schemeMatch[1];
  const rest = url.slice(schemeMatch[0].length);
  const atIdx = rest.lastIndexOf("@");
  if (atIdx < 0) {
    return undefined;
  }

  const userinfo = rest.slice(0, atIdx);
  const hostAndRest = rest.slice(atIdx + 1);
  const colon = userinfo.indexOf(":");
  const user = colon >= 0 ? userinfo.slice(0, colon) : userinfo;
  const password = colon >= 0 ? userinfo.slice(colon + 1) : "";

  const rebuilt = `${protocol}://${encodeCredentialPart(user)}${password ? `:${encodeCredentialPart(password)}` : ""}@${hostAndRest}`;
  return isValidPostgresUrl(rebuilt) ? rebuilt : undefined;
}

const TRANSACTION_POOLER_PORT = "6543";
const SESSION_POOLER_PORT = "5432";

function getSupabaseProjectRefFromEnv(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const host = new URL(raw).hostname;
    const ref = host.split(".")[0];
    return ref || undefined;
  } catch {
    const match = raw.match(/https?:\/\/([^.]+)\.supabase\.co/i);
    return match?.[1];
  }
}

/** Session pooler (5432) pasted into POOLING_DATABASE_URL — use transaction pooler (6543). */
function fixSupabasePoolerPort(url: string): string {
  if (!/pooler\.supabase\.com/i.test(url)) {
    return url;
  }
  return url.replace(
    new RegExp(`:${SESSION_POOLER_PORT}(/|$)`, "g"),
    `:${TRANSACTION_POOLER_PORT}$1`
  );
}

/** Vercel often gets `postgres` instead of `postgres.<project_ref>` on pooler URLs. */
function fixSupabasePoolerUsername(url: string): string {
  if (!/pooler\.supabase\.com/i.test(url)) {
    return url;
  }
  const projectRef = getSupabaseProjectRefFromEnv();
  if (!projectRef) {
    return url;
  }

  const schemeMatch = url.match(/^(postgres(?:ql)?):\/\//i);
  if (!schemeMatch) {
    return url;
  }

  const protocol =
    schemeMatch[1].toLowerCase() === "postgres" ? "postgresql" : schemeMatch[1];
  const rest = url.slice(schemeMatch[0].length);
  const atIdx = rest.lastIndexOf("@");
  if (atIdx < 0) {
    return url;
  }

  const userinfo = rest.slice(0, atIdx);
  const hostAndRest = rest.slice(atIdx + 1);
  const colon = userinfo.indexOf(":");
  const user = colon >= 0 ? userinfo.slice(0, colon) : userinfo;
  const password = colon >= 0 ? userinfo.slice(colon + 1) : "";

  if (user === "postgres" || user === `postgres.${projectRef}`) {
    const fixedUser = `postgres.${projectRef}`;
    return `${protocol}://${fixedUser}${password ? `:${password}` : ""}@${hostAndRest}`;
  }

  return url;
}

function applySupabasePoolerFixes(url: string): string {
  return fixSupabasePoolerUsername(fixSupabasePoolerPort(url));
}

export type PoolerUrlIssue =
  | "wrong_port_session_pooler"
  | "wrong_username"
  | "not_pooler_host";

/** Non-secret checks for Supabase transaction pooler URLs. */
export function getPoolerUrlIssues(url: string): PoolerUrlIssue[] {
  const issues: PoolerUrlIssue[] = [];

  if (!/pooler\.supabase\.com/i.test(url)) {
    issues.push("not_pooler_host");
    return issues;
  }

  const port = url.match(/:(\d+)\//)?.[1];
  if (port === SESSION_POOLER_PORT) {
    issues.push("wrong_port_session_pooler");
  }

  const atIdx = url.lastIndexOf("@");
  if (atIdx > 0) {
    const schemeEnd = url.indexOf("://");
    const userinfo = url.slice(schemeEnd >= 0 ? schemeEnd + 3 : 0, atIdx);
    const user = userinfo.split(":")[0] || "";
    if (user === "postgres" || !user.includes(".")) {
      issues.push("wrong_username");
    }
  }

  return issues;
}

/**
 * Normalize and repair a Postgres URL for runtime use (pooler or direct).
 */
export function repairPostgresConnectionUrl(raw: string | undefined): string | undefined {
  let url = normalizeDatabaseUrl(raw);
  if (!url) {
    return undefined;
  }

  // Host-only / scheme-less Supabase pastes (common on Vercel).
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    if (url.startsWith("//")) {
      // Supabase "URI" copy sometimes starts with // — must not become postgresql:////...
      url = `postgresql:${url}`;
    } else if (url.includes("@") && /supabase\.com|pooler\.supabase/i.test(url)) {
      url = `postgresql://${url}`;
    } else {
      return undefined;
    }
  }

  // Collapse postgresql:////user@... from bad pastes.
  url = url.replace(/^(postgres(?:ql)?:\/\/)\/+/i, "$1");

  url = applySupabasePoolerFixes(url);

  if (/pooler\.supabase\.com/i.test(url)) {
    const encoded = rebuildWithEncodedCredentials(url);
    if (encoded) {
      url = encoded;
    }
  }

  if (isValidPostgresUrl(url) && !isLocalhostDatabaseUrl(url)) {
    return url;
  }

  const rebuilt = rebuildWithEncodedCredentials(url);
  if (rebuilt) {
    const fixed = applySupabasePoolerFixes(rebuilt).replace(
      /^(postgres(?:ql)?:\/\/)\/+/i,
      "$1"
    );
    return isValidPostgresUrl(fixed) && !isLocalhostDatabaseUrl(fixed) ? fixed : undefined;
  }

  return undefined;
}

function isLocalhostDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url.replace(/^postgres(ql)?:/, "http:"));
    const host = parsed.hostname.toLowerCase();
    return host === "127.0.0.1" || host === "localhost" || host === "build";
  } catch {
    return /127\.0\.0\.1|localhost|build@/i.test(url);
  }
}

export type PostgresUrlDiagnostics = {
  length: number;
  hasPostgresqlPrefix: boolean;
  passesUrlParse: boolean;
  host?: string;
  port?: string;
  looksLikeSupabasePooler: boolean;
  poolerIssues: PoolerUrlIssue[];
};

/** Diagnostics for the URL actually used at runtime (after repair). */
export function diagnoseRepairedPostgresUrl(
  raw: string | undefined
): PostgresUrlDiagnostics {
  return diagnosePostgresUrl(repairPostgresConnectionUrl(raw));
}

/** Safe role name from a postgres URL (no password). */
export function getPostgresUrlRole(url: string | undefined): string | undefined {
  const normalized = repairPostgresConnectionUrl(url) ?? normalizeDatabaseUrl(url);
  if (!normalized) return undefined;
  const atIdx = normalized.lastIndexOf("@");
  if (atIdx < 0) return undefined;
  const schemeEnd = normalized.indexOf("://");
  const userinfo = normalized.slice(schemeEnd >= 0 ? schemeEnd + 3 : 0, atIdx);
  const user = userinfo.split(":")[0] || "";
  return user.replace(/^\/+/, "") || undefined;
}

/** Safe metadata for /api/health/db — never includes credentials. */
export function diagnosePostgresUrl(raw: string | undefined): PostgresUrlDiagnostics {
  const url = normalizeDatabaseUrl(raw);
  if (!url) {
    return {
      length: 0,
      hasPostgresqlPrefix: false,
      passesUrlParse: false,
      looksLikeSupabasePooler: false,
      poolerIssues: [],
    };
  }

  const hasPostgresqlPrefix = /^postgres(ql)?:\/\//i.test(url);
  let host: string | undefined;
  let port: string | undefined;
  let passesUrlParse = false;

  if (hasPostgresqlPrefix && isValidPostgresUrl(url)) {
    passesUrlParse = true;
    try {
      const parsed = new URL(url.replace(/^postgres(ql)?:/, "http:"));
      host = parsed.hostname;
      port = parsed.port || undefined;
    } catch {
      passesUrlParse = false;
    }
  } else {
    const atIdx = url.lastIndexOf("@");
    const hostPart = atIdx >= 0 ? url.slice(atIdx + 1) : url;
    host = hostPart.split(/[/:?]/)[0] || undefined;
    port = hostPart.match(/:(\d+)\//)?.[1];
  }

  const looksLikeSupabasePooler = /pooler\.supabase\.com/i.test(url);

  return {
    length: url.length,
    hasPostgresqlPrefix,
    passesUrlParse,
    host,
    port,
    looksLikeSupabasePooler,
    poolerIssues: looksLikeSupabasePooler ? getPoolerUrlIssues(url) : [],
  };
}
