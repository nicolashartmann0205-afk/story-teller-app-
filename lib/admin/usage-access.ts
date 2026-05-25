import { SITE_OWNER_EMAIL } from "@/lib/admin/owner-email";

/** Owner-only access for /admin/usage (not shared with BLOG_ADMIN_USER_IDS). */
const USAGE_ADMIN_OWNER_EMAIL = SITE_OWNER_EMAIL;

export const USAGE_ADMIN_ACCESS_DENIED_PATH = "/dashboard?usageAdmin=denied";

/** True only for the site owner — usage metrics are not visible to other blog admins. */
export function isUsageAdminUser(_userId: string | undefined | null, email?: string | null): boolean {
  return (email || "").trim().toLowerCase() === USAGE_ADMIN_OWNER_EMAIL;
}
