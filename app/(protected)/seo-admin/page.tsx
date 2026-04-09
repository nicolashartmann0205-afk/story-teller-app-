import Link from "next/link";
import { redirect } from "next/navigation";
import { SeoReferenceTabs } from "@/components/settings/seo-reference-tabs";
import { SeoBlogPostsEditor } from "@/components/settings/seo-blog-posts-editor";
import { selfReferencingCanonical, SITE_NAME, TITLE_TEMPLATE, DEFAULT_PAGE_TITLE, DEFAULT_DESCRIPTION } from "@/lib/seo/site-metadata";
import { getAppUrl } from "@/lib/config/env";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { updateBlogSeoAction } from "./actions";

const SEO_ADMIN_PATH = "/seo-admin";
const SEO_ADMIN_EMAIL = "nicolas@hartmanns.net";

export const metadata = selfReferencingCanonical(SEO_ADMIN_PATH);

export default async function SeoAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?redirectedFrom=${encodeURIComponent(SEO_ADMIN_PATH)}`);
  }

  if (user.email !== SEO_ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const rows = await db
    .select({
      slug: blogPosts.slug,
      title: blogPosts.title,
      seoTitle: blogPosts.seoTitle,
      metaDescription: blogPosts.metaDescription,
      canonicalUrl: blogPosts.canonicalUrl,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.publishedAt));
  const serializedRows = rows.map((row) => ({
    ...row,
    updatedAt: row.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">SEO Admin</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manage blog post SEO fields and review global metadata defaults.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Blog post SEO editor</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Update canonical URL, meta description, and SEO title for each blog post.
        </p>
        <SeoBlogPostsEditor rows={serializedRows} updateAction={updateBlogSeoAction} />
      </section>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <SeoReferenceTabs
          siteName={SITE_NAME}
          titleTemplate={TITLE_TEMPLATE}
          defaultPageTitle={DEFAULT_PAGE_TITLE}
          defaultDescription={DEFAULT_DESCRIPTION}
          metadataBaseUrl={getAppUrl()}
          exampleCanonicalPaths={[
            { path: "/", label: "Home" },
            { path: "/blogs", label: "Blogs index" },
            { path: "/blog/story-structure", label: "Blog article example" },
            { path: "/about", label: "About page" },
          ]}
        />
      </div>

      <p className="mt-8">
        <Link href="/dashboard" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
