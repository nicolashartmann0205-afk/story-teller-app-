import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Optional apex ↔ www redirect for Next.js `redirects()` (see `next.config.ts`).
 *
 * Set `CANONICAL_ORIGIN` to the single public origin users should use, e.g.:
 * - `https://www.storyinthemaking.com` (redirects apex → www), or
 * - `https://storyinthemaking.com` (redirects www → apex).
 *
 * When unset, returns no extra redirects (use Vercel domain settings alone).
 * Do not combine with a conflicting host redirect at Vercel (opposite apex↔www).
 * `/auth/callback` is never host-redirected here (avoids loops with Vercel on OAuth return).
 * Root `/` host redirects skip `?code=` / `?error=` (OAuth) so middleware can run before any apex↔www hop.
 *
 * Set `CANONICAL_ORIGIN_DISABLED=true` to disable Next.js canonical redirects even if `CANONICAL_ORIGIN`
 * is set (e.g. recover from a misconfiguration without removing the variable).
 */
export function getCanonicalRedirects(): Redirect[] {
  const disabled = process.env.CANONICAL_ORIGIN_DISABLED?.trim().toLowerCase();
  if (disabled === "true" || disabled === "1" || disabled === "yes") {
    return [];
  }

  const raw = process.env.CANONICAL_ORIGIN?.trim();
  if (!raw) return [];

  let canonicalUrl: URL;
  try {
    canonicalUrl = new URL(raw);
  } catch {
    return [];
  }

  const hostname = canonicalUrl.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  ) {
    return [];
  }

  const sourceHost = hostname.startsWith("www.")
    ? hostname.slice(4)
    : `www.${hostname}`;

  const destBase = canonicalUrl.origin;

  // Do not redirect /auth/callback — host redirects here fight Vercel/DNS and cause
  // ERR_TOO_MANY_REDIRECTS during OAuth. Root "/" skips OAuth query params so Next does
  // not 308 apex↔www before middleware sends /?code= → /auth/callback.
  return [
    {
      source: "/",
      has: [{ type: "host", value: sourceHost }],
      missing: [
        { type: "query", key: "code" },
        { type: "query", key: "error" },
      ],
      destination: `${destBase}/`,
      permanent: true,
    },
    {
      source: "/((?!auth/callback(?:/|$)).+)",
      has: [{ type: "host", value: sourceHost }],
      destination: `${destBase}/$1`,
      permanent: true,
    },
  ];
}
