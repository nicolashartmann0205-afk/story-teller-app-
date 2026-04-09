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
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Terms of Service</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          By using Story Teller, you agree to use the service lawfully and not abuse platform resources.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          We may update these terms over time. Continued use after updates means acceptance of the revised terms.
        </p>
        <Link href="/" className="text-sm underline underline-offset-2 text-zinc-700 dark:text-zinc-300">← Back to home</Link>
      </div>
    </main>
  );
}
