-- Views for optimized queries
CREATE OR REPLACE VIEW public.event_summary AS
SELECT 
  e.id,
  e.name,
  e.organization_id,
  e.start_date,
  e.end_date,
  e.status,
  o.name as organization_name,
  COUNT(p.id) as total_participants,
  COUNT(CASE WHEN p.checked_in_at IS NOT NULL THEN 1 END) as checked_in_count,
  CASE 
    WHEN COUNT(p.id) > 0 
    THEN ROUND((COUNT(CASE WHEN p.checked_in_at IS NOT NULL THEN 1 END)::DECIMAL / COUNT(p.id)) * 100, 2)
    ELSE 0 
  END as check_in_rate
FROM events e
LEFT JOIN organizations o ON e.organization_id = o.id
LEFT JOIN participants p ON e.id = p.event_id
GROUP BY e.id, e.name, e.organization_id, e.start_date, e.end_date, e.status, o.name;

-- Materialized view for daily stats
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_event_stats AS
SELECT 
  e.id as event_id,
  e.organization_id,
  DATE(p.registered_at) as date,
  COUNT(*) as registrations,
  COUNT(CASE WHEN p.checked_in_at IS NOT NULL THEN 1 END) as checkins,
  COUNT(DISTINCT p.id) as unique_participants
FROM events e
LEFT JOIN participants p ON e.id = p.event_id
WHERE p.registered_at IS NOT NULL
GROUP BY e.id, e.organization_id, DATE(p.registered_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_event_stats_unique ON daily_event_stats(event_id, date);

-- Performance monitoring tables
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cache_invalidations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL,
  invalidation_reason TEXT,
  triggered_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  triggered_by_action TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_invalidations ENABLE ROW LEVEL SECURITY;

-- RLS policies
DO $$ BEGIN
  CREATE POLICY "Users can view metrics from their org" 
  ON public.performance_metrics FOR SELECT 
  USING (organization_id IN (
    SELECT users.organization_id FROM users 
    WHERE users.auth_user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow performance metrics creation" 
  ON public.performance_metrics FOR INSERT 
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view cache invalidations from their org" 
  ON public.cache_invalidations FOR SELECT 
  USING (organization_id IN (
    SELECT users.organization_id FROM users 
    WHERE users.auth_user_id = auth.uid()
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow cache invalidation logging" 
  ON public.cache_invalidations FOR INSERT 
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Strategic indexes (no CONCURRENTLY inside tx)
CREATE INDEX IF NOT EXISTS idx_participants_event_status ON participants(event_id, status);
CREATE INDEX IF NOT EXISTS idx_participants_checkin_date ON participants(event_id, checked_in_at);
CREATE INDEX IF NOT EXISTS idx_events_org_status ON events(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_type_date ON analytics_events(organization_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_org_type_date ON performance_metrics(organization_id, metric_type, created_at);

-- Functions
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_event_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_date ON performance_metrics(metric_type, created_at);
CREATE INDEX IF NOT EXISTS idx_cache_invalidations_key_date ON cache_invalidations(cache_key, created_at);