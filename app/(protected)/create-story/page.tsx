import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { generateStory } from "@/lib/ai/story-generator";
import CreateStoryForm from "./create-story-form";

async function createStoryAction(
  previousState: { error?: string } | null,
  formData: FormData
) {
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
    // Generate full story content using Gemini AI
    const generatedStory = await generateStory(title, description || "");

    await db.insert(stories).values({
      userId: user.id,
      title: title.trim(),
      description: generatedStory, // Save the full AI generated story instead of the short description
    });

    redirect("/");
  } catch (error) {
    console.error("Error creating story:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create story";
    return { error: errorMessage };
  }
}

export default function CreateStoryPage() {
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
            Create New Story
          </h1>

          <CreateStoryForm createStoryAction={createStoryAction} />
        </div>
      </div>
    </div>
  );
}

