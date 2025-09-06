-- Create organizations table for multi-tenant support
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for system users (admins, operators)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('legal_admin', 'client_admin', 'client_operator')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER,
  allow_reentry BOOLEAN DEFAULT false,
  qr_prefix TEXT,
  webhook_url TEXT,
  registration_fields JSONB DEFAULT '[]'::jsonb,
  ticket_categories JSONB DEFAULT '[]'::jsonb,
  lgpd_text TEXT DEFAULT 'Ao prosseguir, você concorda com o tratamento dos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD).',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  photo_url TEXT,
  ticket_category TEXT,
  registration_data JSONB DEFAULT '{}'::jsonb,
  qr_code TEXT NOT NULL UNIQUE,
  lgpd_consent BOOLEAN DEFAULT false,
  lgpd_consent_date TIMESTAMP WITH TIME ZONE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'checked_out'))
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for participant photos
INSERT INTO storage.buckets (id, name, public) VALUES ('participant-photos', 'participant-photos', false);

-- Organizations policies (LEGAL admins can see all, others see only their org)
CREATE POLICY "LEGAL admins can view all organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'legal_admin'
    )
  );

CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users policies
CREATE POLICY "Users can view users from their organization" ON public.users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Events policies
CREATE POLICY "Users can view events from their organization" ON public.events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active events for registration" ON public.events
  FOR SELECT USING (status = 'active');

-- Participants policies
CREATE POLICY "Users can view participants from their org events" ON public.participants
  FOR SELECT USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.users u ON e.organization_id = u.organization_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert participants" ON public.participants
  FOR INSERT WITH CHECK (true);

-- Storage policies for participant photos
CREATE POLICY "Anyone can upload participant photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'participant-photos');

CREATE POLICY "Users can view photos from their org events" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'participant-photos' AND
    (storage.foldername(name))[1] IN (
      SELECT p.id::text FROM public.participants p
      JOIN public.events e ON p.event_id = e.id
      JOIN public.users u ON e.organization_id = u.organization_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for development
INSERT INTO public.organizations (id, name, slug, logo_url, primary_color, secondary_color) 
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'LEGAL Eventos',
  'legal-eventos',
  null,
  '#3b82f6',
  '#1e40af'
);

INSERT INTO public.events (id, organization_id, name, description, location, start_date, end_date, capacity, status, registration_fields, ticket_categories, lgpd_text)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Tech Conference 2024',
  'Conferência de tecnologia e inovação',
  'Centro de Convenções - São Paulo/SP',
  '2024-03-15 09:00:00-03',
  '2024-03-15 18:00:00-03',
  500,
  'active',
  '[
    {"id": "company", "label": "Empresa", "type": "text", "required": true},
    {"id": "position", "label": "Cargo", "type": "text", "required": false},
    {"id": "dietary", "label": "Restrições Alimentares", "type": "textarea", "required": false}
  ]'::jsonb,
  '[
    {"id": "vip", "label": "VIP", "description": "Acesso completo + coffee premium"},
    {"id": "standard", "label": "Standard", "description": "Acesso às palestras principais"},
    {"id": "student", "label": "Estudante", "description": "Acesso com desconto estudantil"}
  ]'::jsonb,
  'Ao se inscrever neste evento, você autoriza o uso dos seus dados pessoais conforme nossa política de privacidade e a Lei Geral de Proteção de Dados (LGPD). Seus dados serão utilizados exclusivamente para organização do evento e comunicações relacionadas.'
);