-- Optimize users profile policy by evaluating auth.uid() once per statement.
-- Supabase Security Advisor recommends `(select auth.uid())` in RLS predicates.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'users'
  ) AND EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can view own profile'
  ) THEN
    ALTER POLICY "Users can view own profile"
      ON "public"."users"
      USING ((select auth.uid()) = id);
  END IF;
END $$;
