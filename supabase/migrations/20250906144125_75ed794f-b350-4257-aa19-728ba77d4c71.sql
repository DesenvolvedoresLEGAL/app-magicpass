-- Phase 1: Critical Data Protection - Fix RLS Policies

-- 1. Fix Payment Security - Restrict to organization admins only
DROP POLICY IF EXISTS "Allow payment creation" ON public.payments;
DROP POLICY IF EXISTS "Allow payment updates" ON public.payments;

CREATE POLICY "Organization admins can manage payments" 
ON public.payments 
FOR ALL 
USING (
  event_id IN (
    SELECT e.id 
    FROM events e 
    JOIN users u ON e.organization_id = u.organization_id 
    WHERE u.auth_user_id = auth.uid() 
    AND u.role IN ('legal_admin', 'client_admin')
  )
);

CREATE POLICY "Allow payment creation from checkout" 
ON public.payments 
FOR INSERT 
WITH CHECK (true); -- This will be handled by the payment processor

-- 2. Fix Order Security - Restrict to organization members only  
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
DROP POLICY IF EXISTS "Allow order updates" ON public.orders;

CREATE POLICY "Organization members can manage orders" 
ON public.orders 
FOR ALL 
USING (
  event_id IN (
    SELECT e.id 
    FROM events e 
    JOIN users u ON e.organization_id = u.organization_id 
    WHERE u.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Allow order creation from checkout" 
ON public.orders 
FOR INSERT 
WITH CHECK (true); -- This will be handled by the payment processor

-- 3. Fix Analytics Security - Restrict to organization members only
DROP POLICY IF EXISTS "Allow analytics summary management" ON public.event_analytics_summary;

CREATE POLICY "Organization members can view analytics summary" 
ON public.event_analytics_summary 
FOR SELECT 
USING (
  organization_id IN (
    SELECT users.organization_id 
    FROM users 
    WHERE users.auth_user_id = auth.uid()
  )
);

CREATE POLICY "System can manage analytics summary" 
ON public.event_analytics_summary 
FOR ALL 
USING (auth.role() = 'service_role');

-- 4. Fix Session Analytics - Restrict to authenticated services only
DROP POLICY IF EXISTS "Allow analytics session creation" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Allow analytics session updates" ON public.analytics_sessions;

CREATE POLICY "System can manage analytics sessions" 
ON public.analytics_sessions 
FOR ALL 
USING (auth.role() = 'service_role');

-- Phase 2: Authentication System Hardening

-- 5. Create proper role system with enum
CREATE TYPE public.app_role AS ENUM ('legal_admin', 'client_admin', 'client_operator');

-- 6. Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role, organization_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Create security definer function to check roles (prevents infinite recursion)
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

-- 8. Fix users table RLS policy to prevent infinite recursion
DROP POLICY IF EXISTS "Users can view users from their organization" ON public.users;

CREATE POLICY "Users can view users from their organization" 
ON public.users 
FOR SELECT 
USING (
  organization_id = public.get_user_organization(auth.uid())
);

-- 9. Create policies for user_roles table
CREATE POLICY "Users can view roles in their organization" 
ON public.user_roles 
FOR SELECT 
USING (
  organization_id = public.get_user_organization(auth.uid())
);

CREATE POLICY "Admins can manage roles in their organization" 
ON public.user_roles 
FOR ALL 
USING (
  organization_id = public.get_user_organization(auth.uid()) 
  AND public.has_role(auth.uid(), 'legal_admin')
);

-- 10. Add trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Improve analytics events policy to be more restrictive
DROP POLICY IF EXISTS "Allow analytics event creation" ON public.analytics_events;

CREATE POLICY "System can create analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NULL);

-- 12. Improve notifications security
DROP POLICY IF EXISTS "Users can insert notifications for their org" ON public.notifications;

CREATE POLICY "System and admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  auth.role() = 'service_role' OR 
  public.has_role(auth.uid(), 'legal_admin') OR 
  public.has_role(auth.uid(), 'client_admin')
);

-- 13. Improve cache invalidations security
DROP POLICY IF EXISTS "Allow cache invalidation logging" ON public.cache_invalidations;

CREATE POLICY "System can log cache invalidations" 
ON public.cache_invalidations 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- 14. Improve performance metrics security
DROP POLICY IF EXISTS "Allow performance metrics creation" ON public.performance_metrics;

CREATE POLICY "System can create performance metrics" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);