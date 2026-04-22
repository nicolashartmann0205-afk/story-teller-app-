import Link from "next/link";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";
import { FeedbackForm } from "./feedback-form";
import { submitFeedbackAction } from "./actions";

export async function generateMetadata() {
  return buildDynamicPageMetadata("feedback", {
    title: "Feedback - Story Teller",
    description:
      "Submit product feedback and report bugs directly from the Story Teller website.",
    canonicalPath: "/feedback",
  });
}

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Share feedback</h1>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Send feedback or report a bug. Your message goes directly into our private admin review queue.
          </p>
        </div>

        <FeedbackForm submitAction={submitFeedbackAction} />
        <Link href="/" className="text-sm underline underline-offset-2 text-zinc-700 dark:text-zinc-300">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
