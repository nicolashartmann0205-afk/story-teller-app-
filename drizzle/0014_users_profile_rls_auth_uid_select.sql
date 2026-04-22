-- Optimize users profile RLS policy predicates for planner caching.
-- Supabase recommends wrapping auth.* calls as (select auth.*()) in policies.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can view own profile'
  ) THEN
    ALTER POLICY "Users can view own profile"
      ON "public"."users"
      USING ((SELECT auth.uid()) = id);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can update own profile'
  ) THEN
    ALTER POLICY "Users can update own profile"
      ON "public"."users"
      USING ((SELECT auth.uid()) = id)
      WITH CHECK ((SELECT auth.uid()) = id);
  END IF;
END $$;
