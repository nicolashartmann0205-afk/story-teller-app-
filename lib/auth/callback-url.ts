import { headers } from "next/headers";
import { getAppUrl, getAuthCallbackUrl } from "@/lib/config/env";

function registrableHostKey(hostname: string): string {
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

function isLocalhostOrPreview(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.endsWith(".vercel.app")) return true;
  return false;
}

/**
 * OAuth / magic-link callback URL matching the incoming request host (www vs apex),
 * when it belongs to the same site as `getAppUrl()`. Falls back to `getAuthCallbackUrl()`.
 * Server-only (uses `headers()`).
 */
export async function getAuthCallbackUrlForRequest(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-host");
  const hostHeader = (forwarded?.split(",")[0]?.trim() || h.get("host") || "").trim();
  if (!hostHeader) {
    return getAuthCallbackUrl();
  }

  const hostnameOnly = hostHeader.split(":")[0] ?? hostHeader;
  if (isLocalhostOrPreview(hostnameOnly)) {
    return getAuthCallbackUrl();
  }

  let appHostname: string;
  try {
    appHostname = new URL(getAppUrl()).hostname;
  } catch {
    return getAuthCallbackUrl();
  }

  if (registrableHostKey(hostnameOnly) !== registrableHostKey(appHostname)) {
    return getAuthCallbackUrl();
  }

  const proto =
    h.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return `${proto}://${hostHeader}/auth/callback`;
}
