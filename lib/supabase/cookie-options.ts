import type { CookieOptions } from "@supabase/ssr";

function isLocalOrPreviewHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.endsWith(".vercel.app")) return true;
  return false;
}

function normalizeLeadingDotDomain(raw: string): string {
  const trimmed = raw.trim();
  const withoutDot = trimmed.startsWith(".") ? trimmed.slice(1) : trimmed;
  return `.${withoutDot}`;
}

function sanitizeHost(input: string): string {
  return input.trim().toLowerCase().split(":")[0] ?? input;
}

function resolveDomainFromHost(hostname: string): string | undefined {
  const host = sanitizeHost(hostname);
  if (!host || !host.includes(".")) return undefined;
  if (isLocalOrPreviewHost(host)) return undefined;
  const base = host.startsWith("www.") ? host.slice(4) : host;
  return normalizeLeadingDotDomain(base);
}

/**
 * Shared cookie domain for apex + www (e.g. `.storyinthemaking.com`).
 */
function resolveSharedDomain(): string | undefined {
  const explicit = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (explicit) {
    return normalizeLeadingDotDomain(explicit);
  }

  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return undefined;

  try {
    const hostname = new URL(raw).hostname;
    if (isLocalOrPreviewHost(hostname)) return undefined;
    const base = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
    return normalizeLeadingDotDomain(base);
  } catch {
    return undefined;
  }
}

export type SupabaseCookieContext = {
  /** Request hostname, e.g. from `NextRequest` — used in middleware / route handlers */
  host?: string;
};

/**
 * Returns Supabase SSR `cookieOptions` so session cookies work on both apex and www.
 *
 * Skips shared domain on localhost, Vercel preview hosts, or when `VERCEL_ENV` is not
 * `production` (server). In the browser, `host` defaults to `window.location.hostname`.
 */
export function getSupabaseCookieOptions(
  context?: SupabaseCookieContext
): CookieOptions | undefined {
  const host =
    context?.host ??
    (typeof window !== "undefined" ? window.location.hostname : undefined);
  const hostDomain = host ? resolveDomainFromHost(host) : undefined;

  if (host && isLocalOrPreviewHost(host)) {
    return undefined;
  }

  if (process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "production") {
    return undefined;
  }

  const domain = hostDomain ?? resolveSharedDomain();
  if (!domain) {
    return undefined;
  }

  return {
    path: "/",
    sameSite: "lax",
    secure: true,
    domain,
  };
}
