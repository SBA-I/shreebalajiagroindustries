
-- 1) Admin audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_name text,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  target_label text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert audit log" ON public.admin_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND admin_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON public.admin_audit_log (created_at DESC);

-- 2) Soft delete on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_deactivated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz;

-- 3) Low-stock alert trigger
CREATE OR REPLACE FUNCTION public.notify_admins_on_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _dealer_name text;
  _product_name text;
BEGIN
  IF NEW.quantity_available IS NULL OR NEW.quantity_available > 5 THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND COALESCE(OLD.quantity_available, 999) <= 5 THEN
    -- already low; skip duplicate notification
    RETURN NEW;
  END IF;
  SELECT name INTO _dealer_name FROM public.dealers WHERE id = NEW.dealer_id;
  SELECT name INTO _product_name FROM public.products WHERE id = NEW.product_id;
  PERFORM public.notify_admins(
    'Low stock: ' || COALESCE(_product_name, 'product') || ' at ' || COALESCE(_dealer_name, 'dealer'),
    'Only ' || NEW.quantity_available || ' units left',
    'Stock alert — ' || COALESCE(_product_name, 'product') || ' at dealer ' || COALESCE(_dealer_name, '') || ' has ' || NEW.quantity_available || ' units remaining. Consider replenishment.',
    'Inventory',
    'general'::message_type
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_low_stock_notify ON public.dealer_stock;
CREATE TRIGGER trg_low_stock_notify
AFTER INSERT OR UPDATE OF quantity_available ON public.dealer_stock
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_low_stock();
