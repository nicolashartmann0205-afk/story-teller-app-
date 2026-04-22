import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

function hostnameFromHostHeader(host: string | null): string | undefined {
  if (!host) return undefined;
  const hostname = host.split(":")[0]?.trim().toLowerCase();
  return hostname || undefined;
}

/**
 * Supabase client for Server Actions that must persist auth cookies/PKCE verifier.
 * Unlike the generic server client, this does not swallow cookie write errors.
 */
export async function createActionClient() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const cookieOptions = getSupabaseCookieOptions({
    host: hostnameFromHostHeader(headerList.get("host")),
  });

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
    ...(cookieOptions ? { cookieOptions } : {}),
  });
}
