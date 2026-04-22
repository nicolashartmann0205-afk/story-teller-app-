-- Optimize dictionary_entries_update_own per advisor recommendation.
-- Replace auth.uid() with (select auth.uid()) inside USING/WITH CHECK EXISTS predicates.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'dictionary_entries'
      AND policyname = 'dictionary_entries_update_own'
  ) THEN
    ALTER POLICY "dictionary_entries_update_own"
      ON "public"."dictionary_entries"
      USING (
        EXISTS (
          SELECT 1
          FROM public.style_guides sg
          WHERE sg.id = dictionary_entries.style_guide_id
            AND sg.user_id = (select auth.uid())
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.style_guides sg
          WHERE sg.id = dictionary_entries.style_guide_id
            AND sg.user_id = (select auth.uid())
        )
      );
  END IF;
END $$;
