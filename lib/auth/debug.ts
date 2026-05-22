/**
 * Auth debug banners/logging — never shown in production even if AUTH_DEBUG=1 is set.
 */
export function isAuthDebugEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  if (process.env.NODE_ENV === "production") return false;
  return process.env.AUTH_DEBUG === "1";
}
