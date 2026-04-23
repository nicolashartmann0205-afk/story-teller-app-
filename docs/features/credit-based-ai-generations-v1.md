# Credit Based AI Generations V1

## Feature Name
Credit Based AI Generations V1

## Goal
Introduce a simple and reliable credit system for AI generation actions so Story Teller can enforce fair usage limits, unlock monetization, and prevent uncontrolled compute costs while keeping user experience clear.

## User Story
As a signed-in Story Teller user, I want to see how many generation credits I have and spend one credit each time I run AI generation, so I understand usage limits and can continue generating by refilling credits.

## Functional Requirements
1. The system must maintain a per-user credit balance tied to authenticated `auth.users` identities.
2. Each AI generation action in scope (story generation and scene generation) must consume exactly 1 credit on successful debit.
3. Credit debit must happen server-side before the expensive AI call is executed.
4. If a user has insufficient credits (`balance < 1`), generation must be blocked and return a stable `INSUFFICIENT_CREDITS` error shape.
5. Generation requests must support idempotency via `request_id` so retries cannot double-charge the same generation attempt.
6. The app UI must display current user credit balance in an always-visible authenticated location (header or equivalent persistent area).
7. Generation entry points must show a clear empty-credit state (disabled action + explanation + CTA to refill/upgrade path).
8. The system must support monthly free credit refill according to configurable quota.
9. Monthly refill logic must run safely if triggered more than once (no duplicate refill for the same period).
10. Admins must have a temporary v1 mechanism to grant credits manually to specific users.
11. Every credit mutation must be logged as an immutable transaction row for auditability.
12. Existing authentication/authorization checks must remain enforced for all protected generation routes.

## Data Requirements
- Add `user_credits` table:
  - `user_id` UUID primary key, FK to `auth.users(id)` with cascade delete
  - `balance` integer not null default `0`
  - `monthly_free_quota` integer not null default `20`
  - `monthly_used` integer not null default `0`
  - `period_start` timestamptz not null
  - `updated_at` timestamptz not null default `now()`
- Add `credit_transactions` table:
  - `id` UUID primary key
  - `user_id` UUID FK to `auth.users(id)`
  - `type` text not null (`debit`, `refill`, `admin_grant`)
  - `amount` integer not null (signed or unsigned with consistent convention)
  - `reason` text not null (for example `story_generate`, `scene_generate`, `monthly_refill`)
  - `request_id` text unique nullable (idempotency key for generation debits)
  - `metadata` JSONB default `{}`
  - `created_at` timestamptz not null default `now()`
- Add indexes for `credit_transactions(user_id, created_at desc)` and unique `request_id` where non-null.
- Enable RLS on both tables.
- RLS read policy: users can read only their own rows.
- Mutation policy: direct client writes denied; mutations occur only through trusted server-side paths.

## User Flow
1. User signs in to Story Teller.
2. User sees current credit balance in the authenticated UI shell.
3. User clicks an AI generation action (for example generate scene).
4. Backend validates session and attempts atomic credit debit with `request_id`.
5. If debit succeeds, generation runs and user sees normal generation result.
6. If debit fails for insufficient credits, generation is blocked and user sees refill/upgrade guidance.
7. User receives monthly free refill automatically when period rolls over.
8. Admin can grant credits manually for support/recovery cases.
9. User can review recent credit activity (optional v1 light history or internal/admin-only verification).

## Acceptance Criteria
- Authenticated user with `balance >= 1` can run generation and ends with `balance - 1`.
- Authenticated user with `balance = 0` cannot run generation and receives deterministic insufficient-credit response.
- Same generation retry using the same `request_id` never produces more than one debit transaction.
- Credit transaction ledger records every debit, refill, and admin grant.
- Monthly refill runs without creating duplicate refill rows for the same user period.
- UI shows up-to-date credit balance and clear empty-state guidance.
- Users cannot read or modify another user’s credit data.
- Existing protected route/auth behavior remains unchanged except for credit gating.

## Edge Cases
- User submits multiple generation requests quickly (race conditions on debit).
- Generation fails after credit debit succeeds (define whether v1 refunds automatically or not; default: no automatic refund, log failure for manual support).
- Client retries request due to network timeout after server already debited.
- New user has no pre-created `user_credits` row on first generation.
- Monthly refill job runs twice in one day.
- Admin grant uses negative/invalid amount.
- Database outage during debit transaction.
- User signs out between frontend action and server execution.
- Backfill needed for existing users before launch.

## Non-Functional Requirements
- Atomic debit path should complete quickly (target p95 < 150 ms excluding AI runtime).
- Credit checks and debits must be transaction-safe and race-condition resistant.
- Ledger writes must be append-only and auditable.
- UI credit display should not add noticeable layout shift or latency in app shell.
- Error messages for insufficient credits must be human-readable and action-oriented.
- Feature must ship behind a controlled rollout flag to reduce production risk.
