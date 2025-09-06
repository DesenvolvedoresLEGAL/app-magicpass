-- Enable realtime for participants table
ALTER PUBLICATION supabase_realtime ADD TABLE participants;

-- Enable realtime for events table
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Set REPLICA IDENTITY FULL for complete row data during updates
ALTER TABLE participants REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'webhook', 'push')),
  event_id UUID,
  participant_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retrying')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view notifications from their org" 
ON public.notifications 
FOR SELECT 
USING (organization_id IN (
  SELECT users.organization_id
  FROM users
  WHERE users.auth_user_id = auth.uid()
));

CREATE POLICY "Users can insert notifications for their org" 
ON public.notifications 
FOR INSERT 
WITH CHECK (organization_id IN (
  SELECT users.organization_id
  FROM users
  WHERE users.auth_user_id = auth.uid()
));

-- Create webhook_configs table
CREATE TABLE public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}', -- checkin, checkout, registration
  active BOOLEAN DEFAULT true,
  secret TEXT,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for webhook_configs
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_configs
CREATE POLICY "Users can manage webhooks for their org events" 
ON public.webhook_configs 
FOR ALL 
USING (event_id IN (
  SELECT e.id
  FROM events e
  JOIN users u ON e.organization_id = u.organization_id
  WHERE u.auth_user_id = auth.uid()
));

-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration_confirmation', 'checkin_confirmation', 'reminder', 'custom')),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email_templates
CREATE POLICY "Users can manage email templates for their org" 
ON public.email_templates 
FOR ALL 
USING (organization_id IN (
  SELECT users.organization_id
  FROM users
  WHERE users.auth_user_id = auth.uid()
));

-- Add triggers for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_configs_updated_at
BEFORE UPDATE ON public.webhook_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_configs;
ALTER PUBLICATION supabase_realtime ADD TABLE email_templates;