
ALTER TABLE public.products
  ADD COLUMN mode_of_action TEXT,
  ADD COLUMN pack_sizes TEXT[],
  ADD COLUMN safety_precautions TEXT[],
  ADD COLUMN popularity INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN is_new BOOLEAN NOT NULL DEFAULT false;
