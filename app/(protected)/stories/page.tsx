import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
      .select({
        id: stories.id,
        title: stories.title,
        description: stories.description,
        createdAt: stories.createdAt,
      })
      .from(stories)
      .where(eq(stories.userId, user.id))
      .orderBy(desc(stories.createdAt));
    
    // Explicitly check for potential nulls or serialization issues in development
    const sanitizedStories = userStories.map(s => ({
        ...s,
        title: s.title || "Untitled",
        description: s.description || "",
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date()
    }));

    return { stories: sanitizedStories, error: null };
  } catch (error) {
    console.error("Error fetching stories from DB:", error);
    return { 
      stories: [], 
      error: "Error loading stories from database." 
    };
  }
}

async function handleSignOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}

async function deleteStoryAction(storyId: string) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/sign-in");
  }

  try {
    await db
      .delete(stories)
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
      
    revalidatePath("/stories");
  } catch (error) {
    console.error("Error deleting story:", error);
    // In a real app we might want to return an error state
    return;
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

  // If not authenticated, redirect to sign-in
  if (!user || userError) {
    redirect("/auth/sign-in");
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
    // In dev, show the full error stack to help debugging
    const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
    storiesError = process.env.NODE_ENV === "development" 
      ? `Dev Error: ${errorMessage}`
      : "Error loading stories. Could not connect to the API.";
    storiesList = [];
  }

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
              href="/dashboard"
              className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Dashboard
            </Link>
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
                <div
                  key={story.id}
                  className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-lg transition-shadow flex flex-col"
                >
                  <Link href={`/stories/${story.id}`} className="flex-1 block">
                    <div>
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
                    </div>
                  </Link>
                  <div className="mt-4 flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                      href={`/stories/${story.id}/edit`}
                      className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </Link>
                    <form action={deleteStoryAction.bind(null, story.id) as any} className="flex-1">
                      <button
                        type="submit"
                        className="w-full rounded-md border border-red-300 dark:border-red-700 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

