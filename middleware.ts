import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function registrableHost(hostname: string): string {
  const h = hostname.toLowerCase();
  return h.startsWith("www.") ? h.slice(4) : h;
}

function isLocalOrPreviewHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.endsWith(".vercel.app")) return true;
  return false;
}

function redirectUrlForCanonicalHost(request: NextRequest): URL | null {
  const rawApp = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!rawApp) return null;

  try {
    const canonical = new URL(rawApp);
    if (isLocalOrPreviewHost(canonical.hostname)) return null;

    const forwarded = request.headers.get("x-forwarded-host");
    const hostHeader =
      forwarded?.split(",")[0]?.trim() || request.headers.get("host") || "";
    const reqHost = hostHeader.split(":")[0]?.toLowerCase() ?? "";
    if (!reqHost || isLocalOrPreviewHost(reqHost)) return null;

    if (registrableHost(reqHost) !== registrableHost(canonical.hostname)) {
      return null;
    }

    if (reqHost === canonical.hostname.toLowerCase()) {
      return null;
    }

    const redirected = new URL(request.nextUrl.pathname + request.nextUrl.search, canonical.origin);
    return redirected;
  } catch {
    return null;
  }
}

/**
 * OAuth root callback: send the browser to `/auth/callback` on a single stable origin.
 *
 * When `NEXT_PUBLIC_APP_URL` is set and matches the same site as the request (apex vs www),
 * use that origin — avoids apex↔www redirect loops when forwarded headers disagree with Vercel.
 * Otherwise fall back to `x-forwarded-host` / `host` (local preview, missing env).
 */
function redirectUrlForOAuthRootCode(request: NextRequest): URL | null {
  const url = request.nextUrl;
  if (url.pathname !== "/" || !url.searchParams.has("code")) {
    return null;
  }

  const search = url.search;
  const rawApp = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (rawApp) {
    try {
      const canonical = new URL(rawApp);
      const forwarded = request.headers.get("x-forwarded-host");
      const hostHeader =
        forwarded?.split(",")[0]?.trim() || request.headers.get("host") || "";
      const reqHostname = hostHeader.split(":")[0]?.toLowerCase() ?? "";
      if (
        !reqHostname ||
        registrableHost(reqHostname) ===
          registrableHost(canonical.hostname)
      ) {
        return new URL(`/auth/callback${search}`, canonical.origin);
      }
    } catch {
      // fall through to forwarded headers
    }
  }

  const forwarded = request.headers.get("x-forwarded-host");
  const hostHeader =
    forwarded?.split(",")[0]?.trim() || request.headers.get("host") || "";
  if (!hostHeader) {
    const fallback = url.clone();
    fallback.pathname = "/auth/callback";
    return fallback;
  }

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return new URL(`/auth/callback${search}`, `${proto}://${hostHeader}`);
}

export async function middleware(request: NextRequest) {
  const canonicalRedirect = redirectUrlForCanonicalHost(request);
  if (canonicalRedirect) {
    return NextResponse.redirect(canonicalRedirect);
  }

  // OAuth sometimes lands on Site URL root (?code=) instead of /auth/callback; redirect so path matches /auth/callback (cookies/PKCE).
  // If this redirect ever changes origin vs where the PKCE cookie was set, exchange can fail — align NEXT_PUBLIC_APP_URL,
  // AUTH_COOKIE_DOMAIN, and Supabase Redirect URLs (see docs/oauth-callback-production.md).
  const oauthRedirect = redirectUrlForOAuthRootCode(request);
  if (oauthRedirect) {
    return NextResponse.redirect(oauthRedirect);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

