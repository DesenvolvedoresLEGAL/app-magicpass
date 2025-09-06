-- Create payments table for Stripe integration
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pricing_tiers table for event ticket categories with pricing
CREATE TABLE public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  currency TEXT NOT NULL DEFAULT 'BRL',
  max_quantity INTEGER,
  early_bird_price INTEGER, -- Optional early bird pricing
  early_bird_end_date TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create discount_codes table for promotional codes
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value INTEGER NOT NULL, -- Percentage (0-100) or cents for fixed
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, code)
);

-- Create orders table for tracking multi-item purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  total_amount INTEGER NOT NULL,
  discount_amount INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  discount_code_id UUID REFERENCES public.discount_codes(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_items table for individual items in an order
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  pricing_tier_id UUID REFERENCES public.pricing_tiers(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- Price per item at time of purchase
  total_price INTEGER NOT NULL, -- Total for this line item
  participant_data JSONB DEFAULT '{}', -- Store participant info for each ticket
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create financial_reports table for advanced analytics
CREATE TABLE public.financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  refunded_amount INTEGER NOT NULL DEFAULT 0,
  fees_amount INTEGER NOT NULL DEFAULT 0,
  net_revenue INTEGER NOT NULL DEFAULT 0,
  data JSONB DEFAULT '{}', -- Store detailed breakdown
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view payments from their org events" 
ON public.payments FOR SELECT 
USING (event_id IN (
  SELECT e.id FROM events e 
  JOIN users u ON e.organization_id = u.organization_id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Allow payment creation" 
ON public.payments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow payment updates" 
ON public.payments FOR UPDATE 
USING (true);

-- RLS Policies for pricing_tiers
CREATE POLICY "Users can manage pricing tiers for their org events" 
ON public.pricing_tiers FOR ALL 
USING (event_id IN (
  SELECT e.id FROM events e 
  JOIN users u ON e.organization_id = u.organization_id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Public can view active pricing tiers" 
ON public.pricing_tiers FOR SELECT 
USING (active = true);

-- RLS Policies for discount_codes
CREATE POLICY "Users can manage discount codes for their org events" 
ON public.discount_codes FOR ALL 
USING (event_id IN (
  SELECT e.id FROM events e 
  JOIN users u ON e.organization_id = u.organization_id 
  WHERE u.auth_user_id = auth.uid()
));

-- RLS Policies for orders
CREATE POLICY "Users can view orders from their org events" 
ON public.orders FOR SELECT 
USING (event_id IN (
  SELECT e.id FROM events e 
  JOIN users u ON e.organization_id = u.organization_id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Allow order creation" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow order updates" 
ON public.orders FOR UPDATE 
USING (true);

-- RLS Policies for order_items
CREATE POLICY "Users can view order items from their org" 
ON public.order_items FOR SELECT 
USING (order_id IN (
  SELECT o.id FROM orders o 
  JOIN events e ON o.event_id = e.id
  JOIN users u ON e.organization_id = u.organization_id 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Allow order item creation" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- RLS Policies for financial_reports
CREATE POLICY "Users can view reports from their org" 
ON public.financial_reports FOR ALL 
USING (organization_id IN (
  SELECT u.organization_id FROM users u 
  WHERE u.auth_user_id = auth.uid()
));

-- Create updated_at triggers
CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON public.payments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at 
  BEFORE UPDATE ON public.pricing_tiers 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at 
  BEFORE UPDATE ON public.discount_codes 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_reports_updated_at 
  BEFORE UPDATE ON public.financial_reports 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add payment support to events table
ALTER TABLE public.events 
ADD COLUMN payment_enabled BOOLEAN DEFAULT false,
ADD COLUMN default_currency TEXT DEFAULT 'BRL',
ADD COLUMN stripe_account_id TEXT;

-- Update events policies to allow updates for payment configuration
CREATE POLICY "Users can update events from their organization" 
ON public.events FOR UPDATE 
USING (organization_id IN (
  SELECT u.organization_id FROM users u 
  WHERE u.auth_user_id = auth.uid()
));

CREATE POLICY "Users can insert events for their organization" 
ON public.events FOR INSERT 
WITH CHECK (organization_id IN (
  SELECT u.organization_id FROM users u 
  WHERE u.auth_user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_payments_event_id ON public.payments(event_id);
CREATE INDEX idx_payments_stripe_session_id ON public.payments(stripe_session_id);
CREATE INDEX idx_pricing_tiers_event_id ON public.pricing_tiers(event_id);
CREATE INDEX idx_orders_event_id ON public.orders(event_id);
CREATE INDEX idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX idx_financial_reports_org_period ON public.financial_reports(organization_id, period_start, period_end);