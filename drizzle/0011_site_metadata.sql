CREATE TABLE IF NOT EXISTS "site_metadata" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "page_key" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "canonical_url" text NOT NULL,
  "updated_by" uuid,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_metadata_page_key_unique'
  ) THEN
    ALTER TABLE "site_metadata"
      ADD CONSTRAINT "site_metadata_page_key_unique" UNIQUE("page_key");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_metadata_updated_by_users_id_fk'
  ) THEN
    ALTER TABLE "site_metadata"
      ADD CONSTRAINT "site_metadata_updated_by_users_id_fk"
      FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id")
      ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
