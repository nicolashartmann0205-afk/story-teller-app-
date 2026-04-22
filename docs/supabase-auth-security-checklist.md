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
