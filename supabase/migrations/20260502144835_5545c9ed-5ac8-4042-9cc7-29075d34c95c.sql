ALTER TABLE public.dealer_stock
  ADD COLUMN IF NOT EXISTS pack_size text,
  ADD COLUMN IF NOT EXISTS quantity_available integer,
  ADD COLUMN IF NOT EXISTS price numeric;