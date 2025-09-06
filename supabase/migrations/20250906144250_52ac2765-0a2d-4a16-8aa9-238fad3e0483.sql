-- Secure existing DB functions with explicit search_path and correct security

-- Ensure view runs with invoker privileges (fixes SECURITY DEFINER view issue)
ALTER VIEW IF EXISTS public.event_summary SET (security_invoker = true);

-- 1) log_performance_metric
CREATE OR REPLACE FUNCTION public.log_performance_metric(
  p_metric_type text,
  p_metric_name text,
  p_value numeric,
  p_unit text,
  p_organization_id uuid DEFAULT NULL::uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO performance_metrics (
    metric_type, metric_name, value, unit, organization_id, user_id, metadata
  ) VALUES (
    p_metric_type, p_metric_name, p_value, p_unit, p_organization_id, auth.uid(), p_metadata
  ) RETURNING id INTO metric_id;
  RETURN metric_id;
END;
$function$;

-- 2) calculate_event_analytics
CREATE OR REPLACE FUNCTION public.calculate_event_analytics(
  p_event_id uuid,
  p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval),
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(metric_name text, metric_value numeric, previous_value numeric, change_percentage numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_organization_id UUID;
BEGIN
  -- Get organization_id for the event
  SELECT organization_id INTO v_organization_id 
  FROM events WHERE id = p_event_id;

  RETURN QUERY
  WITH current_metrics AS (
    SELECT 
      SUM(page_views) as total_page_views,
      SUM(unique_visitors) as total_unique_visitors,
      SUM(registration_started) as total_registration_started,
      SUM(registration_completed) as total_registration_completed,
      CASE 
        WHEN SUM(registration_started) > 0 
        THEN (SUM(registration_completed)::NUMERIC / SUM(registration_started)) * 100
        ELSE 0
      END as conversion_rate,
      SUM(checkins) as total_checkins,
      CASE 
        WHEN SUM(registration_completed) > 0
        THEN (SUM(checkins)::NUMERIC / SUM(registration_completed)) * 100
        ELSE 0  
      END as checkin_rate,
      AVG(avg_session_duration) as avg_duration,
      AVG(bounce_rate) as avg_bounce_rate
    FROM event_analytics_summary 
    WHERE event_id = p_event_id 
      AND date BETWEEN p_start_date AND p_end_date
  ),
  previous_metrics AS (
    SELECT 
      SUM(page_views) as prev_page_views,
      SUM(unique_visitors) as prev_unique_visitors,
      SUM(registration_completed) as prev_registrations,
      CASE 
        WHEN SUM(registration_started) > 0 
        THEN (SUM(registration_completed)::NUMERIC / SUM(registration_started)) * 100
        ELSE 0
      END as prev_conversion_rate
    FROM event_analytics_summary 
    WHERE event_id = p_event_id 
      AND date BETWEEN p_start_date - (p_end_date - p_start_date) AND p_start_date
  )
  SELECT 
    'page_views'::TEXT, 
    cm.total_page_views::NUMERIC, 
    pm.prev_page_views::NUMERIC,
    CASE WHEN pm.prev_page_views > 0 
      THEN ((cm.total_page_views - pm.prev_page_views) / pm.prev_page_views) * 100
      ELSE 0 
    END
  FROM current_metrics cm, previous_metrics pm
  
  UNION ALL
  
  SELECT 
    'unique_visitors'::TEXT, 
    cm.total_unique_visitors::NUMERIC, 
    pm.prev_unique_visitors::NUMERIC,
    CASE WHEN pm.prev_unique_visitors > 0 
      THEN ((cm.total_unique_visitors - pm.prev_unique_visitors) / pm.prev_unique_visitors) * 100
      ELSE 0 
    END
  FROM current_metrics cm, previous_metrics pm
  
  UNION ALL
  
  SELECT 
    'registrations'::TEXT, 
    cm.total_registration_completed::NUMERIC, 
    pm.prev_registrations::NUMERIC,
    CASE WHEN pm.prev_registrations > 0 
      THEN ((cm.total_registration_completed - pm.prev_registrations) / pm.prev_registrations) * 100
      ELSE 0 
    END
  FROM current_metrics cm, previous_metrics pm
  
  UNION ALL
  
  SELECT 
    'conversion_rate'::TEXT, 
    cm.conversion_rate::NUMERIC, 
    pm.prev_conversion_rate::NUMERIC,
    CASE WHEN pm.prev_conversion_rate > 0 
      THEN ((cm.conversion_rate - pm.prev_conversion_rate) / pm.prev_conversion_rate) * 100
      ELSE 0 
    END
  FROM current_metrics cm, previous_metrics pm;
  
END;
$function$;

-- 3) refresh_daily_stats
CREATE OR REPLACE FUNCTION public.refresh_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW daily_event_stats;
END;
$function$;

-- 4) search_participants
CREATE OR REPLACE FUNCTION public.search_participants(
  p_event_id uuid,
  p_search_term text DEFAULT ''::text,
  p_status text DEFAULT NULL::text,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(id uuid, name text, email text, status text, checked_in_at timestamp with time zone, registered_at timestamp with time zone, ticket_category text, total_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  WITH filtered_participants AS (
    SELECT 
      p.id,
      p.name,
      p.email,
      p.status,
      p.checked_in_at,
      p.registered_at,
      p.ticket_category,
      COUNT(*) OVER() as total_count
    FROM participants p
    WHERE p.event_id = p_event_id
      AND (p_search_term = '' OR 
           p.name ILIKE '%' || p_search_term || '%' OR 
           p.email ILIKE '%' || p_search_term || '%')
      AND (p_status IS NULL OR p.status = p_status)
    ORDER BY p.registered_at DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT * FROM filtered_participants;
END;
$function$;

-- 5) get_event_stats_cached
CREATE OR REPLACE FUNCTION public.get_event_stats_cached(p_event_id uuid)
RETURNS TABLE(registrations bigint, checkins bigint, check_in_rate numeric, last_updated timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(des.registrations), 0) as registrations,
    COALESCE(SUM(des.checkins), 0) as checkins,
    CASE 
      WHEN SUM(des.registrations) > 0 
      THEN ROUND((SUM(des.checkins)::DECIMAL / SUM(des.registrations)) * 100, 2)
      ELSE 0 
    END as check_in_rate,
    now() as last_updated
  FROM daily_event_stats des
  WHERE des.event_id = p_event_id;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      COUNT(p.id) as registrations,
      COUNT(CASE WHEN p.checked_in_at IS NOT NULL THEN 1 END) as checkins,
      CASE 
        WHEN COUNT(p.id) > 0 
        THEN ROUND((COUNT(CASE WHEN p.checked_in_at IS NOT NULL THEN 1 END)::DECIMAL / COUNT(p.id)) * 100, 2)
        ELSE 0 
      END as check_in_rate,
      now() as last_updated
    FROM participants p
    WHERE p.event_id = p_event_id;
  END IF;
END;
$function$;