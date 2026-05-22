import { redirect } from "next/navigation";
import { USAGE_ADMIN_PATH } from "@/lib/admin/paths";

/** Alias for /admin/usage — common analytics dashboard URL. */
export default function AdminAnalyticsPage() {
  redirect(USAGE_ADMIN_PATH);
}
