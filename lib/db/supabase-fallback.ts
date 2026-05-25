import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalStories: number;
  totalWords: number;
  streak: number;
  completionRate: number;
};

export type DashboardStoryRow = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: Date;
  mode: "quick" | "comprehensive" | null;
};

export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  return createClient() as unknown as SupabaseClient;
}

/** Load dashboard metrics via PostgREST + user JWT (no POOLING_DATABASE_URL). */
export async function getDashboardDataViaSupabase(
  userId: string
): Promise<{ stats: DashboardStats; recentStories: DashboardStoryRow[] }> {
  const supabase = await getSupabaseServerClient();

  const { count: totalStories, error: countError } = await supabase
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw countError;
  }

  const { data: recentRows, error: recentError } = await supabase
    .from("stories")
    .select("id, title, description, updated_at, mode")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(3);

  if (recentError) {
    throw recentError;
  }

  const { data: storyIds, error: idsError } = await supabase
    .from("stories")
    .select("id")
    .eq("user_id", userId);

  if (idsError) {
    throw idsError;
  }

  let totalWords = 0;
  const ids = (storyIds ?? []).map((row) => row.id);
  if (ids.length > 0) {
    const { data: sceneRows, error: scenesError } = await supabase
      .from("scenes")
      .select("word_count")
      .in("story_id", ids);

    if (scenesError) {
      throw scenesError;
    }

    totalWords = (sceneRows ?? []).reduce(
      (sum, row) => sum + Number(row.word_count ?? 0),
      0
    );
  }

  return {
    stats: {
      totalStories: totalStories ?? 0,
      totalWords,
      streak: 0,
      completionRate: 0,
    },
    recentStories: (recentRows ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      updatedAt: new Date(row.updated_at),
      mode: (row.mode as "quick" | "comprehensive" | null) ?? null,
    })),
  };
}

export async function getUserCreditBalanceViaSupabase(userId: string): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.balance ?? 0;
}

export function isDirectPostgresConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("failed query") ||
    message.includes("password authentication") ||
    message.includes("invalid url") ||
    message.includes("database_not_configured") ||
    message.includes("econnrefused") ||
    message.includes("connect_timeout") ||
    message.includes("127.0.0.1")
  );
}
