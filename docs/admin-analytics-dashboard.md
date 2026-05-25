# Admin Analytics Dashboard — Story Teller

Private usage metrics for the site owner. Implemented in this repo; not a generic template.

## Your stack

| Layer | Technology |
|-------|------------|
| Frontend | **Next.js 16** (App Router, React, Tailwind) |
| Backend | **Next.js Server Components** + Server Actions |
| Database | **PostgreSQL** (Supabase) via **Drizzle ORM** |
| Auth | **Supabase Auth** (email + Google OAuth) |

## Routes

| URL | Purpose |
|-----|---------|
| `/admin/usage` | Main dashboard (metrics + recent sign-ups) |
| `/admin/analytics` | Alias → redirects to `/admin/usage` |

Sign in as admin → nav shows **Usage Admin** → or open either URL directly.

---

## 1. Access control (owner only)

**Usage admin** is separate from **Blog admin**. Only `nicolas@hartmanns.net` can open `/admin/usage` or see **Usage Admin** in the nav — `BLOG_ADMIN_USER_IDS` does not grant access.

```7:9:lib/admin/usage-access.ts
export function isUsageAdminUser(_userId: string | undefined | null, email?: string | null): boolean {
  return (email || "").trim().toLowerCase() === USAGE_ADMIN_OWNER_EMAIL;
}
```

**Page guard:**

```52:56:app/(protected)/admin/usage/page.tsx
  if (!isUsageAdminUser(user.id, user.email)) {
    redirect(USAGE_ADMIN_ACCESS_DENIED_PATH);
  }
```

| Visitor | Result |
|---------|--------|
| Not signed in | Redirect to sign-in, then back to admin page |
| Signed in, not owner | Redirect to `/dashboard?usageAdmin=denied` |
| Owner (`nicolas@hartmanns.net`) | Dashboard loads |

**Blog admin** (CMS, feedback, credits) still uses `isBlogAdminUser()` — optional extra admins via `.env.local`:

```bash
BLOG_ADMIN_USER_IDS=uuid-from-supabase-auth-users
```

No public API exposes these metrics — data is loaded server-side only.

---

## 2. Metrics & queries

**Source tables:**

- `auth.users` — total registrations, sign-up dates, approximate “online” via `last_sign_in_at`
- `public.stories` — story count, activity by `updated_at`
- `public.credit_transactions` — AI generation debits

**Implemented metrics:**

| Metric | How it’s calculated |
|--------|---------------------|
| Total registered users | `COUNT(*)` on `auth.users` |
| New sign-ups (7d / 30d) | `auth.users.created_at` windows |
| Daily active users (24h) | Distinct users with story update or credit debit in last 24h |
| Active users (7d / 30d) | Same logic, longer windows |
| Recently online (~15 min) | `auth.users.last_sign_in_at` in last 15 minutes (approximate) |
| Total stories | `COUNT(*)` on `public.stories` |
| AI generations | `COUNT(*)` on `credit_transactions` where `type = 'debit'` |

Query implementation: `lib/admin/usage-queries.ts`.

### Custom DB vs third-party analytics

| Need | Best approach |
|------|----------------|
| Registered users, product usage, AI volume | **Custom dashboard** (this page) — you own the data |
| Page views, referrers, funnels | **Vercel Web Analytics** or **Plausible** — low setup |
| Session replay, feature flags, cohorts | **PostHog** — richer product analytics |

**Recommendation:** Keep `/admin/usage` for product metrics (users, stories, AI). Add **Vercel Web Analytics** (one line in Next.js) for traffic; use **PostHog** only if you need funnels/replay. Do not duplicate “total users” in GA — Supabase `auth.users` is the source of truth.

**Real-time “who is online right now”** needs WebSockets or a presence service (e.g. PostHog, Supabase Realtime heartbeat). The dashboard shows a **15-minute last sign-in proxy** instead — good enough for a small app without extra infrastructure.

---

## 3. Frontend dashboard

Server-rendered page with stat cards and a recent sign-ups table:

- `app/(protected)/admin/usage/page.tsx` — UI
- `lib/admin/usage-queries.ts` — data
- `components/nav/app-shell-nav-links.tsx` — **Usage Admin** link (admins only)

No client-side fetch — metrics are loaded in the Server Component on each request.

---

## Local development

1. Ensure `.env.local` has Supabase + `POOLING_DATABASE_URL`.
2. Sign in as `nicolas@hartmanns.net`.
3. Open `/admin/usage` or `/admin/analytics`.

Validate DB connectivity:

```bash
pnpm db:validate-env
```

---

## Files reference

| File | Role |
|------|------|
| `lib/blog/admin.ts` | Admin check |
| `lib/admin/usage-queries.ts` | SQL metrics |
| `lib/admin/paths.ts` | Route constants |
| `app/(protected)/admin/usage/page.tsx` | Dashboard UI |
| `app/(protected)/admin/analytics/page.tsx` | URL alias |
| `docs/features/admin-usage-dashboard.md` | Feature requirements (FRED) |
