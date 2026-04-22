import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

// Public routes that are accessible to everyone (blog is public marketing content)
const publicRoutes = ["/", "/auth/sign-in", "/auth/sign-up", "/auth/callback"];
const AUTH_DEBUG = process.env.AUTH_DEBUG === "1";

// Check if a path is a public route
function isPublicRoute(pathname: string): boolean {
  if (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/blogs" ||
    pathname.startsWith("/blogs/")
  ) {
    return true;
  }
  if (pathname === "/support" || pathname.startsWith("/support/")) {
    return true;
  }
  return publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
}

/**
 * Preserve refreshed Supabase session cookies when returning a redirect.
 * Next.js middleware may serialize cookies to `x-middleware-set-cookie`; copy that plus re-apply cookies.
 */
function redirectWithSessionCookies(url: URL, supabaseResponse: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  const serialized = supabaseResponse.headers.get("x-middleware-set-cookie");
  if (serialized) {
    redirectResponse.headers.set("x-middleware-set-cookie", serialized);
  }
  for (const cookie of supabaseResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const cookieOptions = getSupabaseCookieOptions({
    host: request.nextUrl.hostname,
  });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      ...(cookieOptions ? { cookieOptions } : {}),
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = isPublicRoute(pathname);
  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("sb-") && cookie.name.includes("auth-token"));

  if (AUTH_DEBUG) {
    console.info("[auth:middleware] user check", {
      host: request.nextUrl.host,
      pathname,
      isPublic,
      hasUser: Boolean(user),
      hasSupabaseAuthCookie,
      cookieDomain: cookieOptions?.domain ?? null,
    });
  }

  // Server Action POSTs use the `next-action` header. Middleware redirects (302 HTML)
  // break the client, which expects `text/x-component` or `x-action-redirect`.
  if (request.headers.get("next-action")) {
    return supabaseResponse;
  }

  // If user is authenticated and trying to access auth pages, redirect to main app.
  // Never redirect away from /auth/callback — OAuth needs this route to exchange ?code= even if a session exists.
  if (
    user &&
    pathname.startsWith("/auth") &&
    !pathname.startsWith("/auth/callback")
  ) {
    if (AUTH_DEBUG) {
      console.info("[auth:middleware] redirect auth user away from auth page", {
        from: pathname,
        to: "/",
      });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return redirectWithSessionCookies(url, supabaseResponse);
  }

  // If user is not authenticated and trying to access protected route, redirect to sign-in
  if (!user && !isPublic) {
    if (AUTH_DEBUG) {
      console.warn("[auth:middleware] redirect unauthenticated user", {
        from: pathname,
        to: "/auth/sign-in",
      });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("redirectedFrom", pathname);
    return redirectWithSessionCookies(url, supabaseResponse);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    supabaseResponse.cookies.getAll().forEach((c) => myNewResponse.cookies.set(c))
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}

