-- Add field_officer to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'field_officer';

-- Dealer visit reports table
CREATE TABLE public.dealer_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id uuid NOT NULL,
  dealer_name text NOT NULL,
  dealer_location text,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  purpose text,
  notes text,
  order_placed boolean NOT NULL DEFAULT false,
  order_amount numeric DEFAULT 0,
  latitude double precision,
  longitude double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dealer_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officers can manage own visits"
ON public.dealer_visits FOR ALL TO authenticated
USING (auth.uid() = officer_id)
WITH CHECK (auth.uid() = officer_id);

CREATE POLICY "Admins can manage all visits"
ON public.dealer_visits FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Farmer meeting records table
CREATE TABLE public.farmer_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id uuid NOT NULL,
  farmer_name text NOT NULL,
  farmer_phone text,
  village text,
  crop text,
  problem_reported text,
  product_recommended text,
  latitude double precision,
  longitude double precision,
  meeting_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.farmer_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officers can manage own meetings"
ON public.farmer_meetings FOR ALL TO authenticated
USING (auth.uid() = officer_id)
WITH CHECK (auth.uid() = officer_id);

CREATE POLICY "Admins can manage all meetings"
ON public.farmer_meetings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Sales targets table
CREATE TABLE public.sales_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id uuid NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  achieved_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(officer_id, month, year)
);

ALTER TABLE public.sales_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officers can view own targets"
ON public.sales_targets FOR SELECT TO authenticated
USING (auth.uid() = officer_id);

CREATE POLICY "Admins can manage all targets"
ON public.sales_targets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_dealer_visits_updated_at
  BEFORE UPDATE ON public.dealer_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_targets_updated_at
  BEFORE UPDATE ON public.sales_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();