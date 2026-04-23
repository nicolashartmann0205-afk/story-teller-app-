"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_ROUTES, withRedirectedFrom } from "@/lib/auth/routes";

const inactive =
  "text-sm text-brand-teal/80 hover:text-brand-terracotta-orange transition-colors";
const active =
  "text-sm font-semibold text-brand-terracotta-orange hover:underline transition-colors";

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
            ? "bg-brand-terracotta-orange text-white"
            : "bg-brand-teal text-white hover:bg-brand-seafoam-green"
        }`}
      >
        Sign up
      </Link>
    </div>
  );
}
