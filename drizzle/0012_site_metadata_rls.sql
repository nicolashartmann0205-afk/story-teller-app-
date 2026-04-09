-- Ensure site_metadata RLS is applied after table creation (fresh DB installs).
ALTER TABLE "public"."site_metadata" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_metadata'
      AND policyname = 'site_metadata_admin_select'
  ) THEN
    CREATE POLICY "site_metadata_admin_select"
      ON "public"."site_metadata"
      FOR SELECT
      USING (auth.jwt() ->> 'email' = 'nicolas@hartmanns.net');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_metadata'
      AND policyname = 'site_metadata_admin_insert'
  ) THEN
    CREATE POLICY "site_metadata_admin_insert"
      ON "public"."site_metadata"
      FOR INSERT
      WITH CHECK (auth.jwt() ->> 'email' = 'nicolas@hartmanns.net');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_metadata'
      AND policyname = 'site_metadata_admin_update'
  ) THEN
    CREATE POLICY "site_metadata_admin_update"
      ON "public"."site_metadata"
      FOR UPDATE
      USING (auth.jwt() ->> 'email' = 'nicolas@hartmanns.net')
      WITH CHECK (auth.jwt() ->> 'email' = 'nicolas@hartmanns.net');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_metadata'
      AND policyname = 'site_metadata_admin_delete'
  ) THEN
    CREATE POLICY "site_metadata_admin_delete"
      ON "public"."site_metadata"
      FOR DELETE
      USING (auth.jwt() ->> 'email' = 'nicolas@hartmanns.net');
  END IF;
END $$;
