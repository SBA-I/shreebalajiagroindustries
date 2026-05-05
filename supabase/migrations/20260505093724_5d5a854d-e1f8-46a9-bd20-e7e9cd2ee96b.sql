
-- 1. Field Visits (E-Diary)
CREATE TABLE public.field_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  officer_id UUID NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT,
  village TEXT,
  district TEXT,
  state TEXT,
  crop TEXT,
  acreage NUMERIC,
  observations TEXT,
  recommendation TEXT,
  recommended_products TEXT[],
  photo_url TEXT,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.field_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officers manage own visits" ON public.field_visits
  FOR ALL TO authenticated
  USING (auth.uid() = officer_id)
  WITH CHECK (auth.uid() = officer_id);

CREATE POLICY "Admins manage all visits" ON public.field_visits
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_field_visits_updated
BEFORE UPDATE ON public.field_visits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Attendance / Check-in
CREATE TABLE public.field_officer_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  officer_id UUID NOT NULL,
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_at TIMESTAMPTZ,
  check_in_lat NUMERIC,
  check_in_lng NUMERIC,
  check_out_lat NUMERIC,
  check_out_lng NUMERIC,
  villages_covered TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.field_officer_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officers manage own attendance" ON public.field_officer_attendance
  FOR ALL TO authenticated
  USING (auth.uid() = officer_id)
  WITH CHECK (auth.uid() = officer_id);

CREATE POLICY "Admins view all attendance" ON public.field_officer_attendance
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Dealer Audits
CREATE TABLE public.dealer_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  officer_id UUID NOT NULL,
  dealer_id UUID,
  dealer_name TEXT NOT NULL,
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  signage_visible BOOLEAN NOT NULL DEFAULT false,
  shelves_stocked BOOLEAN NOT NULL DEFAULT false,
  marketing_material_needed BOOLEAN NOT NULL DEFAULT false,
  staff_trained BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER,
  notes TEXT,
  photo_url TEXT,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dealer_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officers manage own audits" ON public.dealer_audits
  FOR ALL TO authenticated
  USING (auth.uid() = officer_id)
  WITH CHECK (auth.uid() = officer_id);

CREATE POLICY "Admins manage all audits" ON public.dealer_audits
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dealers view own audits" ON public.dealer_audits
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dealers d WHERE d.id = dealer_audits.dealer_id AND d.user_id = auth.uid()));

CREATE TRIGGER trg_dealer_audits_updated
BEFORE UPDATE ON public.dealer_audits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Farmer Leads
CREATE TABLE public.farmer_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  officer_id UUID NOT NULL,
  linked_dealer_id UUID,
  farmer_name TEXT NOT NULL,
  phone TEXT,
  village TEXT,
  taluka TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  crops TEXT[],
  land_size_acres NUMERIC,
  lat NUMERIC,
  lng NUMERIC,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farmer_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officers manage own leads" ON public.farmer_leads
  FOR ALL TO authenticated
  USING (auth.uid() = officer_id)
  WITH CHECK (auth.uid() = officer_id);

CREATE POLICY "Admins manage all leads" ON public.farmer_leads
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dealers view linked leads" ON public.farmer_leads
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dealers d WHERE d.id = farmer_leads.linked_dealer_id AND d.user_id = auth.uid()));

CREATE TRIGGER trg_farmer_leads_updated
BEFORE UPDATE ON public.farmer_leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_field_visits_officer_date ON public.field_visits(officer_id, visit_date DESC);
CREATE INDEX idx_attendance_officer_date ON public.field_officer_attendance(officer_id, check_in_at DESC);
CREATE INDEX idx_dealer_audits_officer ON public.dealer_audits(officer_id, audit_date DESC);
CREATE INDEX idx_farmer_leads_officer ON public.farmer_leads(officer_id, created_at DESC);
CREATE INDEX idx_farmer_leads_dealer ON public.farmer_leads(linked_dealer_id);

-- 5. Storage bucket for officer photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('field-officer-photos', 'field-officer-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Officer photos public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'field-officer-photos');

CREATE POLICY "Authenticated upload officer photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'field-officer-photos');

CREATE POLICY "Authenticated update own officer photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'field-officer-photos' AND owner = auth.uid());

CREATE POLICY "Authenticated delete own officer photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'field-officer-photos' AND owner = auth.uid());
