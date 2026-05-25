import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { withRedirectedFrom } from "@/lib/auth/redirect-from";
import { getRequestUser } from "@/lib/auth/request-user";
import { ANALYTICS_ADMIN_PATH, USAGE_ADMIN_PATH } from "@/lib/admin/paths";
import { isUsageAdminUser, USAGE_ADMIN_ACCESS_DENIED_PATH } from "@/lib/admin/usage-access";

/** Alias for /admin/usage — common analytics dashboard URL. */
export default async function AdminAnalyticsPage() {
  const { user, error } = await getRequestUser();
  if (error || !user) {
    redirect(withRedirectedFrom(AUTH_ROUTES.SIGN_IN, ANALYTICS_ADMIN_PATH));
  }
  if (!isUsageAdminUser(user.id, user.email)) {
    redirect(USAGE_ADMIN_ACCESS_DENIED_PATH);
  }
  redirect(USAGE_ADMIN_PATH);
}
