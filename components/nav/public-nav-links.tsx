"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const inactive =
  "text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors";
const active =
  "text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:underline transition-colors";

function navClass(isActive: boolean) {
  return isActive ? active : inactive;
}

function signInHref(pathname: string | null) {
  if (!pathname || pathname.startsWith("/auth/")) {
    return "/auth/sign-in";
  }
  return `/auth/sign-in?redirectedFrom=${encodeURIComponent(pathname)}`;
}

function signUpHref(pathname: string | null) {
  if (!pathname || pathname.startsWith("/auth/")) {
    return "/auth/sign-up";
  }
  return `/auth/sign-up?redirectedFrom=${encodeURIComponent(pathname)}`;
}

/** Marketing / signed-out navigation shown in the global header. */
export function PublicNavLinks() {
  const pathname = usePathname() ?? "";

  const isFeedback =
    pathname === "/feedback" ||
    pathname.startsWith("/feedback/");
  const isBlogs =
    pathname === "/blogs" ||
    pathname.startsWith("/blogs/") ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/");
  const isSignIn = pathname.startsWith("/auth/sign-in");
  const isSignUp = pathname.startsWith("/auth/sign-up");

  return (
    <>
      <Link href="/feedback" className={navClass(isFeedback)}>
        Feedback
      </Link>
      {!isSignIn ? (
        <Link href="/blogs" className={navClass(isBlogs)} aria-label="Guides and articles">
          Blogs
        </Link>
      ) : null}
      <Link href={signInHref(pathname)} className={navClass(isSignIn)}>
        Sign in
      </Link>
      <Link href={signUpHref(pathname)} className={navClass(isSignUp)}>
        Sign up
      </Link>
    </>
  );
}
