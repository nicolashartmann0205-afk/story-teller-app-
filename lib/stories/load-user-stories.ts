import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { withPostgresOrSupabase } from "@/lib/db/postgres-or-supabase";
import {
  getUserStoriesListViaSupabase,
  type UserStoryListRow,
} from "@/lib/db/supabase-fallback";

async function loadViaPostgres(userId: string): Promise<UserStoryListRow[]> {
  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      description: stories.description,
      createdAt: stories.createdAt,
    })
    .from(stories)
    .where(eq(stories.userId, userId))
    .orderBy(desc(stories.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title || "Untitled",
    description: row.description,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
  }));
}

export async function loadUserStories(userId: string): Promise<UserStoryListRow[]> {
  return withPostgresOrSupabase(
    () => loadViaPostgres(userId),
    () => getUserStoriesListViaSupabase(userId)
  );
}
