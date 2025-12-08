import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import StoryHooks from "./story-hooks";

async function getStory(storyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
    .limit(1);

  return story || null;
}

async function deleteStoryAction(storyId: string, formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  try {
    await db
      .delete(stories)
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));
  } catch (error) {
    console.error("Error deleting story:", error);
    throw new Error("Failed to delete story");
  }

  redirect("/");
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  const story = await getStory(storyId);

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            ← Back to Stories
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
              {story.title}
            </h1>
            <div className="flex gap-2">
              <Link
                href={`/stories/${story.id}/map`}
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <span>🗺️</span> Visual Map
              </Link>
              <Link
                href={`/stories/${story.id}/edit`}
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Edit
              </Link>
              <form action={deleteStoryAction.bind(null, story.id) as any}>
                <button
                  type="submit"
                  className="rounded-md border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>

          {story.description && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {story.description}
              </p>
            </div>
          )}

          <StoryHooks storyId={story.id} existingHooks={story.hooks} />

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Created on {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

