import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { safeRelativeNextPath } from "@/lib/auth/safe-next-path";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

const DEFAULT_NEXT = "/dashboard";
const AUTH_DEBUG = process.env.AUTH_DEBUG === "1";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const safeNext = safeRelativeNextPath(url.searchParams.get("next"));
  const destination = new URL(safeNext, url.origin);
  const cookieOptions = getSupabaseCookieOptions({
    host: url.hostname,
  });

  if (AUTH_DEBUG) {
    console.info("[auth:callback] incoming", {
      host: url.host,
      origin: url.origin,
      pathname: url.pathname,
      hasCode: Boolean(code),
      safeNext,
      destination: destination.toString(),
      cookieDomain: cookieOptions?.domain ?? null,
    });
  }

  if (destination.origin !== url.origin) {
    if (AUTH_DEBUG) {
      console.warn("[auth:callback] blocked cross-origin next", {
        next: url.searchParams.get("next"),
        origin: url.origin,
        destinationOrigin: destination.origin,
      });
    }
    return NextResponse.redirect(new URL(DEFAULT_NEXT, url.origin));
  }

  const redirectSignInOauthError = () =>
    NextResponse.redirect(new URL("/auth/sign-in?error=oauth", url.origin));

  if (!code) {
    if (AUTH_DEBUG) {
      console.warn("[auth:callback] missing code");
    }
    return redirectSignInOauthError();
  }

  const response = NextResponse.redirect(destination);

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
      ...(cookieOptions ? { cookieOptions } : {}),
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    if (AUTH_DEBUG) {
      console.error("[auth:callback] exchange failed", {
        message: error.message,
      });
    }
    return redirectSignInOauthError();
  }

  if (AUTH_DEBUG) {
    console.info("[auth:callback] exchange success", {
      destination: destination.toString(),
      setCookieCount: response.cookies.getAll().length,
    });
  }

  return response;
}
