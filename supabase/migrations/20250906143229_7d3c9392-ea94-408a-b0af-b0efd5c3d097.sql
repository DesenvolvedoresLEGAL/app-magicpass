-- Update functions to set search_path and use SECURITY INVOKER
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_event_stats;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

CREATE OR REPLACE FUNCTION search_participants(
  p_event_id UUID,
  p_search_term TEXT DEFAULT '',
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  status TEXT,
  checked_in_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ,
  ticket_category TEXT,
  total_count BIGINT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY INVOKER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION get_event_stats_cached(p_event_id UUID)
RETURNS TABLE (
  registrations BIGINT,
  checkins BIGINT,
  check_in_rate DECIMAL,
  last_updated TIMESTAMPTZ
) AS $$
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
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

CREATE OR REPLACE FUNCTION log_performance_metric(
  p_metric_type TEXT,
  p_metric_name TEXT,
  p_value DECIMAL,
  p_unit TEXT,
  p_organization_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;