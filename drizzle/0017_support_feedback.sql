CREATE TABLE IF NOT EXISTS "feedback_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "submitted_by" uuid REFERENCES "auth"."users"("id") ON DELETE SET NULL,
  "email" text,
  "category" text NOT NULL,
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "status" text NOT NULL DEFAULT 'new',
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "feedback_submissions_created_at_idx"
  ON "feedback_submissions" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "feedback_submissions_status_idx"
  ON "feedback_submissions" ("status");

CREATE TABLE IF NOT EXISTS "support_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "title" text NOT NULL DEFAULT 'IT support session',
  "status" text NOT NULL DEFAULT 'open',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "support_sessions_user_id_idx"
  ON "support_sessions" ("user_id");

CREATE INDEX IF NOT EXISTS "support_sessions_created_at_idx"
  ON "support_sessions" ("created_at" DESC);

CREATE TABLE IF NOT EXISTS "support_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" uuid NOT NULL REFERENCES "support_sessions"("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "support_messages_session_id_idx"
  ON "support_messages" ("session_id");

CREATE INDEX IF NOT EXISTS "support_messages_created_at_idx"
  ON "support_messages" ("created_at" ASC);
