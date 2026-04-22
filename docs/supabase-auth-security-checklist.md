# Supabase Auth Security Checklist

Use this checklist for each Supabase environment (local/staging/production).

## Compromised Password Protection (HaveIBeenPwned)

- **Setting:** Enable leaked/compromised password checks in Supabase Auth.
- **Where:** Supabase Dashboard -> Authentication -> Providers -> Email (password settings).
- **Why:** Blocks users from setting passwords that are known to be compromised.
- **Required state:** `Enabled` in all environments.

## Verification

- Attempt to set or reset to a known weak/compromised password.
- Confirm Supabase rejects it with a password safety error.

## Pre-Deploy Security Checklist

- Run DB migrations: `pnpm db:migrate`.
- Confirm RLS is enabled on sensitive public tables, including `public.users` and `public.blog_posts`.
- Confirm RLS policy optimizations are applied:
  - `auth.uid()` predicates use `(select auth.uid())`.
  - `auth.jwt()` predicates use `(select auth.jwt())`.
- Re-run Supabase Security Advisor and ensure no critical auth/RLS warnings remain.
