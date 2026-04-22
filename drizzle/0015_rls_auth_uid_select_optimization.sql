-- Optimize RLS policy predicates by wrapping auth.uid() in a SELECT.
-- This follows Supabase guidance to avoid per-row re-evaluation overhead.

DO $$
BEGIN
  -- stories (current policy names)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_select_own') THEN
    ALTER POLICY "stories_select_own" ON "public"."stories"
      USING (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_insert_own') THEN
    ALTER POLICY "stories_insert_own" ON "public"."stories"
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_update_own') THEN
    ALTER POLICY "stories_update_own" ON "public"."stories"
      USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'stories_delete_own') THEN
    ALTER POLICY "stories_delete_own" ON "public"."stories"
      USING (user_id = (SELECT auth.uid()));
  END IF;

  -- stories (legacy policy names)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can view their own stories') THEN
    ALTER POLICY "Users can view their own stories" ON "public"."stories"
      USING ((SELECT auth.uid()) = user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can insert their own stories') THEN
    ALTER POLICY "Users can insert their own stories" ON "public"."stories"
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can update their own stories') THEN
    ALTER POLICY "Users can update their own stories" ON "public"."stories"
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'stories' AND policyname = 'Users can delete their own stories') THEN
    ALTER POLICY "Users can delete their own stories" ON "public"."stories"
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- style_guides (current policy names)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'style_guides_select_own') THEN
    ALTER POLICY "style_guides_select_own" ON "public"."style_guides"
      USING (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'style_guides_insert_own') THEN
    ALTER POLICY "style_guides_insert_own" ON "public"."style_guides"
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'style_guides_update_own') THEN
    ALTER POLICY "style_guides_update_own" ON "public"."style_guides"
      USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'style_guides_delete_own') THEN
    ALTER POLICY "style_guides_delete_own" ON "public"."style_guides"
      USING (user_id = (SELECT auth.uid()));
  END IF;

  -- style_guides (legacy policy names)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'Users can view their own style guides') THEN
    ALTER POLICY "Users can view their own style guides" ON "public"."style_guides"
      USING ((SELECT auth.uid()) = user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'Users can insert their own style guides') THEN
    ALTER POLICY "Users can insert their own style guides" ON "public"."style_guides"
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'Users can update their own style guides') THEN
    ALTER POLICY "Users can update their own style guides" ON "public"."style_guides"
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'style_guides' AND policyname = 'Users can delete their own style guides') THEN
    ALTER POLICY "Users can delete their own style guides" ON "public"."style_guides"
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- dictionary_entries
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dictionary_entries' AND policyname = 'dictionary_entries_select_own') THEN
    ALTER POLICY "dictionary_entries_select_own" ON "public"."dictionary_entries"
      USING (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = (SELECT auth.uid())));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dictionary_entries' AND policyname = 'dictionary_entries_insert_own') THEN
    ALTER POLICY "dictionary_entries_insert_own" ON "public"."dictionary_entries"
      WITH CHECK (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = (SELECT auth.uid())));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dictionary_entries' AND policyname = 'dictionary_entries_update_own') THEN
    ALTER POLICY "dictionary_entries_update_own" ON "public"."dictionary_entries"
      USING (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = (SELECT auth.uid())))
      WITH CHECK (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = (SELECT auth.uid())));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dictionary_entries' AND policyname = 'dictionary_entries_delete_own') THEN
    ALTER POLICY "dictionary_entries_delete_own" ON "public"."dictionary_entries"
      USING (EXISTS (SELECT 1 FROM public.style_guides sg WHERE sg.id = style_guide_id AND sg.user_id = (SELECT auth.uid())));
  END IF;

  -- scenes
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scenes' AND policyname = 'scenes_select_own') THEN
    ALTER POLICY "scenes_select_own" ON "public"."scenes"
      USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scenes' AND policyname = 'scenes_insert_own') THEN
    ALTER POLICY "scenes_insert_own" ON "public"."scenes"
      WITH CHECK (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scenes' AND policyname = 'scenes_update_own') THEN
    ALTER POLICY "scenes_update_own" ON "public"."scenes"
      USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      WITH CHECK (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scenes' AND policyname = 'scenes_delete_own') THEN
    ALTER POLICY "scenes_delete_own" ON "public"."scenes"
      USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())));
  END IF;

  -- story_maps
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_maps' AND policyname = 'story_maps_select_own') THEN
    ALTER POLICY "story_maps_select_own" ON "public"."story_maps"
      USING (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_maps' AND policyname = 'story_maps_insert_own') THEN
    ALTER POLICY "story_maps_insert_own" ON "public"."story_maps"
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_maps' AND policyname = 'story_maps_update_own') THEN
    ALTER POLICY "story_maps_update_own" ON "public"."story_maps"
      USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_maps' AND policyname = 'story_maps_delete_own') THEN
    ALTER POLICY "story_maps_delete_own" ON "public"."story_maps"
      USING (user_id = (SELECT auth.uid()));
  END IF;

  -- archetype_analytics
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'archetype_analytics' AND policyname = 'archetype_analytics_select_own') THEN
    ALTER POLICY "archetype_analytics_select_own" ON "public"."archetype_analytics"
      USING (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      );
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'archetype_analytics' AND policyname = 'archetype_analytics_insert_own') THEN
    ALTER POLICY "archetype_analytics_insert_own" ON "public"."archetype_analytics"
      WITH CHECK (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      );
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'archetype_analytics' AND policyname = 'archetype_analytics_update_own') THEN
    ALTER POLICY "archetype_analytics_update_own" ON "public"."archetype_analytics"
      USING (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      )
      WITH CHECK (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      );
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'archetype_analytics' AND policyname = 'archetype_analytics_delete_own') THEN
    ALTER POLICY "archetype_analytics_delete_own" ON "public"."archetype_analytics"
      USING (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      );
  END IF;

  -- structure_analytics
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'structure_analytics' AND policyname = 'structure_analytics_select_own') THEN
    ALTER POLICY "structure_analytics_select_own" ON "public"."structure_analytics"
      USING (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      );
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'structure_analytics' AND policyname = 'structure_analytics_insert_own') THEN
    ALTER POLICY "structure_analytics_insert_own" ON "public"."structure_analytics"
      WITH CHECK (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      );
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'structure_analytics' AND policyname = 'structure_analytics_update_own') THEN
    ALTER POLICY "structure_analytics_update_own" ON "public"."structure_analytics"
      USING (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      )
      WITH CHECK (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      );
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'structure_analytics' AND policyname = 'structure_analytics_delete_own') THEN
    ALTER POLICY "structure_analytics_delete_own" ON "public"."structure_analytics"
      USING (
        (story_id IS NULL AND user_id = (SELECT auth.uid()))
        OR (story_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = (SELECT auth.uid())))
      );
  END IF;
END $$;
