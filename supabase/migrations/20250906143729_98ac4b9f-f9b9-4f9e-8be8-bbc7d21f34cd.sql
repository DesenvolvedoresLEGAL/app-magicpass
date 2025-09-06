-- Fix: ensure views run with invoker privileges so RLS of the querying user applies
ALTER VIEW public.event_summary SET (security_invoker = true);