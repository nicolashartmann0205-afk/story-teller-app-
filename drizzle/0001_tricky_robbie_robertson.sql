ALTER TABLE "stories" ADD COLUMN "hooks" jsonb;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "mode" text;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "mode_switch_history" jsonb;