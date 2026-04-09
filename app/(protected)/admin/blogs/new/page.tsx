import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BLOG_ADMIN_ACCESS_DENIED_PATH, BLOG_ADMIN_BASE_PATH, isBlogAdminUser } from "@/lib/blog/admin";
import { NewPostForm } from "@/components/blog-admin/new-post-form";
import { selfReferencingCanonical } from "@/lib/seo/site-metadata";

export const metadata = selfReferencingCanonical("/admin/blogs/new");

export default async function AdminBlogsNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/sign-in?redirectedFrom=${encodeURIComponent(`${BLOG_ADMIN_BASE_PATH}/new`)}`);
  }
  if (!isBlogAdminUser(user.id)) {
    redirect(BLOG_ADMIN_ACCESS_DENIED_PATH);
  }
  const canEditSeo = isBlogAdminUser(user.id);

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link href={BLOG_ADMIN_BASE_PATH} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          ← Blog admin
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New post</h1>
      </div>
      <NewPostForm showSeoTab={canEditSeo} />
    </div>
  );
}
