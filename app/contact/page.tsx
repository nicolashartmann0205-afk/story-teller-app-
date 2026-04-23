import Link from "next/link";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

export async function generateMetadata() {
  return buildDynamicPageMetadata("contact", {
    title: "Contact - support & partnerships",
    description:
      "Contact Story Teller for support, partnerships, or product help. Share your question and we'll point you to the right workflow. Reach out and learn more.",
    canonicalPath: "/contact",
  });
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-cream dark:bg-brand-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-brand-ink dark:text-brand-yellow">Contact</h1>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          Need help or want to talk? Reach us at{" "}
          <a
            className="underline text-brand-teal dark:text-brand-yellow hover:text-brand-ink dark:hover:text-brand-seafoam focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-teal focus-visible:ring-offset-0 focus-visible:ring-offset-brand-cream dark:focus-visible:ring-brand-yellow dark:focus-visible:ring-offset-brand-ink"
            href="mailto:hello@storyinthemaking.com"
          >
            hello@storyinthemaking.com
          </a>
          .
        </p>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          For account or billing requests, include your account email so we can respond quickly.
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
