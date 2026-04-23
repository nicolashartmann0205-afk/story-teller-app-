import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AppShellNavLinks } from "@/components/nav/app-shell-nav-links";
import { PublicAuthLinks, PublicPrimaryNavLinks } from "@/components/nav/public-nav-links";
import { isBlogAdminUser } from "@/lib/blog/admin";
import { getUserCreditBalance } from "@/lib/credits/service";
import { createClient } from "@/lib/supabase/server";

/**
 * Single global navigation bar for the whole app (public + authenticated).
 */
export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const creditBalance = user ? await getUserCreditBalance(user.id) : null;
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
            <>
              <PublicPrimaryNavLinks />
              <PublicAuthLinks />
            </>
          )}
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Credits: {creditBalance ?? 0}
            </span>
            <SignOutButton />
          </div>
        ) : null}
      </div>
    </header>
  );
}
