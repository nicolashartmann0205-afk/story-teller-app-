import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/blog/post-body";
import { getPostBySlugFromDb } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugFromDb(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
  };
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlugFromDb(slug);
  if (!post) notFound();

  return (
    <article
      className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8"
      contentEditable={false}
      spellCheck={false}
      data-gramm="false"
      data-gramm_editor="false"
    >
      <header className="space-y-4 border-b border-zinc-200 pb-10 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">{formatDate(post.publishedAt)}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">{post.title}</h1>
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{post.description}</p>
      </header>
      <div className="pt-10">
        <PostBody content={post.content} />
      </div>
      <footer className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <p className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            href="/blogs"
            className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← All posts
          </Link>
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Home
          </Link>
          <Link
            href={`/auth/sign-in?redirectedFrom=${encodeURIComponent(`/blog/${slug}`)}`}
            className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
          <Link
            href={`/auth/sign-up?redirectedFrom=${encodeURIComponent(`/blog/${slug}`)}`}
            className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign up
          </Link>
        </p>
      </footer>
    </article>
  );
}
