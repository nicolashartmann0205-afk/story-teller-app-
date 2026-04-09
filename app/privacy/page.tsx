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
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Privacy Policy</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          We collect only the information required to run your account and improve the product. We do not sell personal data.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          If you need data access or deletion, email <a className="underline" href="mailto:privacy@storyinthemaking.com">privacy@storyinthemaking.com</a>.
        </p>
        <Link href="/" className="text-sm underline underline-offset-2 text-zinc-700 dark:text-zinc-300">← Back to home</Link>
      </div>
    </main>
  );
}
