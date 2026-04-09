import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AppShellNavLinks } from "@/components/nav/app-shell-nav-links";
import { PublicNavLinks } from "@/components/nav/public-nav-links";
import { isBlogAdminUser } from "@/lib/blog/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Single global navigation bar for the whole app (public + authenticated).
 */
export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const canSeeBlogAdmin = isBlogAdminUser(user?.id, user?.email);
  const canSeeSeoAdmin = (user?.email || "").trim().toLowerCase() === "nicolas@hartmanns.net";

  return (
    <header
      className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80"
      aria-label="Main"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:underline"
          >
            Story Teller
          </Link>
          {user ? (
            <AppShellNavLinks showBlogAdmin={canSeeBlogAdmin} showSeoAdmin={canSeeSeoAdmin} />
          ) : (
            <PublicNavLinks />
          )}
        </div>
        {user ? <SignOutButton /> : null}
      </div>
    </header>
  );
}
