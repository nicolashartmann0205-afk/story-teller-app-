-- Credit-based AI generations v1
-- Tracks per-user credits and immutable credit ledger events.

CREATE TABLE IF NOT EXISTS "user_credits" (
  "user_id" uuid PRIMARY KEY REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "balance" integer NOT NULL DEFAULT 20,
  "monthly_free_quota" integer NOT NULL DEFAULT 20,
  "monthly_used" integer NOT NULL DEFAULT 0,
  "period_start" timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "user_credits_balance_non_negative" CHECK ("balance" >= 0),
  CONSTRAINT "user_credits_monthly_free_quota_non_negative" CHECK ("monthly_free_quota" >= 0),
  CONSTRAINT "user_credits_monthly_used_non_negative" CHECK ("monthly_used" >= 0)
);

CREATE TABLE IF NOT EXISTS "credit_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "amount" integer NOT NULL,
  "reason" text NOT NULL,
  "request_id" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "credit_transactions_type_check" CHECK ("type" IN ('debit', 'refill', 'admin_grant'))
);

CREATE INDEX IF NOT EXISTS "credit_transactions_user_created_at_idx"
  ON "credit_transactions" ("user_id", "created_at" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "credit_transactions_request_id_unique"
  ON "credit_transactions" ("request_id")
  WHERE "request_id" IS NOT NULL;

ALTER TABLE "public"."user_credits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."credit_transactions" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_credits'
      AND policyname = 'user_credits_select_own'
  ) THEN
    CREATE POLICY "user_credits_select_own"
      ON "public"."user_credits"
      FOR SELECT
      USING ("user_id" = (select auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'credit_transactions'
      AND policyname = 'credit_transactions_select_own'
  ) THEN
    CREATE POLICY "credit_transactions_select_own"
      ON "public"."credit_transactions"
      FOR SELECT
      USING ("user_id" = (select auth.uid()));
  END IF;
END $$;
