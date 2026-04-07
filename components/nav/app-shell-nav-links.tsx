"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BLOG_ADMIN_BASE_PATH } from "@/lib/blog/admin";

const inactive =
  "text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors";
const active =
  "text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:underline transition-colors";

function navClass(isActive: boolean) {
  return isActive ? active : inactive;
}

/**
 * Primary app navigation (Dashboard, stories, settings, blogs, blog admin).
 * Shared by the protected layout and the public blog header when signed in.
 */
export function AppShellNavLinks() {
  const pathname = usePathname() ?? "";

  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isStories = pathname === "/stories" || pathname.startsWith("/stories/");
  const isSettings = pathname === "/settings" || pathname.startsWith("/settings/");
  const isBlogs =
    pathname === "/blogs" ||
    pathname.startsWith("/blogs/") ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/");
  const isBlogAdmin = pathname === BLOG_ADMIN_BASE_PATH || pathname.startsWith(`${BLOG_ADMIN_BASE_PATH}/`);

  return (
    <>
      <Link href="/dashboard" className={navClass(isDashboard)}>
        Dashboard
      </Link>
      <Link href="/stories" className={navClass(isStories)}>
        My stories
      </Link>
      <Link href="/settings" className={navClass(isSettings)}>
        Settings
      </Link>
      <Link href="/blogs" className={navClass(isBlogs)} aria-label="Guides and articles">
        Blogs
      </Link>
      <Link href={BLOG_ADMIN_BASE_PATH} className={navClass(isBlogAdmin)}>
        Blog Admin
      </Link>
    </>
  );
}
