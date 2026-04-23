import Link from "next/link";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

export async function generateMetadata() {
  return buildDynamicPageMetadata("terms", {
    title: "Terms of service - legal terms & use",
    description:
      "Read Story Teller's terms of service to understand account use, responsibilities, billing basics, and legal boundaries before using the platform. Learn more.",
    canonicalPath: "/terms",
  });
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-brand-cream dark:bg-brand-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-brand-ink dark:text-brand-yellow">Terms of Service</h1>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          By using Story Teller, you agree to use the service lawfully and not abuse platform resources.
        </p>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          We may update these terms over time. Continued use after updates means acceptance of the revised terms.
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
