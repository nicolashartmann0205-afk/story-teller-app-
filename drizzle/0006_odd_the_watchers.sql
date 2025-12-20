CREATE TABLE "dictionary_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"style_guide_id" uuid NOT NULL,
	"term" text NOT NULL,
	"definition" text,
	"usage_guidelines" text,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "style_guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"tone_id" text,
	"writing_style_id" text,
	"perspective_id" text,
	"tone_description" text,
	"complexity_level" text,
	"primary_color" text,
	"secondary_color" text,
	"font_heading" text,
	"font_body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stories" ADD COLUMN "style_guide_id" uuid;--> statement-breakpoint
ALTER TABLE "dictionary_entries" ADD CONSTRAINT "dictionary_entries_style_guide_id_style_guides_id_fk" FOREIGN KEY ("style_guide_id") REFERENCES "public"."style_guides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "style_guides" ADD CONSTRAINT "style_guides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_style_guide_id_style_guides_id_fk" FOREIGN KEY ("style_guide_id") REFERENCES "public"."style_guides"("id") ON DELETE set null ON UPDATE no action;