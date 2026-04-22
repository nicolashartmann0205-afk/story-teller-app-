import Link from "next/link";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

const SUPPORT_EMAIL = "hello@storyinthemaking.com";

export async function generateMetadata() {
  return buildDynamicPageMetadata("support", {
    title: "Feedback & support - Story Teller",
    description:
      "Send product feedback, get help with bugs, IT or sign-in issues, and find guides. Contact Story Teller for support without friction.",
    canonicalPath: "/support",
  });
}

export default function SupportPage() {
  const feedbackMail = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Story Teller product feedback")}`;
  const helpMail = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Story Teller support request")}`;
  const itMail = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Story Teller IT support")}`;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Feedback & support</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          We read every message. Use the options below for product ideas, bug reports, account issues, or IT and technical problems (sign-in, browser, or connectivity).
        </p>

        <section className="space-y-3" aria-labelledby="feedback-heading">
          <h2 id="feedback-heading" className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Product feedback
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Tell us what would make Story Teller better—features, workflows, or rough edges. Email{" "}
            <a className="underline" href={feedbackMail}>
              {SUPPORT_EMAIL}
            </a>{" "}
            (subject line is pre-filled).
          </p>
        </section>

        <section className="space-y-3" aria-labelledby="help-heading">
          <h2 id="help-heading" className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Help & bugs
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            For broken behavior, errors, or account access, write to{" "}
            <a className="underline" href={helpMail}>
              {SUPPORT_EMAIL}
            </a>{" "}
            with a short description of what happened. Include your account email so we can respond quickly.
          </p>
        </section>

        <section className="space-y-3" aria-labelledby="it-heading">
          <h2 id="it-heading" className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            IT support
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            For sign-in trouble, browser compatibility, loading or connectivity issues, or anything that smells like a device or network problem, email{" "}
            <a className="underline" href={itMail}>
              {SUPPORT_EMAIL}
            </a>{" "}
            with what you tried and what you see (screenshots help). Include your account email when relevant.
          </p>
        </section>

        <section className="space-y-3" aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Guides
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Browse our{" "}
            <Link href="/blogs" className="underline underline-offset-2 text-zinc-800 dark:text-zinc-200">
              blogs and articles
            </Link>{" "}
            for how-tos and product tips.
          </p>
        </section>

        <section className="space-y-3" aria-labelledby="other-heading">
          <h2 id="other-heading" className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Partnerships & general contact
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            For partnerships or anything that is not feedback or technical support, use the{" "}
            <Link href="/contact" className="underline underline-offset-2 text-zinc-800 dark:text-zinc-200">
              contact page
            </Link>
            .
          </p>
        </section>

        <Link href="/" className="text-sm underline underline-offset-2 text-zinc-700 dark:text-zinc-300">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
