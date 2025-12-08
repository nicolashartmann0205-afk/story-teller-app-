CREATE TABLE "scenes" (
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
CREATE TABLE "story_maps" (
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
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_maps" ADD CONSTRAINT "story_maps_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_maps" ADD CONSTRAINT "story_maps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;