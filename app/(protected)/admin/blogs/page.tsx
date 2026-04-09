import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BLOG_ADMIN_ACCESS_DENIED_PATH, BLOG_ADMIN_BASE_PATH, isBlogAdminUser } from "@/lib/blog/admin";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { selfReferencingCanonical } from "@/lib/seo/site-metadata";

export const metadata = selfReferencingCanonical("/admin/blogs");

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/sign-in?redirectedFrom=${encodeURIComponent(BLOG_ADMIN_BASE_PATH)}`);
  }
  if (!isBlogAdminUser(user.id, user.email)) {
    redirect(BLOG_ADMIN_ACCESS_DENIED_PATH);
  }

  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Blog admin</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Create and edit public blog posts.</p>
        </div>
        <Link
          href={`${BLOG_ADMIN_BASE_PATH}/new`}
          className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          New post
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No posts yet. Add one or open the public blog once to seed defaults.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{row.title}</p>
                <p className="text-sm text-zinc-500">
                  /blog/{row.slug} · {row.publishedAt.toISOString().slice(0, 10)}
                </p>
              </div>
              <Link
                href={`${BLOG_ADMIN_BASE_PATH}/${row.slug}/edit`}
                className="text-sm font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10">
        <Link href="/blogs" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          View public blog
        </Link>
      </p>
    </div>
  );
}
