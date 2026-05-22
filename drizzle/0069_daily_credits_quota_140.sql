-- Daily AI credits: 140 per UTC day (replaces monthly 20-quota defaults).

UPDATE "public"."user_credits"
SET
  "monthly_free_quota" = 140,
  "updated_at" = now()
WHERE "monthly_free_quota" < 140;

-- New rows created by ensureCreditRow use application default 140.
