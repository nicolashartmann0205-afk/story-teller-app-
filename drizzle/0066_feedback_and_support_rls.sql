-- RLS for feedback_submissions, support_sessions, and support_messages.
-- Server-side Drizzle uses a DB role that bypasses RLS; this secures direct/anon API access.

ALTER TABLE IF EXISTS "public"."feedback_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."support_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."support_messages" ENABLE ROW LEVEL SECURITY;

-- feedback_submissions: public insert, admin-only read/update
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'feedback_submissions'
  ) THEN
    ALTER TABLE "public"."feedback_submissions" ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'feedback_submissions'
        AND policyname = 'feedback_submissions_insert_public'
    ) THEN
      CREATE POLICY "feedback_submissions_insert_public"
        ON "public"."feedback_submissions"
        FOR INSERT
        WITH CHECK (
          status = 'new'
          AND (
            submitted_by IS NULL
            OR submitted_by = (select auth.uid())
          )
        );
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'feedback_submissions'
        AND policyname = 'feedback_submissions_admin_select'
    ) THEN
      CREATE POLICY "feedback_submissions_admin_select"
        ON "public"."feedback_submissions"
        FOR SELECT
        USING ((select auth.jwt() ->> 'email') = 'nicolas@hartmanns.net');
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'feedback_submissions'
        AND policyname = 'feedback_submissions_admin_update'
    ) THEN
      CREATE POLICY "feedback_submissions_admin_update"
        ON "public"."feedback_submissions"
        FOR UPDATE
        USING ((select auth.jwt() ->> 'email') = 'nicolas@hartmanns.net')
        WITH CHECK ((select auth.jwt() ->> 'email') = 'nicolas@hartmanns.net');
    END IF;
  END IF;
END $$;

-- support_sessions: signed-in owner only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'support_sessions'
  ) THEN
    ALTER TABLE "public"."support_sessions" ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'support_sessions'
        AND policyname = 'support_sessions_select_own'
    ) THEN
      CREATE POLICY "support_sessions_select_own"
        ON "public"."support_sessions"
        FOR SELECT
        USING (user_id = (select auth.uid()));
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'support_sessions'
        AND policyname = 'support_sessions_insert_own'
    ) THEN
      CREATE POLICY "support_sessions_insert_own"
        ON "public"."support_sessions"
        FOR INSERT
        WITH CHECK (
          (select auth.uid()) IS NOT NULL
          AND user_id = (select auth.uid())
        );
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'support_sessions'
        AND policyname = 'support_sessions_update_own'
    ) THEN
      CREATE POLICY "support_sessions_update_own"
        ON "public"."support_sessions"
        FOR UPDATE
        USING (user_id = (select auth.uid()))
        WITH CHECK (user_id = (select auth.uid()));
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'support_sessions'
        AND policyname = 'support_sessions_delete_own'
    ) THEN
      CREATE POLICY "support_sessions_delete_own"
        ON "public"."support_sessions"
        FOR DELETE
        USING (user_id = (select auth.uid()));
    END IF;
  END IF;
END $$;

-- support_messages: via owning support_session
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'support_messages'
  ) THEN
    ALTER TABLE "public"."support_messages" ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'support_messages'
        AND policyname = 'support_messages_select_own'
    ) THEN
      CREATE POLICY "support_messages_select_own"
        ON "public"."support_messages"
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1
            FROM public.support_sessions s
            WHERE s.id = support_messages.session_id
              AND s.user_id = (select auth.uid())
          )
        );
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'support_messages'
        AND policyname = 'support_messages_insert_own'
    ) THEN
      CREATE POLICY "support_messages_insert_own"
        ON "public"."support_messages"
        FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM public.support_sessions s
            WHERE s.id = support_messages.session_id
              AND s.user_id = (select auth.uid())
          )
        );
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'support_messages'
        AND policyname = 'support_messages_update_own'
    ) THEN
      CREATE POLICY "support_messages_update_own"
        ON "public"."support_messages"
        FOR UPDATE
        USING (
          EXISTS (
            SELECT 1
            FROM public.support_sessions s
            WHERE s.id = support_messages.session_id
              AND s.user_id = (select auth.uid())
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM public.support_sessions s
            WHERE s.id = support_messages.session_id
              AND s.user_id = (select auth.uid())
          )
        );
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'support_messages'
        AND policyname = 'support_messages_delete_own'
    ) THEN
      CREATE POLICY "support_messages_delete_own"
        ON "public"."support_messages"
        FOR DELETE
        USING (
          EXISTS (
            SELECT 1
            FROM public.support_sessions s
            WHERE s.id = support_messages.session_id
              AND s.user_id = (select auth.uid())
          )
        );
    END IF;
  END IF;
END $$;
