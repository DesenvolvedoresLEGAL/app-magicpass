-- Create analytics events table to track user interactions
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_agent TEXT,
  ip_address INET,
  referer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create analytics sessions table
CREATE TABLE public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_domain TEXT
);

-- Create event metrics summary table for performance
CREATE TABLE public.event_analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Registration metrics
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  registration_started INTEGER DEFAULT 0,
  registration_completed INTEGER DEFAULT 0,
  registration_conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Check-in metrics  
  checkins INTEGER DEFAULT 0,
  checkin_conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement metrics
  avg_session_duration INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  form_abandonment_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Traffic source metrics
  organic_traffic INTEGER DEFAULT 0,
  direct_traffic INTEGER DEFAULT 0,
  social_traffic INTEGER DEFAULT 0,
  email_traffic INTEGER DEFAULT 0,
  paid_traffic INTEGER DEFAULT 0,
  
  -- Device metrics
  desktop_sessions INTEGER DEFAULT 0,
  mobile_sessions INTEGER DEFAULT 0,
  tablet_sessions INTEGER DEFAULT 0,
  
  -- Geographic metrics
  top_countries JSONB DEFAULT '[]',
  top_cities JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(event_id, date)
);

-- Enable RLS on analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
CREATE POLICY "Users can view analytics events from their org" 
ON public.analytics_events FOR SELECT 
USING (organization_id IN (
  SELECT users.organization_id FROM users 
  WHERE users.auth_user_id = auth.uid()
));

CREATE POLICY "Allow analytics event creation" 
ON public.analytics_events FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for analytics_sessions
CREATE POLICY "Users can view analytics sessions from their org" 
ON public.analytics_sessions FOR SELECT 
USING (organization_id IN (
  SELECT users.organization_id FROM users 
  WHERE users.auth_user_id = auth.uid()
));

CREATE POLICY "Allow analytics session creation" 
ON public.analytics_sessions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow analytics session updates" 
ON public.analytics_sessions FOR UPDATE 
USING (true);

-- Create RLS policies for event_analytics_summary
CREATE POLICY "Users can view analytics summary from their org" 
ON public.event_analytics_summary FOR SELECT 
USING (organization_id IN (
  SELECT users.organization_id FROM users 
  WHERE users.auth_user_id = auth.uid()
));

CREATE POLICY "Allow analytics summary management" 
ON public.event_analytics_summary FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_analytics_events_event_id ON analytics_events(event_id);
CREATE INDEX idx_analytics_events_org_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);

CREATE INDEX idx_analytics_sessions_event_id ON analytics_sessions(event_id);
CREATE INDEX idx_analytics_sessions_org_id ON analytics_sessions(organization_id);
CREATE INDEX idx_analytics_sessions_started_at ON analytics_sessions(started_at);

CREATE INDEX idx_event_analytics_summary_event_date ON event_analytics_summary(event_id, date);
CREATE INDEX idx_event_analytics_summary_org_date ON event_analytics_summary(organization_id, date);

-- Create triggers for updated_at
CREATE TRIGGER update_analytics_sessions_updated_at
  BEFORE UPDATE ON analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_analytics_summary_updated_at
  BEFORE UPDATE ON event_analytics_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate analytics metrics
CREATE OR REPLACE FUNCTION calculate_event_analytics(
  p_event_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  previous_value NUMERIC,
  change_percentage NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;