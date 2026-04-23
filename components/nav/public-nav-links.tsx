"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_ROUTES, withRedirectedFrom } from "@/lib/auth/routes";

const inactive =
  "text-sm text-brand-ink/70 dark:text-brand-seafoam hover:text-brand-teal dark:hover:text-brand-yellow transition-colors";
const active =
  "text-sm font-semibold text-brand-ink dark:text-brand-yellow hover:underline transition-colors";

function navClass(isActive: boolean) {
  return isActive ? active : inactive;
}

function signInHref(pathname: string | null) {
  return withRedirectedFrom(AUTH_ROUTES.SIGN_IN, pathname);
}

function signUpHref(pathname: string | null) {
  return withRedirectedFrom(AUTH_ROUTES.SIGN_UP, pathname);
}

/** Marketing / signed-out navigation shown in the global header. */
export function PublicPrimaryNavLinks() {
  const pathname = usePathname() ?? "";

  const isFeedback =
    pathname === "/feedback" ||
    pathname.startsWith("/feedback/");
  const isBlogs =
    pathname === "/blogs" ||
    pathname.startsWith("/blogs/") ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/");
  return (
    <>
      <Link href="/feedback" className={navClass(isFeedback)}>
        Feedback
      </Link>
      <Link href="/blogs" className={navClass(isBlogs)} aria-label="Guides and articles">
        Blogs
      </Link>
    </>
  );
}

export function PublicAuthLinks() {
  const pathname = usePathname() ?? "";
  const isSignIn = pathname.startsWith(AUTH_ROUTES.SIGN_IN);
  const isSignUp = pathname.startsWith(AUTH_ROUTES.SIGN_UP);

  return (
    <div className="ml-auto flex items-center space-x-4">
      <Link href={signInHref(pathname)} className={navClass(isSignIn)}>
        Sign in
      </Link>
      <Link
        href={signUpHref(pathname)}
        className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          isSignUp
            ? "bg-brand-teal text-white dark:bg-brand-yellow dark:text-brand-ink"
            : "bg-brand-ink text-white hover:bg-brand-teal dark:bg-brand-seafoam dark:text-brand-ink dark:hover:bg-brand-yellow"
        }`}
      >
        Sign up
      </Link>
    </div>
  );
}
