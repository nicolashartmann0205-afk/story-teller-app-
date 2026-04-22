-- Harden SECURITY DEFINER function against role-mutable search_path.
-- Supabase security advisor expects explicit search_path for such functions.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_or_create_user'
      AND pg_get_function_identity_arguments(p.oid)
        = 'p_stytch_user_id text, p_email text, p_display_name text'
  ) THEN
    ALTER FUNCTION public.get_or_create_user(text, text, text)
      SET search_path = public, pg_temp;
  END IF;
END $$;
