ALTER TABLE "structure_analytics" DROP CONSTRAINT "structure_analytics_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "structure_analytics" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "structure_analytics" ADD CONSTRAINT "structure_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;