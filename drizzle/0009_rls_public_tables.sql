-- Enable RLS and owner-scoped policies for Supabase Security Advisor (public schema).
-- Server-side Drizzle often uses a DB role that bypasses RLS; this secures direct/anon access.

ALTER TABLE "public"."stories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."style_guides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dictionary_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scenes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."story_maps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."archetype_analytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."structure_analytics" ENABLE ROW LEVEL SECURITY;

-- stories: direct owner
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_select_own') THEN
    CREATE POLICY "stories_select_own" ON "public"."stories" FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_insert_own') THEN
    CREATE POLICY "stories_insert_own" ON "public"."stories" FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_update_own') THEN
    CREATE POLICY "stories_update_own" ON "public"."stories" FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_delete_own') THEN
    CREATE POLICY "stories_delete_own" ON "public"."stories" FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- style_guides: direct owner
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'style_guides_select_own') THEN
    CREATE POLICY "style_guides_select_own" ON "public"."style_guides" FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'style_guides_insert_own') THEN
    CREATE POLICY "style_guides_insert_own" ON "public"."style_guides" FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'style_guides_update_own') THEN
    CREATE POLICY "style_guides_update_own" ON "public"."style_guides" FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'style_guides_delete_own') THEN
    CREATE POLICY "style_guides_delete_own" ON "public"."style_guides" FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- dictionary_entries: via owning style_guide
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dictionary_entries' AND policyname = 'dictionary_entries_select_own') THEN
    CREATE POLICY "dictionary_entries_select_own" ON "public"."dictionary_entries" FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dictionary_entries' AND policyname = 'dictionary_entries_insert_own') THEN
    CREATE POLICY "dictionary_entries_insert_own" ON "public"."dictionary_entries" FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dictionary_entries' AND policyname = 'dictionary_entries_update_own') THEN
    CREATE POLICY "dictionary_entries_update_own" ON "public"."dictionary_entries" FOR UPDATE
      USING (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dictionary_entries' AND policyname = 'dictionary_entries_delete_own') THEN
    CREATE POLICY "dictionary_entries_delete_own" ON "public"."dictionary_entries" FOR DELETE
      USING (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = auth.uid()));
  END IF;
END $$;

-- scenes: via owning story
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scenes' AND policyname = 'scenes_select_own') THEN
    CREATE POLICY "scenes_select_own" ON "public"."scenes" FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scenes' AND policyname = 'scenes_insert_own') THEN
    CREATE POLICY "scenes_insert_own" ON "public"."scenes" FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scenes' AND policyname = 'scenes_update_own') THEN
    CREATE POLICY "scenes_update_own" ON "public"."scenes" FOR UPDATE
      USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scenes' AND policyname = 'scenes_delete_own') THEN
    CREATE POLICY "scenes_delete_own" ON "public"."scenes" FOR DELETE
      USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()));
  END IF;
END $$;

-- story_maps: direct user_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_maps' AND policyname = 'story_maps_select_own') THEN
    CREATE POLICY "story_maps_select_own" ON "public"."story_maps" FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_maps' AND policyname = 'story_maps_insert_own') THEN
    CREATE POLICY "story_maps_insert_own" ON "public"."story_maps" FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_maps' AND policyname = 'story_maps_update_own') THEN
    CREATE POLICY "story_maps_update_own" ON "public"."story_maps" FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_maps' AND policyname = 'story_maps_delete_own') THEN
    CREATE POLICY "story_maps_delete_own" ON "public"."story_maps" FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- archetype_analytics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'archetype_analytics' AND policyname = 'archetype_analytics_select_own') THEN
    CREATE POLICY "archetype_analytics_select_own" ON "public"."archetype_analytics" FOR SELECT
      USING (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'archetype_analytics' AND policyname = 'archetype_analytics_insert_own') THEN
    CREATE POLICY "archetype_analytics_insert_own" ON "public"."archetype_analytics" FOR INSERT
      WITH CHECK (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'archetype_analytics' AND policyname = 'archetype_analytics_update_own') THEN
    CREATE POLICY "archetype_analytics_update_own" ON "public"."archetype_analytics" FOR UPDATE
      USING (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      )
      WITH CHECK (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'archetype_analytics' AND policyname = 'archetype_analytics_delete_own') THEN
    CREATE POLICY "archetype_analytics_delete_own" ON "public"."archetype_analytics" FOR DELETE
      USING (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      );
  END IF;
END $$;

-- structure_analytics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'structure_analytics' AND policyname = 'structure_analytics_select_own') THEN
    CREATE POLICY "structure_analytics_select_own" ON "public"."structure_analytics" FOR SELECT
      USING (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'structure_analytics' AND policyname = 'structure_analytics_insert_own') THEN
    CREATE POLICY "structure_analytics_insert_own" ON "public"."structure_analytics" FOR INSERT
      WITH CHECK (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'structure_analytics' AND policyname = 'structure_analytics_update_own') THEN
    CREATE POLICY "structure_analytics_update_own" ON "public"."structure_analytics" FOR UPDATE
      USING (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      )
      WITH CHECK (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'structure_analytics' AND policyname = 'structure_analytics_delete_own') THEN
    CREATE POLICY "structure_analytics_delete_own" ON "public"."structure_analytics" FOR DELETE
      USING (
        (story_id IS NULL AND user_id = auth.uid())
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid()))
      );
  END IF;
END $$;
