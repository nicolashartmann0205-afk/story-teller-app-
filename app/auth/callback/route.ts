import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { safeRelativeNextPath } from "@/lib/auth/safe-next-path";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

const DEFAULT_NEXT = "/dashboard";
const AUTH_DEBUG = process.env.AUTH_DEBUG === "1";

function setAuthDebugHeader(response: NextResponse, key: string, value: string | boolean) {
  if (!AUTH_DEBUG) return;
  response.headers.set(`x-auth-debug-${key}`, String(value));
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const safeNext = safeRelativeNextPath(url.searchParams.get("next"));
  const destination = new URL(safeNext, url.origin);

  if (destination.origin !== url.origin) {
    return NextResponse.redirect(new URL(DEFAULT_NEXT, url.origin));
  }

  const redirectSignInOauthError = () =>
    NextResponse.redirect(new URL("/auth/sign-in?error=oauth", url.origin));

  if (!code) {
    const errorResponse = redirectSignInOauthError();
    setAuthDebugHeader(errorResponse, "callback-host", url.host);
    setAuthDebugHeader(errorResponse, "callback-code-present", false);
    return errorResponse;
  }

  const response = NextResponse.redirect(destination);
  const hasSupabaseCookieInRequest = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("sb-"));
  setAuthDebugHeader(response, "callback-host", url.host);
  setAuthDebugHeader(response, "callback-next", safeNext);
  setAuthDebugHeader(response, "callback-code-present", true);
  setAuthDebugHeader(response, "request-had-sb-cookie", hasSupabaseCookieInRequest);

  const cookieOptions = getSupabaseCookieOptions({
    host: url.hostname,
  });
  setAuthDebugHeader(response, "cookie-domain", cookieOptions?.domain || "host-only");

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
    const errorResponse = redirectSignInOauthError();
    setAuthDebugHeader(errorResponse, "callback-host", url.host);
    setAuthDebugHeader(errorResponse, "exchange-error", true);
    setAuthDebugHeader(errorResponse, "exchange-message", error.message);
    return errorResponse;
  }

  const wroteSupabaseCookie = response.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("sb-"));
  setAuthDebugHeader(response, "wrote-sb-cookie", wroteSupabaseCookie);

  return response;
}
