import Link from "next/link";
import { AUTH_ROUTES, withRedirectedFrom } from "@/lib/auth/routes";
import { getAllPostsFromDb } from "@/lib/blog/queries";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDynamicPageMetadata("blogs", {
    title: "Blog - writing guides & workflow tips",
    description:
      "Discover writing guides on story structure, scene design, editing workflows, and momentum habits. Read practical tutorials for stronger drafts. Read now.",
    canonicalPath: "/blogs",
  });
}

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
    <div className="min-h-screen bg-brand-cream dark:bg-brand-ink">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-ink dark:text-brand-yellow">Blog</h1>
          <p className="mt-2 text-sm text-brand-ink/85 dark:text-brand-seafoam">
            Practical notes on structure, scenes, and finishing drafts—without the fluff.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-lg border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 p-12 text-center">
            <p className="text-lg text-brand-ink/85 dark:text-brand-seafoam">No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.slug}
                id={post.slug === "story-structure" ? "story-structure" : undefined}
                className="group rounded-lg border border-brand-seafoam/30 bg-white dark:bg-brand-ink/80 p-6 hover:shadow-lg transition-shadow flex flex-col"
              >
                <Link href={`/blog/${post.slug}`} className="block flex-1">
                  <h2 className="text-xl font-semibold text-brand-ink dark:text-brand-yellow group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-brand-ink/85 dark:text-brand-seafoam">{post.description}</p>
                  <p className="mt-4 text-xs text-brand-ink/80 dark:text-brand-seafoam">{formatDate(post.publishedAt)}</p>
                </Link>
                <div className="mt-4 flex gap-2 pt-4 border-t border-brand-seafoam/30">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex-1 rounded-md border border-brand-seafoam/50 px-3 py-2 text-center text-sm font-medium text-brand-ink dark:text-brand-seafoam hover:bg-brand-cream dark:hover:bg-brand-seafoam/15"
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
            className="font-medium text-brand-teal underline underline-offset-2 hover:text-brand-ink dark:text-brand-yellow dark:hover:text-brand-seafoam"
          >
            ← Back to home
          </Link>
          <Link
            href={withRedirectedFrom(AUTH_ROUTES.SIGN_IN, "/blogs")}
            className="text-brand-ink/85 underline underline-offset-2 hover:text-brand-teal dark:text-brand-seafoam dark:hover:text-brand-yellow"
          >
            Sign in
          </Link>
          <Link
            href={withRedirectedFrom(AUTH_ROUTES.SIGN_UP, "/blogs")}
            className="text-brand-ink/85 underline underline-offset-2 hover:text-brand-teal dark:text-brand-seafoam dark:hover:text-brand-yellow"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
