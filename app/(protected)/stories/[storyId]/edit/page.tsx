import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/config/env";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import EditStoryForm from "./edit-story-form";

async function getStory(storyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch story and verify ownership
  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
    .limit(1);

  return story || null;
}

async function updateStoryAction(
  storyId: string,
  previousState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  try {
    await db
      .update(stories)
      .set({
        title: title.trim(),
        description: description?.trim() || null,
        updatedAt: new Date(),
      })
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));

    redirect("/");
  } catch (error) {
    console.error("Error updating story:", error);
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return { error: "Failed to update story" };
  }
  
  return null;
}

export default async function EditStoryPage({
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
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-6">
            Edit Story
          </h1>

          <EditStoryForm
            story={story}
            updateStoryAction={updateStoryAction.bind(null, storyId)}
          />
        </div>
      </div>
    </div>
  );
}

