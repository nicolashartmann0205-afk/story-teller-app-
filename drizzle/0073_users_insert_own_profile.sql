-- Allow signed-in users to create their public.users row when missing (e.g. legacy accounts).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert_own_profile'
    ) THEN
      CREATE POLICY "users_insert_own_profile"
        ON "public"."users"
        FOR INSERT
        WITH CHECK ((select auth.uid()) = id);
    END IF;
  END IF;
END $$;
