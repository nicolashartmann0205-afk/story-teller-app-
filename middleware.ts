import { type NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES } from "@/lib/auth/routes";
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

/** Never bounce OAuth/auth flows between apex and www — breaks PKCE and session cookies. */
function shouldSkipHostNormalization(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/auth/")) {
    return true;
  }
  if (
    request.nextUrl.searchParams.has("code") ||
    request.nextUrl.searchParams.has("error")
  ) {
    return true;
  }
  return false;
}

function redirectUrlForCanonicalHost(request: NextRequest): URL | null {
  const rawApp = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!rawApp) return null;

  try {
    const normalized = /^https?:\/\//i.test(rawApp) ? rawApp : `https://${rawApp}`;
    const canonical = new URL(normalized);
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
 * OAuth root callback: send the browser to `/auth/callback` on the **same host** that received
 * `?code=`, so PKCE verifier cookies match the exchange (see docs/oauth-callback-production.md).
 */
function redirectUrlForOAuthRootCode(request: NextRequest): URL | null {
  const url = request.nextUrl;
  if (url.pathname !== "/" || !url.searchParams.has("code")) {
    return null;
  }

  const search = url.search;
  const forwarded = request.headers.get("x-forwarded-host");
  const hostHeader =
    forwarded?.split(",")[0]?.trim() || request.headers.get("host") || "";
  if (!hostHeader) {
    const fallback = url.clone();
    fallback.pathname = AUTH_ROUTES.CALLBACK;
    return fallback;
  }

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return new URL(`${AUTH_ROUTES.CALLBACK}${search}`, `${proto}://${hostHeader}`);
}

export async function middleware(request: NextRequest) {
  // Handle OAuth on `/` before any apex↔www normalization.
  const oauthRedirect = redirectUrlForOAuthRootCode(request);
  if (oauthRedirect) {
    return NextResponse.redirect(oauthRedirect);
  }

  if (!shouldSkipHostNormalization(request)) {
    const canonicalRedirect = redirectUrlForCanonicalHost(request);
    if (canonicalRedirect) {
      return NextResponse.redirect(canonicalRedirect);
    }
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
