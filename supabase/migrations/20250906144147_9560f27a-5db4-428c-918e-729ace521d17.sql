-- Fix remaining security warnings

-- 1. Fix Function Search Path Mutable warnings - Update all functions to set search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE auth_user_id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_organization(user_id UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM public.users WHERE auth_user_id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_user_id = user_id AND role = required_role
  );
$$;

-- 2. Hide materialized view from API by revoking access
REVOKE SELECT ON public.daily_event_stats FROM anon, authenticated;

-- Grant access only to authenticated users through the security definer function
GRANT SELECT ON public.daily_event_stats TO service_role;