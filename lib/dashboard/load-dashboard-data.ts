import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { stories, scenes } from "@/lib/db/schema";
import { shouldPreferSupabaseOverPostgres } from "@/lib/db/pooling-url-health";
import {
  getDashboardDataViaSupabase,
  isDirectPostgresConnectionError,
  type DashboardStats,
  type DashboardStoryRow,
} from "@/lib/db/supabase-fallback";

export type DashboardData = {
  stats: DashboardStats;
  recentStories: DashboardStoryRow[];
  usedSupabaseFallback: boolean;
};

async function getDashboardDataViaPostgres(userId: string): Promise<DashboardData> {
  const [storiesCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(stories)
    .where(eq(stories.userId, userId));

  const totalStories = Number(storiesCountResult?.count || 0);

  const [wordCountResult] = await db
    .select({ count: sql<number>`sum(${scenes.wordCount})` })
    .from(scenes)
    .innerJoin(stories, eq(scenes.storyId, stories.id))
    .where(eq(stories.userId, userId));

  const totalWords = Number(wordCountResult?.count || 0);

  const recentStories = await db
    .select({
      id: stories.id,
      title: stories.title,
      description: stories.description,
      updatedAt: stories.updatedAt,
      mode: stories.mode,
    })
    .from(stories)
    .where(eq(stories.userId, userId))
    .orderBy(desc(stories.updatedAt))
    .limit(3);

  return {
    stats: {
      totalStories,
      totalWords,
      streak: 0,
      completionRate: 0,
    },
    recentStories,
    usedSupabaseFallback: false,
  };
}

async function loadViaSupabase(userId: string): Promise<DashboardData> {
  const fallback = await getDashboardDataViaSupabase(userId);
  return { ...fallback, usedSupabaseFallback: true };
}

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  if (shouldPreferSupabaseOverPostgres()) {
    return loadViaSupabase(userId);
  }

  try {
    return await getDashboardDataViaPostgres(userId);
  } catch (error) {
    if (!isDirectPostgresConnectionError(error)) {
      throw error;
    }
    try {
      return await loadViaSupabase(userId);
    } catch (fallbackError) {
      console.error("Dashboard Supabase fallback failed", fallbackError);
      throw error;
    }
  }
}
