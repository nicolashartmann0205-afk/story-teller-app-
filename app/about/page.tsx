import Link from "next/link";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

export async function generateMetadata() {
  return buildDynamicPageMetadata("about", {
    title: "About Story Teller - mission & product",
    description:
      "Learn how Story Teller helps writers move from idea to draft with structure, scene planning, and revision workflows. Explore the mission and learn more.",
    canonicalPath: "/about",
  });
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-cream dark:bg-brand-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-brand-ink dark:text-brand-yellow">About Story Teller</h1>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          Story Teller helps writers move from rough idea to finished draft with clear structure, scene planning, and review workflows.
        </p>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          We build tools for practical storytelling: less friction, more momentum, and better visibility into the shape of your story.
        </p>
        <Link
          href="/"
          className="text-sm underline underline-offset-2 text-brand-teal dark:text-brand-yellow hover:text-brand-ink dark:hover:text-brand-seafoam focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-teal focus-visible:ring-offset-0 focus-visible:ring-offset-brand-cream dark:focus-visible:ring-brand-yellow dark:focus-visible:ring-offset-brand-ink"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
