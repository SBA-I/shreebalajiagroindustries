
-- 1. Extend dealers
ALTER TABLE public.dealers
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS taluka text,
  ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS idx_dealers_user_id ON public.dealers(user_id);
CREATE INDEX IF NOT EXISTS idx_dealers_taluka ON public.dealers(taluka);

-- Allow a logged-in distributor to see their own dealer record
DROP POLICY IF EXISTS "Dealer owners can view self" ON public.dealers;
CREATE POLICY "Dealer owners can view self" ON public.dealers
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2. Dealer invoices (Document Vault)
CREATE TABLE IF NOT EXISTS public.dealer_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  product_summary text,
  quantity_summary text,
  status text NOT NULL DEFAULT 'dispatched',
  pdf_url text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dealer_invoices_status_chk CHECK (status IN ('dispatched','delivered','returns_processed'))
);

CREATE INDEX IF NOT EXISTS idx_dealer_invoices_dealer ON public.dealer_invoices(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_invoices_date ON public.dealer_invoices(invoice_date DESC);

ALTER TABLE public.dealer_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage dealer invoices" ON public.dealer_invoices
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dealers view own invoices" ON public.dealer_invoices
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dealers d
    WHERE d.id = dealer_invoices.dealer_id AND d.user_id = auth.uid()
  )
);

CREATE TRIGGER update_dealer_invoices_updated_at
BEFORE UPDATE ON public.dealer_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Storage bucket for invoice PDFs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('dealer-invoices', 'dealer-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Admin full control on the bucket
CREATE POLICY "Admin manage dealer invoice files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'dealer-invoices' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'dealer-invoices' AND public.has_role(auth.uid(), 'admin'));

-- Dealers can read files in their dealer-id folder (path: <dealer_id>/<filename>.pdf)
CREATE POLICY "Dealers read own invoice files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'dealer-invoices'
  AND EXISTS (
    SELECT 1 FROM public.dealers d
    WHERE d.user_id = auth.uid()
      AND d.id::text = (storage.foldername(name))[1]
  )
);

-- 4. Update public search RPC to return locator-friendly fields
DROP FUNCTION IF EXISTS public.search_dealers_public(text);
CREATE OR REPLACE FUNCTION public.search_dealers_public(_pincode text)
RETURNS TABLE (
  id uuid, name text, address_line text, city text, district text, taluka text,
  state text, pincode text, is_authorized boolean, lat numeric, lng numeric,
  photo_url text, whatsapp text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH exact AS (
    SELECT d.id, d.name, d.address_line, d.city, d.district, d.taluka, d.state,
           d.pincode, d.is_authorized, d.lat, d.lng, d.photo_url, d.whatsapp
    FROM public.dealers d
    WHERE d.is_active = true AND d.pincode = _pincode
  )
  SELECT * FROM exact
  UNION ALL
  SELECT d.id, d.name, d.address_line, d.city, d.district, d.taluka, d.state,
         d.pincode, d.is_authorized, d.lat, d.lng, d.photo_url, d.whatsapp
  FROM public.dealers d
  WHERE NOT EXISTS (SELECT 1 FROM exact)
    AND d.is_active = true
    AND d.pincode LIKE left(_pincode, 3) || '%'
  LIMIT 10;
$$;

-- 5. Nearest by GPS (great-circle approximation using haversine)
CREATE OR REPLACE FUNCTION public.nearest_dealers_public(_lat numeric, _lng numeric, _limit int DEFAULT 5)
RETURNS TABLE (
  id uuid, name text, address_line text, city text, district text, taluka text,
  state text, pincode text, is_authorized boolean, lat numeric, lng numeric,
  photo_url text, whatsapp text, distance_km numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT d.id, d.name, d.address_line, d.city, d.district, d.taluka, d.state,
         d.pincode, d.is_authorized, d.lat, d.lng, d.photo_url, d.whatsapp,
         ROUND(
           (6371 * acos(
             LEAST(1, GREATEST(-1,
               cos(radians(_lat)) * cos(radians(d.lat)) *
               cos(radians(d.lng) - radians(_lng)) +
               sin(radians(_lat)) * sin(radians(d.lat))
             ))
           ))::numeric, 2
         ) AS distance_km
  FROM public.dealers d
  WHERE d.is_active = true AND d.lat IS NOT NULL AND d.lng IS NOT NULL
  ORDER BY distance_km ASC
  LIMIT GREATEST(1, LEAST(_limit, 20));
$$;

-- 6. List talukas/districts helper
CREATE OR REPLACE FUNCTION public.list_dealer_talukas_public()
RETURNS TABLE (taluka text, district text, state text, dealer_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT taluka, district, state, COUNT(*)::bigint
  FROM public.dealers
  WHERE is_active = true AND taluka IS NOT NULL
  GROUP BY taluka, district, state
  ORDER BY taluka;
$$;
