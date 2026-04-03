import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
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

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Story Teller blog
          </h1>
          <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
            Practical notes on structure, scenes, and finishing drafts—without the fluff.
          </p>
        </header>

        <section aria-labelledby="posts-heading">
          <h2 id="posts-heading" className="mb-8 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            Recent posts
          </h2>
          <ul className="space-y-10 text-zinc-800 dark:text-zinc-200">
            {posts.map((post) => (
              <li key={post.slug} id={post.slug === "story-structure" ? "story-structure" : undefined}>
                <article className="space-y-2">
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">{formatDate(post.publishedAt)}</p>
                  <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline hover:underline-offset-4"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{post.description}</p>
                  <p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                    >
                      Read post →
                    </Link>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <p>
          <Link
            href="/"
            className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
