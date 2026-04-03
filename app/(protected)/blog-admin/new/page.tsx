import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isBlogAdminUser } from "@/lib/blog/admin";
import { NewPostForm } from "@/components/blog-admin/new-post-form";

export default async function BlogAdminNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isBlogAdminUser(user.id)) {
    redirect("/dashboard");
  }

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link href="/blog-admin" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          ← Blog admin
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New post</h1>
      </div>
      <NewPostForm />
    </div>
  );
}
