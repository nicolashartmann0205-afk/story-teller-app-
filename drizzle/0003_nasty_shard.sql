ALTER TABLE "stories" ADD COLUMN "moral_conflict_primary" text;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "moral_conflict_secondary" text;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "moral_complexity" text;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "moral_data" jsonb DEFAULT '{}'::jsonb;