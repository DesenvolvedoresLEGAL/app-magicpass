-- Additional security hardening for participant registration and data exposure

-- Ensure participants table properly restricts access
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive policies that might exist
DROP POLICY IF EXISTS "Allow participant creation from public" ON public.participants;
DROP POLICY IF EXISTS "Public can insert participants" ON public.participants;

-- Create secure policy for participant insertion (only via RPC)
CREATE POLICY "System can manage participants via RPC"
ON public.participants
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Harden access to sensitive financial and customer data
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Remove any public access to financial data
REVOKE ALL ON TABLE public.payments FROM anon;
REVOKE ALL ON TABLE public.orders FROM anon;
REVOKE ALL ON TABLE public.order_items FROM anon;
REVOKE ALL ON TABLE public.financial_reports FROM anon;

-- Ensure organizations table has no public access to sensitive data
REVOKE ALL ON TABLE public.organizations FROM anon;

-- Add IP-based rate limiting for participant registration
CREATE TABLE IF NOT EXISTS public.registration_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  event_id UUID NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.registration_attempts ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limiting
CREATE POLICY "System can manage registration attempts"
ON public.registration_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Enhanced security for webhook configurations
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.webhook_configs FROM anon;