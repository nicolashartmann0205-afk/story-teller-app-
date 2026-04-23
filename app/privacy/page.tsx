import Link from "next/link";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

export async function generateMetadata() {
  return buildDynamicPageMetadata("privacy", {
    title: "Privacy policy - data & cookies",
    description:
      "Review how Story Teller handles account data, analytics, and cookies so you understand what we collect and why. Read the full policy and learn more.",
    canonicalPath: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-cream dark:bg-brand-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-brand-ink dark:text-brand-yellow">Privacy Policy</h1>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          We collect only the information required to run your account and improve the product. We do not sell personal data.
        </p>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          If you need data access or deletion, email{" "}
          <a
            className="underline text-brand-teal dark:text-brand-yellow hover:text-brand-ink dark:hover:text-brand-seafoam focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-teal focus-visible:ring-offset-0 focus-visible:ring-offset-brand-cream dark:focus-visible:ring-brand-yellow dark:focus-visible:ring-offset-brand-ink"
            href="mailto:privacy@storyinthemaking.com"
          >
            privacy@storyinthemaking.com
          </a>
          .
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
