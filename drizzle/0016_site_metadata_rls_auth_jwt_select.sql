-- Optimize site_metadata admin RLS predicates by wrapping auth.jwt() in a SELECT.
-- This follows Supabase guidance to reduce per-row auth function re-evaluation.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_metadata'
      AND policyname = 'site_metadata_admin_select'
  ) THEN
    ALTER POLICY "site_metadata_admin_select"
      ON "public"."site_metadata"
      USING ((SELECT auth.jwt()) ->> 'email' = 'nicolas@hartmanns.net');
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_metadata'
      AND policyname = 'site_metadata_admin_insert'
  ) THEN
    ALTER POLICY "site_metadata_admin_insert"
      ON "public"."site_metadata"
      WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'nicolas@hartmanns.net');
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_metadata'
      AND policyname = 'site_metadata_admin_update'
  ) THEN
    ALTER POLICY "site_metadata_admin_update"
      ON "public"."site_metadata"
      USING ((SELECT auth.jwt()) ->> 'email' = 'nicolas@hartmanns.net')
      WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'nicolas@hartmanns.net');
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_metadata'
      AND policyname = 'site_metadata_admin_delete'
  ) THEN
    ALTER POLICY "site_metadata_admin_delete"
      ON "public"."site_metadata"
      USING ((SELECT auth.jwt()) ->> 'email' = 'nicolas@hartmanns.net');
  END IF;
END $$;
