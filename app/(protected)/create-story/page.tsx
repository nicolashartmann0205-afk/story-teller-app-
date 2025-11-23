import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CreateStoryForm from "./create-story-form";

async function createStoryAction(formData: FormData) {
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
    // Use the API route as requested
    // Using absolute URL to ensure proper routing - cookies will be forwarded automatically
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/stories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description?.trim() || null,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || "Failed to create story" };
    }

    redirect("/");
  } catch (error) {
    console.error("Error creating story:", error);
    return { error: "Failed to create story" };
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

