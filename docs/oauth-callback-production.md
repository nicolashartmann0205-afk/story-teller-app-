# OAuth callback (production): Supabase and Vercel

The app exchanges the OAuth `code` at `/auth/callback` and sets session cookies on the **redirect response** (see `app/auth/callback/route.ts`). If Supabase sends users to the **site root** with `?code=`, [`middleware.ts`](../middleware.ts) **redirects** to `/auth/callback` with the same query string (one hop). When **`NEXT_PUBLIC_APP_URL`** is set and the request host is the same site (apex vs `www`), the `Location` uses that **canonical origin** so the browser does not bounce between hosts. Otherwise the redirect uses **`x-forwarded-host`** / **`host`** and **`x-forwarded-proto`** (e.g. previews without a production app URL).

### If redirect loops persist (recovery)

`ERR_TOO_MANY_REDIRECTS` between apex and `www` is usually **conflicting edge redirects**, not this one hop.

1. **Unset `CANONICAL_ORIGIN`** in Vercel (or your host) and rely on **Vercel → Domains** alone until the redirect chain is stable—then re-add `CANONICAL_ORIGIN` only if it matches that single canonical host. (Callback path **`/auth/callback`** is excluded from those redirects in code; you still need **one** direction at Vercel.)
2. Alternatively, set **`CANONICAL_ORIGIN_DISABLED=true`** to disable Next.js [`canonical-redirects`](../lib/canonical-redirects.ts) without deleting `CANONICAL_ORIGIN` (redeploy to apply).

## Vercel: verify domains (avoid apex ↔ www loops)

`ERR_TOO_MANY_REDIRECTS` with `?code=` on one host and Chrome mentioning the other usually means **two layers** are redirecting in opposite directions (e.g. apex→www at the edge and www→apex elsewhere).

**Checklist:**

1. **Project → Settings → Domains** — Note which hostname is the **primary** (or where traffic is intended to land after one redirect).
2. Ensure there is **only one** direction between apex and `www` (either apex → `www` **or** `www` → apex), never both.
3. **DNS** — Remove CNAME/A rules at the registrar or proxy that bounce traffic back (e.g. apex → `www` at DNS and `www` → apex at Vercel).
4. After changes, **redeploy** and retest OAuth from a private window.

## Supabase (Authentication → URL configuration)

1. **Redirect URLs** — include every origin users may use to complete OAuth. For apex and www:

   - `https://storyinthemaking.com/auth/callback`
   - `https://www.storyinthemaking.com/auth/callback`

   Add localhost for local dev if needed, e.g. `http://localhost:3000/auth/callback`.

2. **Site URL** — set to the **same canonical origin** you use for **`NEXT_PUBLIC_APP_URL`** (see table below). Used as the default base for some Supabase flows; mismatches here plus Vercel host redirects are a common cause of loops.

3. **OAuth provider (e.g. Google)** — authorized redirect URIs must allow Supabase’s redirect (handled by Supabase; ensure the provider is enabled in Supabase).

### Align env + Supabase (single source of truth)

Pick **one** public origin (e.g. `https://www.storyinthemaking.com`) and match all of these:

| Setting | Value |
|--------|--------|
| Vercel primary / post-redirect host | Same hostname as the row below |
| `NEXT_PUBLIC_APP_URL` | Same origin, no trailing slash (e.g. `https://www.storyinthemaking.com`) |
| Supabase **Site URL** | Same origin as `NEXT_PUBLIC_APP_URL` |
| Supabase **Redirect URLs** | Include **both** `…/auth/callback` URLs for apex and `www` while both hosts exist (see list above) |

Redeploy after changing `NEXT_PUBLIC_APP_URL`.

## App environment

- **`NEXT_PUBLIC_APP_URL`** should match the URL users use for OAuth when possible, because `getAuthCallbackUrl()` builds `…/auth/callback` from it. On Vercel, `VERCEL_URL` is a fallback but may not match the user-facing www/apex choice—set `NEXT_PUBLIC_APP_URL` explicitly in production if you see host mismatches.

