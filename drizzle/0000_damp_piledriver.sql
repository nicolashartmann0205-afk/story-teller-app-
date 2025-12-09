CREATE TABLE IF NOT EXISTS "archetype_analytics" (
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
-- REMOVED: CREATE TABLE IF NOT EXISTS "auth"."users" (...) - Managed by Supabase
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"duration" numeric,
	"tension" integer,
	"emotion" text,
	"map_position_x" numeric,
	"map_position_y" numeric,
	"card_width_percent" numeric DEFAULT '10.0',
	"visual_style" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"story_type" jsonb,
	"hooks" jsonb,
	"mode" text,
	"mode_switch_history" jsonb,
	"moral_conflict_primary" text,
	"moral_conflict_secondary" text,
	"moral_complexity" text,
	"moral_data" jsonb DEFAULT '{}'::jsonb,
	"character" jsonb,
	"structure" jsonb,
	"draft_content" jsonb,
	"export_count" integer DEFAULT 0,
	"last_export_date" timestamp with time zone,
	"last_export_format" text,
	"export_history" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "story_maps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"current_view" text DEFAULT 'timeline',
	"zoom_level" numeric DEFAULT '1.0',
	"pan_position" jsonb DEFAULT '{"x":0,"y":0}'::jsonb,
	"structure_overlay_visible" boolean DEFAULT true,
	"structure_view_type" text,
	"overlay_opacity" numeric DEFAULT '0.7',
	"scene_positions" jsonb DEFAULT '{}'::jsonb,
	"active_filters" jsonb DEFAULT '[]'::jsonb,
	"visible_characters" jsonb DEFAULT '[]'::jsonb,
	"character_track_order" jsonb DEFAULT '[]'::jsonb,
	"arc_smoothing" boolean DEFAULT true,
	"show_average_line" boolean DEFAULT true,
	"arc_color_scheme" text DEFAULT 'gradient',
	"last_analysis" jsonb,
	"analysis_version" integer DEFAULT 1,
	"analysis_timestamp" timestamp with time zone,
	"last_export_settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "story_maps_story_id_unique" UNIQUE("story_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "structure_analytics" (
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
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "archetype_analytics" ADD CONSTRAINT "archetype_analytics_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "archetype_analytics" ADD CONSTRAINT "archetype_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scenes" ADD CONSTRAINT "scenes_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stories" ADD CONSTRAINT "stories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "story_maps" ADD CONSTRAINT "story_maps_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "story_maps" ADD CONSTRAINT "story_maps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "structure_analytics" ADD CONSTRAINT "structure_analytics_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "structure_analytics" ADD CONSTRAINT "structure_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
