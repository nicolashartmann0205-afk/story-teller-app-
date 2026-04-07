import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

function hostnameFromHostHeader(host: string | null): string | undefined {
  if (!host) return undefined;
  const hostname = host.split(":")[0]?.trim().toLowerCase();
  return hostname || undefined;
}

export async function createClient() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const cookieOptions = getSupabaseCookieOptions({
    host: hostnameFromHostHeader(headerList.get("host")),
  });

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      ...(cookieOptions ? { cookieOptions } : {}),
    }
  );
}

