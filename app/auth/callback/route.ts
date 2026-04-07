import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { safeRelativeNextPath } from "@/lib/auth/safe-next-path";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

const DEFAULT_NEXT = "/dashboard";

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
    return redirectSignInOauthError();
  }

  const response = NextResponse.redirect(destination);

  const cookieOptions = getSupabaseCookieOptions({
    host: url.hostname,
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
    return redirectSignInOauthError();
  }

  return response;
}
