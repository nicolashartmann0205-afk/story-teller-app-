import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAppUrl } from "@/lib/config/env";

import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

async function getStories() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { stories: [], error: "Unauthorized" };
    }

    const userStories = await db
      .select()
      .from(stories)
      .where(eq(stories.userId, user.id))
      .orderBy(desc(stories.createdAt));

    return { stories: userStories, error: null };
  } catch (error) {
    console.error("Error fetching stories from DB:", error);
    return { 
      stories: [], 
      error: "Error loading stories from database." 
    };
  }
}

export default async function StoriesPage() {
  let user: { email?: string | null } | null = null;
  let userError: Error | null = null;
  
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      userError = authError;
      console.error("Error getting user:", authError);
    } else {
      user = authUser;
    }
  } catch (error) {
    userError = error instanceof Error ? error : new Error("Unknown authentication error");
    console.error("Error in authentication check:", error);
  }

  // If not authenticated, redirect to sign-in (middleware should handle this, but double-check)
  if (!user || userError) {
    try {
      redirect("/auth/sign-in");
    } catch (redirectError) {
      // If redirect fails, show error UI instead
      console.error("Redirect failed:", redirectError);
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-12 text-center">
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
                Authentication Required
              </h2>
              <p className="text-lg text-red-600 dark:text-red-300 mb-4">
                Please sign in to view your stories.
              </p>
              <Link
                href="/auth/sign-in"
                className="inline-block rounded-md bg-black dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Fetch stories with defensive error handling
  let storiesList: Array<{ id: string; title: string; description: string | null; createdAt: Date | string }> = [];
  let storiesError: string | null = null;

  try {
    const result = await getStories();
    storiesList = Array.isArray(result.stories) ? result.stories : [];
    storiesError = result.error;
  } catch (error) {
    // Final catch for any unexpected errors in getStories
    console.error("Unexpected error in getStories:", error);
    storiesError = "Error loading stories. Could not connect to the API.";
    storiesList = [];
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/sign-in");
  };

  // Render the page with proper error handling
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
              My Stories
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Welcome back, {user?.email || "User"}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/create-story"
              className="rounded-md bg-black dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Create Story
            </Link>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Display error message if stories failed to load */}
        {storiesError && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-12 text-center">
            <div className="text-lg text-red-600 dark:text-red-300">
              Error loading stories. Could not connect to the API.
            </div>
            {storiesError && (
              <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                {storiesError}
              </div>
            )}
          </div>
        )}

        {/* Empty state - no stories and no error (successful empty response) */}
        {!storiesError && storiesList.length === 0 && (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
            <div className="text-lg text-zinc-600 dark:text-zinc-400">
              You haven't created any stories yet. Start writing!
            </div>
            <Link
              href="/create-story"
              className="mt-6 inline-block rounded-md bg-black dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Create your first story
            </Link>
          </div>
        )}

        {/* Stories list - show if we have stories (even if there was a warning/error) */}
        {storiesList.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {storiesList
              .filter((story) => story && story.id && story.title) // Filter out invalid stories
              .map((story: { id: string; title: string; description: string | null; createdAt: Date | string }) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-black dark:text-zinc-50 group-hover:underline">
                    {story.title}
                  </h3>
                  {story.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {story.description}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                    {story.createdAt 
                      ? new Date(story.createdAt).toLocaleDateString() 
                      : "Unknown date"}
                  </p>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

