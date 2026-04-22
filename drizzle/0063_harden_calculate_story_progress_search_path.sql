-- Harden SECURITY DEFINER function against role-mutable search_path.
-- Supabase security advisor expects explicit search_path for such functions.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'calculate_story_progress'
      AND pg_get_function_identity_arguments(p.oid) = 'p_story_id uuid'
  ) THEN
    ALTER FUNCTION public.calculate_story_progress(uuid)
      SET search_path = public, pg_temp;
  END IF;
END $$;
