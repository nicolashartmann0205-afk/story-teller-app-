import { shouldPreferSupabaseOverPostgres } from "@/lib/db/pooling-url-health";
import { isDirectPostgresConnectionError } from "@/lib/db/supabase-fallback";

/** Run Postgres unless the pooler URL is broken; on connection failure, use Supabase PostgREST. */
export async function withPostgresOrSupabase<T>(
  postgres: () => Promise<T>,
  supabase: () => Promise<T>
): Promise<T> {
  if (shouldPreferSupabaseOverPostgres()) {
    return supabase();
  }

  try {
    return await postgres();
  } catch (error) {
    if (isDirectPostgresConnectionError(error)) {
      return supabase();
    }
    throw error;
  }
}
