"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileText, Layout, Clapperboard, Map as MapIcon, Edit, ArrowLeft, Trash2 } from "lucide-react";
import { AUTH_ROUTES } from "@/lib/auth/routes";

const StoryHooks = dynamic(() => import("./story-hooks"), {
  ssr: false,
});

type StoryRecord = {
  id: string;
  title: string | null;
  description: string | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
  hooks?: unknown;
};

type StoryResponse = {
  story?: StoryRecord;
  error?: string;
};

function coerceText(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function formatDateLabel(value: unknown): string {
  if (!value) {
    return "Unknown date";
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString();
}

export default function StoryPageClient({ storyId }: { storyId?: string }) {
  const router = useRouter();
  const [story, setStory] = useState<StoryRecord | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "not-found" | "unauthorized" | "error">(
    "loading"
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStory() {
      if (!storyId || !storyId.trim()) {
        setStatus("not-found");
        return;
      }

      setStatus("loading");

      try {
        const response = await fetch(`/api/stories/${encodeURIComponent(storyId)}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as StoryResponse;

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          setStatus("unauthorized");
          return;
        }

        if (response.status === 404) {
          setStatus("not-found");
          return;
        }

        if (!response.ok || !data.story) {
          setStatus("error");
          return;
        }

        setStory(data.story);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("[STORY_PAGE_CLIENT][LOAD_FAILED]", error);
          setStatus("error");
        }
      }
    }

    void loadStory();
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  const storyTitle = coerceText(story?.title, "Untitled story");
  const storyDescription =
    typeof story?.description === "string" ? story.description.trim() : "";
  const existingHooks =
    story && typeof story.hooks === "object" && story.hooks !== null && !Array.isArray(story.hooks)
      ? (story.hooks as Record<string, unknown>)
      : null;

  async function handleDeleteStory() {
    if (!story || isDeleting) return;
    const shouldDelete = window.confirm("Delete this story? This action cannot be undone.");
    if (!shouldDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stories/${encodeURIComponent(story.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete story");
      }

      router.push("/stories");
      router.refresh();
    } catch (error) {
      console.error("[STORY_PAGE_CLIENT][DELETE_FAILED]", error);
      alert("Failed to delete story. Please try again.");
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-brand-seafoam/30 bg-white p-6 dark:bg-brand-ink/80">
            <p className="text-sm text-brand-ink/80 dark:text-brand-seafoam">Loading story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-brand-seafoam/30 bg-white p-6 dark:bg-brand-ink/80">
            <h1 className="text-xl font-semibold text-brand-ink dark:text-brand-yellow">Please sign in</h1>
            <Link
              href={AUTH_ROUTES.SIGN_IN}
              className="mt-4 inline-flex items-center rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "not-found" || !story) {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-brand-seafoam/30 bg-white p-6 dark:bg-brand-ink/80">
            <h1 className="text-xl font-semibold text-brand-ink dark:text-brand-yellow">Story not found</h1>
            <Link
              href="/stories"
              className="mt-4 inline-flex items-center rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
            >
              Back to Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-brand-ink">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-300/60 bg-white p-6 dark:bg-brand-ink/80">
            <h1 className="text-xl font-semibold text-red-700 dark:text-red-300">
              We could not load this story right now
            </h1>
            <Link
              href="/stories"
              className="mt-4 inline-flex items-center rounded-md bg-brand-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand-teal dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
            >
              Back to Stories
            </Link>
          </div>
        </div>
      </div>
    );
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
          <div className="rounded-xl border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 sm:p-8 border-b border-brand-seafoam/25">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-brand-ink dark:text-brand-yellow tracking-tight">
                  {storyTitle}
                </h1>
                <div className="mt-4 prose dark:prose-invert max-w-none">
                  {storyDescription ? (
                    <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">{storyDescription}</p>
                  ) : (
                    <p className="text-brand-ink/80 dark:text-brand-seafoam italic">No description provided.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-4">
                <Link
                  href={`/stories/${story.id}/edit`}
                  className="inline-flex items-center justify-center rounded-md p-2 text-brand-ink/80 hover:bg-brand-cream hover:text-brand-teal dark:text-brand-seafoam dark:hover:bg-brand-seafoam/15 dark:hover:text-brand-yellow transition-colors"
                  title="Edit Story Details"
                >
                  <Edit className="h-5 w-5" />
                  <span className="sr-only">Edit</span>
                </Link>
                <button
                  type="button"
                  onClick={handleDeleteStory}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-md p-2 text-brand-ink/80 hover:bg-red-50 hover:text-red-600 dark:text-brand-seafoam dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Delete Story"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">{isDeleting ? "Deleting" : "Delete"}</span>
                </button>
              </div>
            </div>

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

            <div className="px-6 py-4 bg-brand-cream/60 dark:bg-brand-ink/70 border-t border-brand-seafoam/35 text-xs text-brand-ink/80 dark:text-brand-seafoam flex justify-between items-center">
              <span>Created on {formatDateLabel(story.createdAt)}</span>
              {story.updatedAt && <span>Last updated {formatDateLabel(story.updatedAt)}</span>}
            </div>
          </div>

          <div className="rounded-xl border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 shadow-sm p-6 sm:p-8">
            <StoryHooks storyId={story.id} existingHooks={existingHooks} />
          </div>
        </div>
      </div>
    </div>
  );
}
