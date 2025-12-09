ALTER TABLE "scenes" ADD COLUMN "structure_beat" text;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "template_type" text;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "movie_time_action" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "movie_time_emotion" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "movie_time_meaning" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "scene_content" text;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "ai_draft_versions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "user_notes" text;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "completeness_status" text DEFAULT 'empty';--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "last_feedback" jsonb;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "show_tell_score" integer;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "duration_estimate" text;--> statement-breakpoint
ALTER TABLE "scenes" ADD COLUMN "word_count" integer DEFAULT 0;