import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

export function createClient() {
  const cookieOptions = getSupabaseCookieOptions();

  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      ...(cookieOptions ? { cookieOptions } : {}),
    }
  );
}

