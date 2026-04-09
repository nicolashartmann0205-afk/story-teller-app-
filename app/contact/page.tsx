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
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Contact</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Need help or want to talk? Reach us at <a className="underline" href="mailto:hello@storyinthemaking.com">hello@storyinthemaking.com</a>.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          For account or billing requests, include your account email so we can respond quickly.
        </p>
        <Link href="/" className="text-sm underline underline-offset-2 text-zinc-700 dark:text-zinc-300">← Back to home</Link>
      </div>
    </main>
  );
}
