import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { stories, scenes } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { BookOpen, PenTool, TrendingUp, Calendar, ArrowRight, Plus } from "lucide-react";

async function getDashboardData(userId: string) {
  // 1. Get total stories count
  const [storiesCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(stories)
    .where(eq(stories.userId, userId));
  
  const totalStories = Number(storiesCountResult?.count || 0);

  // 2. Get total word count (sum of all scenes for user's stories)
  // We join scenes with stories to filter by userId
  const [wordCountResult] = await db
    .select({ count: sql<number>`sum(${scenes.wordCount})` })
    .from(scenes)
    .innerJoin(stories, eq(scenes.storyId, stories.id))
    .where(eq(stories.userId, userId));
    
  const totalWords = Number(wordCountResult?.count || 0);

  // 3. Get recent stories (limit 3)
  const recentStories = await db
    .select({
      id: stories.id,
      title: stories.title,
      description: stories.description,
      updatedAt: stories.updatedAt,
      mode: stories.mode,
      // We can also try to get word count per story here if needed, but let's keep it simple
    })
    .from(stories)
    .where(eq(stories.userId, userId))
    .orderBy(desc(stories.updatedAt))
    .limit(3);

  // 4. Calculate streak (mock implementation for now as we don't have a daily activity log table yet)
  // Logic: distinct days in the last 7 days where updated_at exists? 
  // For MVP, let's just use a placeholder or simple logic based on recent activity.
  const streak = 0; // Placeholder for now

  return {
    stats: {
      totalStories,
      totalWords,
      streak,
      completionRate: 0, // Placeholder
    },
    recentStories,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/sign-in");
  }

  const { stats, recentStories } = await getDashboardData(user.id);

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Welcome back";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black pb-12">
      {/* Header Section */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
                {greeting}, {user.user_metadata?.display_name || user.email?.split('@')[0] || "Storyteller"}
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Ready to continue your creative journey?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/create-story"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-black dark:bg-zinc-50 px-4 py-2.5 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Story
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Stories</p>
              <h3 className="text-2xl font-bold text-black dark:text-zinc-50">{stats.totalStories}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <PenTool className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Words</p>
              <h3 className="text-2xl font-bold text-black dark:text-zinc-50">{stats.totalWords.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Writing Streak</p>
              <h3 className="text-2xl font-bold text-black dark:text-zinc-50">{stats.streak} Days</h3>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black dark:text-zinc-50">Recent Activity</h2>
            <Link 
              href="/stories" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 flex items-center gap-1"
            >
              View all stories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentStories.map((story) => (
                <div 
                  key={story.id} 
                  className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {story.mode === 'quick' ? 'Quick Mode' : 'Comprehensive'}
                      </div>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-black dark:text-zinc-50 mb-2 line-clamp-1">
                      {story.title || "Untitled Story"}
                    </h3>
                    
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4">
                      {story.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
                    <Link
                      href={`/stories/${story.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Continue Writing
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <BookOpen className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">No stories yet</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Get started by creating your first story today.
              </p>
              <div className="mt-6">
                <Link
                  href="/create-story"
                  className="inline-flex items-center rounded-md bg-black dark:bg-zinc-50 px-3 py-2 text-sm font-semibold text-white dark:text-black shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  Create Story
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


