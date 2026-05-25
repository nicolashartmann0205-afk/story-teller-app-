import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

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

async function getSupabaseClientForUserData(userId: string): Promise<SupabaseClient> {
  const anon = (await createClient()) as unknown as SupabaseClient;
  const {
    data: { user },
  } = await anon.auth.getUser();

  if (user?.id === userId) {
    return anon;
  }

  const service = getServiceRoleClient();
  if (service) {
    return service;
  }

  return anon;
}

/** Load dashboard metrics via PostgREST (works when POOLING_DATABASE_URL on Vercel is wrong). */
export async function getDashboardDataViaSupabase(
  userId: string
): Promise<{ stats: DashboardStats; recentStories: DashboardStoryRow[] }> {
  const supabase = await getSupabaseClientForUserData(userId);

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
  const supabase = await getSupabaseClientForUserData(userId);
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

function messageIncludesPostgresFailure(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("failed query") ||
    lower.includes("password authentication") ||
    lower.includes("invalid url") ||
    lower.includes("database_not_configured") ||
    lower.includes("econnrefused") ||
    lower.includes("connect_timeout") ||
    lower.includes("127.0.0.1") ||
    lower.includes("tenant or user not found")
  );
}

export function isDirectPostgresConnectionError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && !seen.has(current)) {
    seen.add(current);
    if (current instanceof Error) {
      if (messageIncludesPostgresFailure(current.message)) {
        return true;
      }
      current = current.cause;
      continue;
    }
    if (typeof current === "object" && current !== null && "message" in current) {
      const msg = String((current as { message: unknown }).message);
      if (messageIncludesPostgresFailure(msg)) {
        return true;
      }
    }
    break;
  }

  return false;
}
