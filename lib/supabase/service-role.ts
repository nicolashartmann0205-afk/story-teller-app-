import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/config/env";

let cached: SupabaseClient | null | undefined;

/** Server-only client that bypasses RLS — use only with an explicit user_id filter. */
export function getServiceRoleClient(): SupabaseClient | null {
  if (cached !== undefined) {
    return cached;
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    cached = null;
    return null;
  }

  try {
    cached = createSupabaseClient(getSupabaseUrl(), key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return cached;
  } catch {
    cached = null;
    return null;
  }
}
