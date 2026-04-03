import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isBlogAdminUser } from "@/lib/blog/admin";
import { getPostBySlugFromDb } from "@/lib/blog/queries";
import { EditPostForm } from "@/components/blog-admin/edit-post-form";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function BlogAdminEditPage({ params, searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isBlogAdminUser(user.id)) {
    redirect("/dashboard");
  }

  const { slug } = await params;
  const sp = await searchParams;
  const post = await getPostBySlugFromDb(slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link href="/blog-admin" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          ← Blog admin
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit post</h1>
      </div>
      <EditPostForm slug={slug} post={post} showSaved={sp.saved === "1"} />
    </div>
  );
}
