# Fix production admin pages (Feedback, SEO, Usage)

Production health (`/api/health/db`) must show:

- `poolingBroken: true` until you paste the **full** pooler URI on Vercel (~110–113 chars, port **6543**)
- `hasServiceRole: false` is OK after migration **0072** — Usage admin uses your signed-in session

## 1. Apply database migrations (once)

From the project folder (uses `POOLING_DATABASE_URL` in `.env.local`):

```bash
pnpm db:migrate
```

This applies `0070`, `0071`, and `0072` (usage RPC).  
If migrate fails, paste `drizzle/0072_usage_admin_stats_rpc.sql` into **Supabase → SQL Editor → Run**.

## 2. Fix Vercel env (required for Feedback/Blog admin Postgres path and faster ops)

```bash
pnpm db:copy-env-vercel pooling
```

Vercel → **POOLING_DATABASE_URL** → delete old value → paste → Sensitive → **Production** → Save.

Optional but recommended:

```bash
pnpm db:copy-env-vercel service_role
```

## 3. Redeploy Production

Deployments → latest → **⋯** → **Redeploy** (env vars are not picked up until redeploy).

## 4. Verify

1. Open `https://storyinthemaking.com/api/health/db` — after fix, `connected: true` or at least `hasServiceRole: true`.
2. Sign in as **nicolas@hartmanns.net**.
3. Open `/admin/feedback`, `/seo-admin`, `/admin/usage` — Usage should show non-zero totals.
