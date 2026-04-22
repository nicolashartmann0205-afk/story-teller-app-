import Link from "next/link";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";
import { FeedbackForm } from "./feedback-form";
import { submitFeedbackAction } from "./actions";

export async function generateMetadata() {
  return buildDynamicPageMetadata("feedback", {
    title: "Feedback - Story Teller",
    description:
      "Submit product feedback, report bugs, or share IT support context directly from the Story Teller website.",
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
            Send feedback, report a bug, or describe a support issue. Your message goes directly into our private admin review queue.
          </p>
        </div>

        <FeedbackForm submitAction={submitFeedbackAction} />

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Need live troubleshooting?{" "}
          <Link href="/support-agent" className="underline underline-offset-2">
            Open the IT support agent
          </Link>
          .
        </div>

        <Link href="/support" className="text-sm underline underline-offset-2 text-zinc-700 dark:text-zinc-300">
          ← Back to support
        </Link>
      </div>
    </main>
  );
}
