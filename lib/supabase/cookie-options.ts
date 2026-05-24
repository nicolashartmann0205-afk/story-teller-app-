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

function hostnameFromContext(context?: { host?: string }): string | undefined {
  const host = context?.host?.trim();
  if (!host) return undefined;
  return host.split(":")[0]?.toLowerCase();
}

/**
 * Shared cookie domain for apex + www (e.g. `.storyinthemaking.com`).
 * Prefers explicit AUTH_COOKIE_DOMAIN, then NEXT_PUBLIC_APP_URL, then request host.
 */
function resolveSharedDomain(context?: { host?: string }): string | undefined {
  const explicit = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (explicit) {
    return normalizeLeadingDotDomain(explicit);
  }

  const hostnames: string[] = [];

  const rawApp = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (rawApp) {
    try {
      const normalized = /^https?:\/\//i.test(rawApp) ? rawApp : `https://${rawApp}`;
      hostnames.push(new URL(normalized).hostname);
    } catch {
      // ignore invalid env
    }
  }

  const requestHost = hostnameFromContext(context);
  if (requestHost) {
    hostnames.push(requestHost);
  }

  for (const hostname of hostnames) {
    if (!hostname || isLocalOrPreviewHost(hostname)) continue;
    const base = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
    return normalizeLeadingDotDomain(base);
  }

  return undefined;
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
  const domain = resolveSharedDomain(context);
  if (!domain) {
    return undefined;
  }

  const host =
    context?.host ??
    (typeof window !== "undefined" ? window.location.hostname : undefined);

  if (host && isLocalOrPreviewHost(host)) {
    return undefined;
  }

  if (process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "production") {
    return undefined;
  }

  return {
    path: "/",
    sameSite: "lax",
    secure: true,
    domain,
  };
}
