import Link from "next/link";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

export async function generateMetadata() {
  return buildDynamicPageMetadata("team", {
    title: "Team - meet Story Teller builders",
    description:
      "Meet the Story Teller team building practical tools for structure, scene planning, and revision momentum. See who we are and what we're building. Learn more.",
    canonicalPath: "/team",
  });
}

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-brand-cream dark:bg-brand-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-brand-ink dark:text-brand-yellow">Team</h1>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          We are a small product team focused on helping writers finish more stories with less process overhead.
        </p>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          Story Teller combines product design, narrative craft, and engineering to support real creative workflows.
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
