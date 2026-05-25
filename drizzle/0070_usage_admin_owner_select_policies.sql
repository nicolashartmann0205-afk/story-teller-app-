-- Let the site owner load usage metrics via Supabase PostgREST (signed-in JWT)
-- when POOLING_DATABASE_URL on Vercel is broken and service role is not set.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_usage_admin_select'
  ) THEN
    CREATE POLICY "users_usage_admin_select"
      ON "public"."users"
      FOR SELECT
      USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_usage_admin_select'
  ) THEN
    CREATE POLICY "stories_usage_admin_select"
      ON "public"."stories"
      FOR SELECT
      USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'credit_transactions' AND policyname = 'credit_transactions_usage_admin_select'
  ) THEN
    CREATE POLICY "credit_transactions_usage_admin_select"
      ON "public"."credit_transactions"
      FOR SELECT
      USING (((select auth.jwt()) ->> 'email') = 'nicolas@hartmanns.net');
  END IF;
END $$;
