-- Allow the site owner (signed-in JWT) to read aggregate usage data via PostgREST
-- when SUPABASE_SERVICE_ROLE_KEY is not configured on Vercel.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_owner_admin_select'
    ) THEN
      CREATE POLICY "users_owner_admin_select"
        ON "public"."users"
        FOR SELECT
        USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'stories'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_owner_admin_select'
    ) THEN
      CREATE POLICY "stories_owner_admin_select"
        ON "public"."stories"
        FOR SELECT
        USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'credit_transactions'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'credit_transactions'
        AND policyname = 'credit_transactions_owner_admin_select'
    ) THEN
      CREATE POLICY "credit_transactions_owner_admin_select"
        ON "public"."credit_transactions"
        FOR SELECT
        USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
    END IF;
  END IF;
END $$;
