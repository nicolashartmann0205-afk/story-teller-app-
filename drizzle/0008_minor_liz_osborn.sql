CREATE TABLE "archetype_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid,
	"user_id" uuid,
	"primary_archetype" text NOT NULL,
	"secondary_archetype" text,
	"story_type" text,
	"selection_method" text,
	"has_journey" boolean DEFAULT false,
	"has_dark_sides" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "structure_analytics" DROP CONSTRAINT "structure_analytics_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "structure_analytics" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "character" jsonb;--> statement-breakpoint
ALTER TABLE "archetype_analytics" ADD CONSTRAINT "archetype_analytics_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archetype_analytics" ADD CONSTRAINT "archetype_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structure_analytics" ADD CONSTRAINT "structure_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;