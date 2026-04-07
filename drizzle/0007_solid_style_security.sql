ALTER TABLE "public"."style_guides" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'style_guides'
      AND policyname = 'Users can view their own style guides'
  ) THEN
    CREATE POLICY "Users can view their own style guides"
      ON "public"."style_guides"
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'style_guides'
      AND policyname = 'Users can insert their own style guides'
  ) THEN
    CREATE POLICY "Users can insert their own style guides"
      ON "public"."style_guides"
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'style_guides'
      AND policyname = 'Users can update their own style guides'
  ) THEN
    CREATE POLICY "Users can update their own style guides"
      ON "public"."style_guides"
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'style_guides'
      AND policyname = 'Users can delete their own style guides'
  ) THEN
    CREATE POLICY "Users can delete their own style guides"
      ON "public"."style_guides"
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;
