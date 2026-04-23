import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { selfReferencingCanonical } from "@/lib/seo/site-metadata";
import Link from "next/link";
import { db } from "@/lib/db";
import { stories, scenes } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { BookOpen, PenTool, TrendingUp, Calendar, ArrowRight, Plus } from "lucide-react";
import { getStyleGuides } from "../style-guide/actions";
import { StyleGuideSelector } from "./style-guide-selector";
import { getRequestUser } from "@/lib/auth/request-user";

export const metadata = selfReferencingCanonical("/dashboard");

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

type DashboardPageProps = {
  searchParams: Promise<{ blogAdmin?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { user, error } = await getRequestUser();

  if (error || !user) {
    redirect(`${AUTH_ROUTES.SIGN_IN}?reason=dashboard-auth`);
  }

  const sp = await searchParams;
  const blogAdminAccessDenied = sp.blogAdmin === "denied";

  const { stats, recentStories } = await getDashboardData(user.id);
  // Fetch style guides for the selector
  const styleGuides = await getStyleGuides().catch(() => []);

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Welcome back";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-brand-ink pb-12">
      {blogAdminAccessDenied && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/40">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="text-sm text-amber-950 dark:text-amber-100">
              <span className="font-medium">Blog admin is restricted.</span> Your account is signed in, but it is not in{" "}
              <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs dark:bg-amber-900/50">BLOG_ADMIN_USER_IDS</code>.
              Your current user id is{" "}
              <code className="break-all rounded bg-amber-100/80 px-1 py-0.5 text-xs dark:bg-amber-900/50">{user.id}</code>
              — add this exact value to that env var locally and on your host, then redeploy.
            </p>
            <Link
              href="/dashboard"
              className="shrink-0 text-sm font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-50"
            >
              Dismiss
            </Link>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="border-b border-brand-seafoam/40 bg-gradient-to-r from-brand-cream via-brand-seafoam/25 to-brand-yellow/20 dark:bg-brand-ink/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-ink dark:text-brand-yellow">
                {greeting}, {user.user_metadata?.display_name || user.email?.split('@')[0] || "Storyteller"}
              </h1>
              <p className="mt-2 text-brand-ink/85 dark:text-brand-seafoam">
                Ready to continue your creative journey?
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              <Link
                href="/create-story"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-teal px-4 py-2.5 text-sm font-medium text-brand-cream transition-colors shadow-sm hover:bg-brand-orange dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
              >
                <Plus className="h-4 w-4" />
                New Story
              </Link>
              <div className="w-full">
                <StyleGuideSelector styleGuides={styleGuides} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 rounded-xl border border-brand-teal/35 bg-white p-6 shadow-sm dark:bg-brand-ink/80">
            <div className="rounded-full bg-brand-teal/20 p-3 text-brand-teal dark:text-brand-yellow">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-ink/80 dark:text-brand-seafoam">Total Stories</p>
              <h3 className="text-2xl font-bold text-brand-ink dark:text-brand-yellow">{stats.totalStories}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-brand-orange/35 bg-white p-6 shadow-sm dark:bg-brand-ink/80">
            <div className="rounded-full bg-brand-orange/20 p-3 text-brand-orange dark:text-brand-yellow">
              <PenTool className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-ink/80 dark:text-brand-seafoam">Total Words</p>
              <h3 className="text-2xl font-bold text-brand-ink dark:text-brand-yellow">{stats.totalWords.toLocaleString()}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-brand-seafoam/45 bg-white p-6 shadow-sm dark:bg-brand-ink/80">
            <div className="rounded-full bg-brand-seafoam/25 p-3 text-brand-teal dark:text-brand-seafoam">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-ink/80 dark:text-brand-seafoam">Writing Streak</p>
              <h3 className="text-2xl font-bold text-brand-ink dark:text-brand-yellow">{stats.streak} Days</h3>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-brand-ink dark:text-brand-yellow">Recent Activity</h2>
            <Link 
              href="/stories" 
              className="text-sm font-medium text-brand-ink/85 dark:text-brand-seafoam hover:text-brand-teal dark:hover:text-brand-yellow flex items-center gap-1"
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
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-brand-seafoam/30 bg-white transition-shadow hover:shadow-md dark:bg-brand-ink/80"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="inline-flex items-center rounded-full border border-brand-orange/40 bg-brand-orange/10 px-2.5 py-0.5 text-xs font-semibold text-brand-orange dark:border-brand-yellow/40 dark:bg-brand-yellow/10 dark:text-brand-yellow">
                        {story.mode === 'quick' ? 'Quick Mode' : 'Comprehensive'}
                      </div>
                      <span className="text-xs text-brand-ink/80 dark:text-brand-seafoam flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-brand-ink dark:text-brand-yellow mb-2 line-clamp-1">
                      {story.title || "Untitled Story"}
                    </h3>
                    
                    <p className="text-sm text-brand-ink/85 dark:text-brand-seafoam line-clamp-3 mb-4">
                      {story.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="mt-auto border-t border-brand-seafoam/30 bg-brand-cream/60 px-6 py-4 dark:bg-brand-ink/60">
                    <Link
                      href={`/stories/${story.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-brand-teal/40 bg-brand-teal/10 px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-teal/20 dark:border-brand-seafoam/40 dark:bg-brand-seafoam/15 dark:text-brand-seafoam dark:hover:bg-brand-seafoam/25"
                    >
                      Continue Writing
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-brand-seafoam/50 bg-brand-cream/60 dark:bg-brand-ink/60 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-seafoam/20">
                <BookOpen className="h-6 w-6 text-brand-teal dark:text-brand-seafoam" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-brand-ink dark:text-brand-yellow">No stories yet</h3>
              <p className="mt-1 text-sm text-brand-ink/85 dark:text-brand-seafoam">
                Get started by creating your first story today.
              </p>
              <div className="mt-6">
                <Link
                  href="/create-story"
                  className="inline-flex items-center rounded-md bg-brand-teal px-3 py-2 text-sm font-semibold text-brand-cream shadow-sm hover:bg-brand-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
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







