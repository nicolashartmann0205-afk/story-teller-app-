ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "hooks" jsonb;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "mode" text;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "mode_switch_history" jsonb;
