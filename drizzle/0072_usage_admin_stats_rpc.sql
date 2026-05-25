-- Usage admin metrics via RPC (owner JWT) — works without service role or working POOLING_DATABASE_URL.

CREATE OR REPLACE FUNCTION public.get_usage_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  owner_email constant text := 'nicolas@hartmanns.net';
  jwt_email text;
BEGIN
  jwt_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  IF jwt_email IS DISTINCT FROM owner_email THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'total_users', (SELECT count(*)::int FROM auth.users),
    'new_users_7d', (
      SELECT count(*)::int FROM auth.users WHERE created_at >= now() - interval '7 days'
    ),
    'new_users_30d', (
      SELECT count(*)::int FROM auth.users WHERE created_at >= now() - interval '30 days'
    ),
    'active_users_24h', (
      SELECT count(DISTINCT user_id)::int FROM (
        SELECT user_id FROM public.stories WHERE updated_at >= now() - interval '24 hours'
        UNION
        SELECT user_id FROM public.credit_transactions WHERE created_at >= now() - interval '24 hours'
      ) active
    ),
    'active_users_7d', (
      SELECT count(DISTINCT user_id)::int FROM (
        SELECT user_id FROM public.stories WHERE updated_at >= now() - interval '7 days'
        UNION
        SELECT user_id FROM public.credit_transactions WHERE created_at >= now() - interval '7 days'
      ) active
    ),
    'active_users_30d', (
      SELECT count(DISTINCT user_id)::int FROM (
        SELECT user_id FROM public.stories WHERE updated_at >= now() - interval '30 days'
        UNION
        SELECT user_id FROM public.credit_transactions WHERE created_at >= now() - interval '30 days'
      ) active
    ),
    'recently_online_users', (
      SELECT count(*)::int FROM auth.users
      WHERE last_sign_in_at >= now() - interval '15 minutes'
    ),
    'total_stories', (SELECT count(*)::int FROM public.stories),
    'total_ai_generations', (
      SELECT count(*)::int FROM public.credit_transactions WHERE type = 'debit'
    ),
    'ai_generations_7d', (
      SELECT count(*)::int FROM public.credit_transactions
      WHERE type = 'debit' AND created_at >= now() - interval '7 days'
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_usage_admin_recent_signups(p_limit int DEFAULT 15)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  owner_email constant text := 'nicolas@hartmanns.net';
  jwt_email text;
BEGIN
  jwt_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  IF jwt_email IS DISTINCT FROM owner_email THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN coalesce(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', u.id,
          'email', u.email,
          'created_at', u.created_at
        )
        ORDER BY u.created_at DESC
      )
      FROM (
        SELECT id, email, created_at
        FROM auth.users
        WHERE email IS NOT NULL
        ORDER BY created_at DESC
        LIMIT greatest(1, least(coalesce(p_limit, 15), 50))
      ) u
    ),
    '[]'::jsonb
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_usage_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_usage_admin_recent_signups(int) TO authenticated;
