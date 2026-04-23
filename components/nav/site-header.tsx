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
  let creditBalance: number | null = null;
  if (user) {
    try {
      creditBalance = await getUserCreditBalance(user.id);
    } catch (error) {
      // Fail open so navigation/dashboard can render even if credits tables are not migrated yet.
      console.error("Failed to load user credit balance in header", error);
      creditBalance = 0;
    }
  }
  const canSeeBlogAdmin = isBlogAdminUser(user?.id, user?.email);
  const canSeeSeoAdmin = (user?.email || "").trim().toLowerCase() === "nicolas@hartmanns.net";

  return (
    <header
      className="sticky top-0 z-30 border-b border-brand-seafoam/50 bg-brand-cream/90 backdrop-blur-sm dark:border-brand-seafoam/30 dark:bg-brand-ink/90"
      aria-label="Main"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="text-sm font-semibold text-brand-ink dark:text-brand-yellow hover:text-brand-teal dark:hover:text-brand-seafoam"
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
            <span className="rounded-md border border-brand-seafoam/70 dark:border-brand-seafoam/40 bg-white/80 dark:bg-brand-ink/70 px-2.5 py-1 text-xs font-medium text-brand-ink dark:text-brand-seafoam">
              Credits: {creditBalance ?? 0}
            </span>
            <SignOutButton />
          </div>
        ) : null}
      </div>
    </header>
  );
}
