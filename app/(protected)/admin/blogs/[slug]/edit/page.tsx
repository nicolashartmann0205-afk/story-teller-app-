import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BLOG_ADMIN_ACCESS_DENIED_PATH, BLOG_ADMIN_BASE_PATH, isBlogAdminUser } from "@/lib/blog/admin";
import { getPostBySlugFromDb } from "@/lib/blog/queries";
import { EditPostForm } from "@/components/blog-admin/edit-post-form";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminBlogsEditPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/sign-in?redirectedFrom=${encodeURIComponent(`${BLOG_ADMIN_BASE_PATH}/${slug}/edit`)}`);
  }
  if (!isBlogAdminUser(user.id)) {
    redirect(BLOG_ADMIN_ACCESS_DENIED_PATH);
  }
  const sp = await searchParams;
  const post = await getPostBySlugFromDb(slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link href={BLOG_ADMIN_BASE_PATH} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          ← Blog admin
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit post</h1>
      </div>
      <EditPostForm slug={slug} post={post} showSaved={sp.saved === "1"} />
    </div>
  );
}
