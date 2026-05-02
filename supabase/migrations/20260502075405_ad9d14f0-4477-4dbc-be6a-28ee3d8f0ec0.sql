CREATE TABLE public.spray_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  spray_date date NOT NULL DEFAULT CURRENT_DATE,
  product_name text NOT NULL,
  product_category text,
  dosage text,
  target_pest text,
  crop text,
  phi_days integer NOT NULL DEFAULT 14,
  safe_harvest_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_safe_harvest_date()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.safe_harvest_date := NEW.spray_date + NEW.phi_days;
  RETURN NEW;
END;
$$;

CREATE TRIGGER spray_logs_safe_harvest
BEFORE INSERT OR UPDATE ON public.spray_logs
FOR EACH ROW EXECUTE FUNCTION public.set_safe_harvest_date();

ALTER TABLE public.spray_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers view own spray logs" ON public.spray_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Farmers insert own spray logs" ON public.spray_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Farmers update own spray logs" ON public.spray_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Farmers delete own spray logs" ON public.spray_logs FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX spray_logs_user_date_idx ON public.spray_logs(user_id, spray_date DESC);

CREATE TABLE public.farmer_crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crop text NOT NULL,
  variety text,
  sowing_date date NOT NULL,
  area_acres numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.farmer_crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers view own crops" ON public.farmer_crops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Farmers insert own crops" ON public.farmer_crops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Farmers update own crops" ON public.farmer_crops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Farmers delete own crops" ON public.farmer_crops FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.disease_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scan_date timestamptz NOT NULL DEFAULT now(),
  crop text,
  diagnosis text NOT NULL,
  severity text,
  recommendation text,
  image_url text
);
ALTER TABLE public.disease_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers view own scans" ON public.disease_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Farmers insert own scans" ON public.disease_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Farmers delete own scans" ON public.disease_scans FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX disease_scans_user_date_idx ON public.disease_scans(user_id, scan_date DESC);