- **`CANONICAL_ORIGIN`** (optional) — If you want **Next.js** to enforce a single host (apex ↔ `www` only), set this to the **same** origin as `NEXT_PUBLIC_APP_URL`, e.g. `https://www.storyinthemaking.com`. See [`lib/canonical-redirects.ts`](../lib/canonical-redirects.ts). **Do not** combine with a **conflicting** host redirect at Vercel (opposite apex↔`www`); prefer **one** layer. If Vercel already redirects correctly, leave `CANONICAL_ORIGIN` unset.

- **`CANONICAL_ORIGIN` must not redirect `/auth/callback`:** Host-level redirects that also apply to **`/auth/callback`** can ping-pong with Vercel’s apex↔`www` rule and cause **`ERR_TOO_MANY_REDIRECTS`** on the OAuth return URL. The app’s canonical redirect rules **exclude** `/auth/callback` so the exchange runs on the inbound host without an extra Next.js 308 on that path.

- **Canonical `/` and `/?code=`:** The **`/`** host redirect in [`canonical-redirects`](../lib/canonical-redirects.ts) only runs when **`code`** and **`error`** query params are **absent**, so Supabase returning to **`/?code=…`** (or **`/?error=…`**) is not sent to the other host by Next.js before [`middleware`](../middleware.ts) can redirect to `/auth/callback`.

- **`CANONICAL_ORIGIN_DISABLED`** — Set to `true` to turn off Next.js canonical redirects from `CANONICAL_ORIGIN` (same file as above). Use when debugging loops; redeploy after changing.

- **Request host:** Server actions for Google OAuth and email links use [`getAuthCallbackUrlForRequest()`](../lib/auth/callback-url.ts), which builds `…/auth/callback` from the incoming **Host** / **`x-forwarded-host`** when it matches the same registrable domain as `NEXT_PUBLIC_APP_URL`. That way `redirectTo` matches whether the user started on **www** or **apex** (both must still be listed in Supabase Redirect URLs).

## Apex + www (session cookies)

Supabase’s default cookies are **host-only** (no `Domain`), so a session set on `storyinthemaking.com` is not sent to `www.storyinthemaking.com`. Combined with Vercel redirects, that can cause **`ERR_TOO_MANY_REDIRECTS`** during or after OAuth.

The app sets a shared cookie domain (e.g. `.storyinthemaking.com`) in production via [`lib/supabase/cookie-options.ts`](../lib/supabase/cookie-options.ts), derived from **`NEXT_PUBLIC_APP_URL`**, or overridden with **`AUTH_COOKIE_DOMAIN`** (e.g. `.storyinthemaking.com`) if needed. Shared domain is **not** applied on localhost, `*.vercel.app` previews, or when `VERCEL_ENV` is not `production`.

You can still use a **single canonical host** on Vercel (one redirect between apex and www); shared cookies are an extra safeguard when both hosts are reachable.

**Do not** add extra app-level redirects between apex and `www` when Vercel already redirects one host to the other—two layers of apex↔`www` redirects can loop. Align **`NEXT_PUBLIC_APP_URL`**, Supabase **Site URL**, and OAuth flows with the hostname users end up on (usually Vercel’s primary domain); `getAuthCallbackUrlForRequest()` helps match **www** vs apex at OAuth start.

## Network trace (confirm a host loop)

1. Open **DevTools → Network**.
2. Enable **Preserve log**.
3. Start sign-in and reproduce the failure.
4. Inspect the **redirect chain** for the document request: look for **alternating** `307`/`308` between `storyinthemaking.com` and `www.storyinthemaking.com`. If you see that, fix **Vercel/DNS/env** alignment above before changing app code further.

## Quick verification

1. Open DevTools → Network during Google (or other) sign-in.
2. The response to `/auth/callback?code=…` should be **302** with **Set-Cookie** for the Supabase session.
3. The next request to a protected route should **not** immediately redirect back to `/auth/sign-in`.
4. DevTools → Application → Cookies: on production, Supabase auth cookies should show **Domain** = `.storyinthemaking.com` (or your `AUTH_COOKIE_DOMAIN`) so both apex and www share the session.
