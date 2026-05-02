-- 1. Extend dispatches with LR, transport, dealer link, challan/POD url
ALTER TABLE public.dispatches
  ADD COLUMN IF NOT EXISTS lr_number text,
  ADD COLUMN IF NOT EXISTS transport_company text,
  ADD COLUMN IF NOT EXISTS driver_name text,
  ADD COLUMN IF NOT EXISTS driver_phone text,
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'order_confirmed',
  ADD COLUMN IF NOT EXISTS challan_url text,
  ADD COLUMN IF NOT EXISTS product_summary text,
  ADD COLUMN IF NOT EXISTS quantity_summary text;

-- Allow dealers to view their own dispatches
DROP POLICY IF EXISTS "Dealers view own dispatches" ON public.dispatches;
CREATE POLICY "Dealers view own dispatches"
ON public.dispatches FOR SELECT TO authenticated
USING (
  dealer_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.dealers d
    WHERE d.id = dispatches.dealer_id AND d.user_id = auth.uid()
  )
);

-- 2. Add audience tag to marketing assets
ALTER TABLE public.marketing_assets
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'dealers';

-- Replace the public read policy with one that respects audience.
DROP POLICY IF EXISTS "Marketing assets public read" ON public.marketing_assets;
CREATE POLICY "Public marketing assets read"
ON public.marketing_assets FOR SELECT TO public
USING (is_active = true AND audience = 'public');

-- Approved dealers (and field officers / admins) can see dealer-only assets
CREATE POLICY "Dealers read dealer marketing assets"
ON public.marketing_assets FOR SELECT TO authenticated
USING (
  is_active = true AND (
    audience = 'public'
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'distributor')
    OR has_role(auth.uid(), 'field_officer')
  )
);

-- 3. dealer_stock table
CREATE TABLE IF NOT EXISTS public.dealer_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.dealers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_stock',
  arriving_on date,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dealer_id, product_id)
);

ALTER TABLE public.dealer_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read dealer stock"
ON public.dealer_stock FOR SELECT TO public USING (true);

CREATE POLICY "Admin manage dealer stock"
ON public.dealer_stock FOR ALL TO authenticated
USING (has_role(auth.uid(),'admin'))
WITH CHECK (has_role(auth.uid(),'admin'));

CREATE POLICY "Dealer manage own stock"
ON public.dealer_stock FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.dealers d WHERE d.id = dealer_stock.dealer_id AND d.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.dealers d WHERE d.id = dealer_stock.dealer_id AND d.user_id = auth.uid()));

CREATE TRIGGER trg_dealer_stock_updated_at
BEFORE UPDATE ON public.dealer_stock
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dealer_stock_dealer ON public.dealer_stock(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_stock_product ON public.dealer_stock(product_id);
