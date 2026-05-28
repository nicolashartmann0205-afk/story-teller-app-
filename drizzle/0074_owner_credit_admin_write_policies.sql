-- Allow the site owner to manage credits via PostgREST fallback when
-- SUPABASE_SERVICE_ROLE_KEY is unavailable in production.
-- Access is restricted to the owner email only.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_credits'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'user_credits'
        AND policyname = 'user_credits_owner_admin_select'
    ) THEN
      CREATE POLICY "user_credits_owner_admin_select"
        ON "public"."user_credits"
        FOR SELECT
        USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'user_credits'
        AND policyname = 'user_credits_owner_admin_insert'
    ) THEN
      CREATE POLICY "user_credits_owner_admin_insert"
        ON "public"."user_credits"
        FOR INSERT
        WITH CHECK (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'user_credits'
        AND policyname = 'user_credits_owner_admin_update'
    ) THEN
      CREATE POLICY "user_credits_owner_admin_update"
        ON "public"."user_credits"
        FOR UPDATE
        USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net')
        WITH CHECK (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'credit_transactions'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'credit_transactions'
        AND policyname = 'credit_transactions_owner_admin_insert'
    ) THEN
      CREATE POLICY "credit_transactions_owner_admin_insert"
        ON "public"."credit_transactions"
        FOR INSERT
        WITH CHECK (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
    END IF;
  END IF;
END $$;
