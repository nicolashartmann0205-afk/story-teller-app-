import { isDirectPostgresConnectionError } from "@/lib/db/supabase-fallback";

/** Try Postgres first; on direct connection failure, use Supabase PostgREST fallback. */
export async function withPostgresOrSupabase<T>(
  postgres: () => Promise<T>,
  supabase: () => Promise<T>
): Promise<T> {
  try {
    return await postgres();
  } catch (error) {
    if (isDirectPostgresConnectionError(error)) {
      return supabase();
    }
    throw error;
  }
}
