-- =========================================================
-- New sections: Safety, Dealer Portal, Tools, Sustainability
-- =========================================================

-- ---------- Storage buckets ----------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('msds', 'msds', true),
  ('marketing-kit', 'marketing-kit', true),
  ('safety-assets', 'safety-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for these buckets
CREATE POLICY "Public can read msds"
ON storage.objects FOR SELECT
USING (bucket_id = 'msds');

CREATE POLICY "Public can read marketing kit"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketing-kit');

CREATE POLICY "Public can read safety assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'safety-assets');

-- Admins manage uploads
CREATE POLICY "Admins manage msds"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'msds' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'msds' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage marketing kit"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'marketing-kit' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'marketing-kit' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage safety assets"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'safety-assets' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'safety-assets' AND public.has_role(auth.uid(), 'admin'));

-- ---------- MSDS documents ----------
CREATE TABLE public.msds_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  version text,
  file_url text NOT NULL,
  file_size_kb integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.msds_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MSDS public read" ON public.msds_documents
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage MSDS" ON public.msds_documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tr_msds_updated BEFORE UPDATE ON public.msds_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Marketing kit assets ----------
CREATE TABLE public.marketing_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  asset_type text NOT NULL DEFAULT 'banner', -- banner | poster | social | video
  file_url text NOT NULL,
  thumbnail_url text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.marketing_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marketing assets public read" ON public.marketing_assets
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage marketing" ON public.marketing_assets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tr_marketing_updated BEFORE UPDATE ON public.marketing_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Authorized dealers ----------
CREATE TABLE public.dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text NOT NULL,
  email text,
  address_line text NOT NULL,
  city text NOT NULL,
  district text,
  state text NOT NULL,
  pincode text NOT NULL,
  is_authorized boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dealers_pincode_idx ON public.dealers(pincode);
CREATE INDEX dealers_state_idx ON public.dealers(state);
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealers public read" ON public.dealers
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage dealers" ON public.dealers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tr_dealers_updated BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Dispatches (order tracking) ----------
CREATE TABLE public.dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text NOT NULL UNIQUE,
  dealer_id uuid REFERENCES public.dealers(id) ON DELETE SET NULL,
  dealer_name text NOT NULL,
  destination_city text NOT NULL,
  destination_state text NOT NULL,
  status text NOT NULL DEFAULT 'preparing',
  -- preparing | dispatched | in_transit | out_for_delivery | delivered | cancelled
  carrier text,
  carrier_ref text,
  notes text,
  dispatched_at timestamptz,
  expected_delivery_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dispatches_tracking_idx ON public.dispatches(tracking_number);
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
-- Anyone can look up by tracking number from the public page
CREATE POLICY "Dispatch public read" ON public.dispatches
  FOR SELECT USING (true);
CREATE POLICY "Admin manage dispatches" ON public.dispatches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tr_dispatches_updated BEFORE UPDATE ON public.dispatches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Pest calendar entries ----------
CREATE TABLE public.pest_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pest_name text NOT NULL,
  crop text NOT NULL,
  season text NOT NULL,                -- Kharif | Rabi | Zaid
  region text NOT NULL DEFAULT 'Maharashtra',
  active_months integer[] NOT NULL,     -- 1..12
  severity text NOT NULL DEFAULT 'medium', -- low | medium | high
  recommended_product_ids uuid[],
  preventive_tips text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pest_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pest calendar public read" ON public.pest_calendar
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage pest calendar" ON public.pest_calendar
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tr_pest_calendar_updated BEFORE UPDATE ON public.pest_calendar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Sustainability & R&D articles ----------
CREATE TABLE public.sustainability_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body text NOT NULL,
  hero_image_url text,
  category text NOT NULL DEFAULT 'sustainability', -- sustainability | rnd | ipm | soil
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sustainability_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sustainability articles public read" ON public.sustainability_articles
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admin manage sustainability" ON public.sustainability_articles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tr_sustainability_updated BEFORE UPDATE ON public.sustainability_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
