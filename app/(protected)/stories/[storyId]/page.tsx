import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import StoryHooks from "./story-hooks";
import { 
  FileText, 
  Layout, 
  Clapperboard, 
  Map as MapIcon, 
  Edit, 
  Trash2, 
  ArrowLeft 
} from "lucide-react";

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/stories"
            className="group inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Stories
          </Link>
        </div>

        <div className="space-y-6">
          {/* Main Story Card */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            {/* Header with Title and Management Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {story.title}
            </h1>
                <div className="mt-4 prose dark:prose-invert max-w-none">
                  {story.description ? (
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {story.description}
                    </p>
                  ) : (
                    <p className="text-zinc-400 dark:text-zinc-600 italic">
                      No description provided.
                    </p>
                  )}
                </div>
              </div>

              {/* Management Toolbar */}
              <div className="flex items-center gap-2 sm:ml-4">
              <Link
                href={`/stories/${story.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
                  title="Edit Story Details"
              >
                  <Edit className="h-5 w-5" />
                  <span className="sr-only">Edit</span>
              </Link>
              <form action={deleteStoryAction.bind(null, story.id) as any}>
                <button
                  type="submit"
                    className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    title="Delete Story"
                >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete</span>
                </button>
              </form>
            </div>
          </div>

            {/* Feature Action Grid */}
            <div className="p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                Story Development Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href={`/stories/${story.id}/structure`}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Layout className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Structure</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">Outline your beats</span>
                </Link>

                <Link
                  href={`/stories/${story.id}/scenes`}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Clapperboard className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Scenes</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">Write & organize</span>
                </Link>

                <Link
                  href={`/stories/${story.id}/map`}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform duration-200">
                    <MapIcon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Visual Map</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">Spatial overview</span>
                </Link>

                <Link
                  href={`/stories/${story.id}/review`}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 mb-3 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Review & Export</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">Polish & download</span>
                </Link>
              </div>
            </div>

            {/* Footer / Metadata */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-500 flex justify-between items-center">
              <span>Created on {new Date(story.createdAt).toLocaleDateString()}</span>
              {story.updatedAt && (
                <span>Last updated {new Date(story.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Additional Components like Hooks */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 sm:p-8">
          <StoryHooks storyId={story.id} existingHooks={story.hooks} />
          </div>
        </div>
      </div>
    </div>
  );
}
