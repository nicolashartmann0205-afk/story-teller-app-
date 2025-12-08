CREATE TABLE "structure_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid,
	"user_id" uuid,
	"structure_id" text NOT NULL,
	"guidance_level" text,
	"story_type" text,
	"selection_method" text,
	"beats_completed" integer DEFAULT 0,
	"total_beats" integer,
	"time_spent_seconds" integer,
	"completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "structure_analytics" ADD CONSTRAINT "structure_analytics_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structure_analytics" ADD CONSTRAINT "structure_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;