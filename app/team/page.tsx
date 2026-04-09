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
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">Team</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          We are a small product team focused on helping writers finish more stories with less process overhead.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Story Teller combines product design, narrative craft, and engineering to support real creative workflows.
        </p>
        <Link href="/" className="text-sm underline underline-offset-2 text-zinc-700 dark:text-zinc-300">← Back to home</Link>
      </div>
    </main>
  );
}
