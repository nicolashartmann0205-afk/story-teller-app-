import { getBlogAdminUserIds } from "@/lib/config/env";

/** Canonical URL prefix for blog CMS (list, new, edit). */
export const BLOG_ADMIN_BASE_PATH = "/admin/blogs";

/** Signed-in but not allowlisted; dashboard shows a short explanation (search param `blogAdmin=denied`). */
export const BLOG_ADMIN_ACCESS_DENIED_PATH = "/dashboard?blogAdmin=denied";

export function isBlogAdminUser(userId: string | undefined | null): boolean {
  if (!userId) return false;
  const allow = getBlogAdminUserIds();
  if (allow.length === 0) return false;
  return allow.includes(userId);
}
