CREATE OR REPLACE FUNCTION public.get_homepage_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'builders', (SELECT count(*) FROM public.talents WHERE status = 'approved'),
    'open_requests', (SELECT count(*) FROM public.ventures WHERE status = 'pending'),
    'trusted_tools', (SELECT count(*) FROM public.partner_applications WHERE status = 'approved')
  )
$$;

GRANT EXECUTE ON FUNCTION public.get_homepage_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_homepage_stats() TO authenticated;