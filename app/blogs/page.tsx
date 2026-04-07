import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostsFromDb } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Guides on story structure, scenes, review, and workflow—written for Story Teller writers.",
};

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogsIndexPage() {
  const posts = await getAllPostsFromDb();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Blog</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Practical notes on structure, scenes, and finishing drafts—without the fluff.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.slug}
                id={post.slug === "story-structure" ? "story-structure" : undefined}
                className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-lg transition-shadow flex flex-col"
              >
                <Link href={`/blog/${post.slug}`} className="block flex-1">
                  <h2 className="text-xl font-semibold text-black dark:text-zinc-50 group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{post.description}</p>
                  <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">{formatDate(post.publishedAt)}</p>
                </Link>
                <div className="mt-4 flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-center text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Read
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/"
            className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← Back to home
          </Link>
          <Link
            href={`/auth/sign-in?redirectedFrom=${encodeURIComponent("/blogs")}`}
            className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
          <Link
            href={`/auth/sign-up?redirectedFrom=${encodeURIComponent("/blogs")}`}
            className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
