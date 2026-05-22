# Supabase Auth Security Checklist

Use this checklist for each Supabase environment (local/staging/production).

## Compromised Password Protection (HaveIBeenPwned)

- **Setting:** Prevent use of leaked/compromised passwords (`password_hibp_enabled`).
- **Why:** Blocks passwords known from public breaches (credential stuffing).
- **Required state:** Enabled in all environments.
- **Plan:** Requires a Supabase plan with the `password_hibp` entitlement (typically **Pro** or above). Free projects may not be able to enable this via API.

### Option A — Dashboard (manual)

1. Open [Authentication → Providers → Email](https://supabase.com/dashboard/project/_/auth/providers?provider=Email) for your project.
2. Under **Password security**, turn on **Prevent use of leaked passwords** (HaveIBeenPwned).
3. Save. Re-run **Security Advisor** in the dashboard.

### Option B — Management API (script)

1. Create a [Supabase access token](https://supabase.com/dashboard/account/tokens).
2. Add to `.env.local`:

   ```bash
   SUPABASE_ACCESS_TOKEN=your_personal_access_token
   ```

3. Run:

   ```bash
   pnpm db:enable-password-hibp
   ```

The script reads `NEXT_PUBLIC_SUPABASE_URL` to resolve the project ref and sets `password_hibp_enabled: true`.

### Verification

- Security Advisor no longer reports `auth_leaked_password_protection` / `leaked_password_protection`.
- Sign-up with a known breached password (e.g. `password123` from test lists) is rejected with a clear error.

## SECURITY DEFINER RPC functions

- Legacy `public.get_or_create_user(...)` must **not** be executable by `anon` / `authenticated` (see migration `0068_revoke_get_or_create_user_execute.sql`).
- Prefer Drizzle/server-side access for user profile rows; drop unused DEFINER RPCs when possible.

## Vercel environment variables (Needs Attention)

If Vercel shows **Needs Attention** on `POOLING_DATABASE_URL`, `DATABASE_URL`, or `GEMINI_API_KEY`, rotate each secret (do not delete the variable name).

### Validate locally first

```bash
pnpm db:validate-env
```

See `.env.example` for the expected shape. Local `.env.local` should include at minimum:

- `POOLING_DATABASE_URL` — Supabase **Transaction pooler** (port **6543**), used by the app on Vercel
- `DATABASE_URL` — optional direct/session fallback for CLI migrations
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey)

### Rotate in Vercel (Production + Preview)

**Option A — one command (recommended)**

1. Create a [Vercel access token](https://vercel.com/account/tokens) and add `VERCEL_TOKEN=...` to `.env.local`.
2. Run:

   ```bash
   pnpm db:validate-env
   pnpm db:sync-env-vercel --deploy
   ```

This copies `POOLING_DATABASE_URL`, `DATABASE_URL`, and `GEMINI_API_KEY` from `.env.local` into Vercel (Production + Preview) and triggers a Production redeploy.

**Option B — manual paste**

1. Run `pnpm db:copy-env-vercel all` (copies each value to clipboard on macOS).
2. Vercel → **Settings → Environment Variables** → edit each variable → **Sensitive** → Production + Preview → Save.
3. **Deployments → Redeploy** latest Production.

**Per-variable rotation**

1. **GEMINI_API_KEY:** create a new key in Google AI Studio → update in Vercel → redeploy → revoke old key in Google.
2. **POOLING_DATABASE_URL:** Supabase → **Connect** → **Transaction pooler** → copy URI → update in Vercel → redeploy.
3. **DATABASE_URL:** Supabase → **Direct connection** (port 5432) or session pooler → update in Vercel → redeploy. (Optional if pooler is always set.)

After redeploy, run `pnpm db:migrate` against production if schema changed.

## Pre-Deploy Security Checklist

- Run DB migrations: `pnpm db:migrate`.
- Confirm RLS is enabled on sensitive public tables, including `public.users` and `public.blog_posts`.
- Confirm RLS policy optimizations are applied:
  - `auth.uid()` predicates use `(select auth.uid())`.
  - `auth.jwt()` predicates use `((select auth.jwt()) ->> '...')`.
- Enable HaveIBeenPwned password protection (above).
- Re-run Supabase Security Advisor and ensure no critical auth/RLS warnings remain.
