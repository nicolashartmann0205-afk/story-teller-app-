import { getBlogAdminUserIds } from "@/lib/config/env";

export function isBlogAdminUser(userId: string | undefined | null): boolean {
  if (!userId) return false;
  const allow = getBlogAdminUserIds();
  if (allow.length === 0) return false;
  return allow.includes(userId);
}
