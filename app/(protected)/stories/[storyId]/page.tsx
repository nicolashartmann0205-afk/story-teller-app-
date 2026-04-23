import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { selfReferencingCanonical } from "@/lib/seo/site-metadata";
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
    redirect(AUTH_ROUTES.SIGN_IN);
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storyId: string }>;
}): Promise<Metadata> {
  const { storyId } = await params;
  return selfReferencingCanonical(`/stories/${storyId}`);
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
    <div className="min-h-screen bg-brand-cream dark:bg-brand-ink">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/stories"
            className="group inline-flex items-center text-sm text-brand-ink/85 dark:text-brand-seafoam hover:text-brand-teal dark:hover:text-brand-yellow transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Stories
          </Link>
        </div>

        <div className="space-y-6">
          {/* Main Story Card */}
          <div className="rounded-xl border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 shadow-sm overflow-hidden">
            {/* Header with Title and Management Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 sm:p-8 border-b border-brand-seafoam/25">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-brand-ink dark:text-brand-yellow tracking-tight">
              {story.title}
            </h1>
                <div className="mt-4 prose dark:prose-invert max-w-none">
                  {story.description ? (
                    <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
                      {story.description}
                    </p>
                  ) : (
                    <p className="text-brand-ink/80 dark:text-brand-seafoam italic">
                      No description provided.
                    </p>
                  )}
                </div>
              </div>

              {/* Management Toolbar */}
              <div className="flex items-center gap-2 sm:ml-4">
              <Link
                href={`/stories/${story.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md p-2 text-brand-ink/80 hover:bg-brand-cream hover:text-brand-teal dark:text-brand-seafoam dark:hover:bg-brand-seafoam/15 dark:hover:text-brand-yellow transition-colors"
                  title="Edit Story Details"
              >
                  <Edit className="h-5 w-5" />
                  <span className="sr-only">Edit</span>
              </Link>
              <form action={deleteStoryAction.bind(null, story.id) as any}>
                <button
                  type="submit"
                    className="inline-flex items-center justify-center rounded-md p-2 text-brand-ink/80 hover:bg-red-50 hover:text-red-600 dark:text-brand-seafoam dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    title="Delete Story"
                >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete</span>
                </button>
              </form>
            </div>
          </div>

            {/* Feature Action Grid */}
            <div className="p-6 sm:p-8 bg-brand-cream/60 dark:bg-brand-ink/60">
              <h2 className="text-sm font-semibold text-brand-ink/80 dark:text-brand-seafoam uppercase tracking-wider mb-4">
                Story Development Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href={`/stories/${story.id}/structure`}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-brand-ink/70 rounded-lg border-t-4 border-brand-teal border-x border-b border-brand-seafoam/35 hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-brand-seafoam/20 dark:bg-brand-seafoam/15 text-brand-teal dark:text-brand-yellow mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Layout className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-brand-ink dark:text-brand-yellow">Structure</span>
                  <span className="text-xs text-brand-ink/80 dark:text-brand-seafoam mt-1 text-center">Outline your beats</span>
                </Link>

                <Link
                  href={`/stories/${story.id}/scenes`}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-brand-ink/70 rounded-lg border-t-4 border-brand-orange border-x border-b border-brand-seafoam/35 hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-brand-yellow/25 dark:bg-brand-orange/20 text-brand-orange dark:text-brand-yellow mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Clapperboard className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-brand-ink dark:text-brand-yellow">Scenes</span>
                  <span className="text-xs text-brand-ink/80 dark:text-brand-seafoam mt-1 text-center">Write & organize</span>
                </Link>

                <Link
                  href={`/stories/${story.id}/map`}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-brand-ink/70 rounded-lg border-t-4 border-brand-seafoam border-x border-b border-brand-seafoam/35 hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-brand-seafoam/20 dark:bg-brand-seafoam/15 text-brand-teal dark:text-brand-seafoam mb-3 group-hover:scale-110 transition-transform duration-200">
                    <MapIcon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-brand-ink dark:text-brand-yellow">Visual Map</span>
                  <span className="text-xs text-brand-ink/80 dark:text-brand-seafoam mt-1 text-center">Spatial overview</span>
                </Link>

                <Link
                  href={`/stories/${story.id}/review`}
                  className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-brand-ink/70 rounded-lg border-t-4 border-brand-yellow border-x border-b border-brand-seafoam/35 hover:shadow-lg transition-all duration-200"
                >
                  <div className="p-3 rounded-full bg-brand-yellow/25 dark:bg-brand-yellow/20 text-brand-orange dark:text-brand-yellow mb-3 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-brand-ink dark:text-brand-yellow">Review & Export</span>
                  <span className="text-xs text-brand-ink/80 dark:text-brand-seafoam mt-1 text-center">Polish & download</span>
                </Link>
              </div>
            </div>

            {/* Footer / Metadata */}
            <div className="px-6 py-4 bg-brand-cream/60 dark:bg-brand-ink/70 border-t border-brand-seafoam/35 text-xs text-brand-ink/80 dark:text-brand-seafoam flex justify-between items-center">
              <span>Created on {new Date(story.createdAt).toLocaleDateString()}</span>
              {story.updatedAt && (
                <span>Last updated {new Date(story.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Additional Components like Hooks */}
          <div className="rounded-xl border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 shadow-sm p-6 sm:p-8">
          <StoryHooks storyId={story.id} existingHooks={story.hooks} />
          </div>
        </div>
      </div>
    </div>
  );
}
