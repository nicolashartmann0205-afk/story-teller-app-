import Link from "next/link";
import { redirect } from "next/navigation";
import { SeoReferenceTabs } from "@/components/settings/seo-reference-tabs";
import { selfReferencingCanonical, SITE_NAME, TITLE_TEMPLATE, DEFAULT_PAGE_TITLE, DEFAULT_DESCRIPTION } from "@/lib/seo/site-metadata";
import { getAppUrl } from "@/lib/config/env";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">SEO Admin</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Reference and validate global SEO defaults and canonical URL behavior.
        </p>
      </div>

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
