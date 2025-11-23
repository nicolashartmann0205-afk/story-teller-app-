-- Create stories table
CREATE TABLE IF NOT EXISTS "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraint to auth.users
-- Note: This references Supabase's auth.users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stories_user_id_auth_users_id_fk'
  ) THEN
    ALTER TABLE "stories" 
    ADD CONSTRAINT "stories_user_id_auth_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS "idx_stories_user_id" ON "stories" ("user_id");

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS "idx_stories_created_at" ON "stories" ("created_at");

-- Enable Row Level Security (RLS)
ALTER TABLE "stories" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view their own stories
CREATE POLICY "Users can view their own stories"
  ON "stories"
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own stories
CREATE POLICY "Users can insert their own stories"
  ON "stories"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own stories
CREATE POLICY "Users can update their own stories"
  ON "stories"
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own stories
CREATE POLICY "Users can delete their own stories"
  ON "stories"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_stories_updated_at ON "stories";
CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON "stories"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

