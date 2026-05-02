-- Add columns to dealers to mirror signup fields
ALTER TABLE public.dealers
  ADD COLUMN IF NOT EXISTS gst_number text,
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS shop_url text;

-- Update approval trigger to also create a dealers row from the profile
CREATE OR REPLACE FUNCTION public.grant_role_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.verification_status = 'approved'
     AND COALESCE(OLD.verification_status,'') <> 'approved'
     AND NEW.requested_role IN ('distributor','field_officer') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.requested_role)
    ON CONFLICT DO NOTHING;

    -- For distributors (dealers): auto-create a dealers row from profile data
    IF NEW.requested_role = 'distributor'
       AND NOT EXISTS (SELECT 1 FROM public.dealers WHERE user_id = NEW.user_id) THEN
      INSERT INTO public.dealers (
        user_id, name, contact_person, phone, email,
        address_line, city, district, taluka, state, pincode,
        lat, lng, gst_number, license_number,
        is_authorized, is_active
      )
      VALUES (
        NEW.user_id,
        COALESCE(NEW.shop_name, NEW.full_name, 'Dealer'),
        NEW.full_name,
        COALESCE(NEW.phone, '0000000000'),
        NULL,
        COALESCE(NEW.shop_address, NEW.district, NEW.state, '—'),
        COALESCE(NEW.taluka, NEW.district, NEW.state, '—'),
        NEW.district,
        NEW.taluka,
        COALESCE(NEW.state, 'Maharashtra'),
        '000000',
        NEW.shop_lat,
        NEW.shop_lng,
        NEW.gst_number,
        NEW.license_number,
        true,
        true
      );
    END IF;
  END IF;

  IF NEW.verification_status = 'rejected'
     AND COALESCE(OLD.verification_status,'') = 'approved'
     AND NEW.requested_role IN ('distributor','field_officer') THEN
    DELETE FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = NEW.requested_role;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on profiles
DROP TRIGGER IF EXISTS trg_grant_role_on_approval ON public.profiles;
CREATE TRIGGER trg_grant_role_on_approval
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_role_on_approval();

-- Backfill: create dealer rows for already-approved distributors that don't have one
INSERT INTO public.dealers (
  user_id, name, contact_person, phone, email,
  address_line, city, district, taluka, state, pincode,
  lat, lng, gst_number, license_number, is_authorized, is_active
)
SELECT
  p.user_id,
  COALESCE(p.shop_name, p.full_name, 'Dealer'),
  p.full_name,
  COALESCE(p.phone, '0000000000'),
  NULL,
  COALESCE(p.shop_address, p.district, p.state, '—'),
  COALESCE(p.taluka, p.district, p.state, '—'),
  p.district,
  p.taluka,
  COALESCE(p.state, 'Maharashtra'),
  '000000',
  p.shop_lat,
  p.shop_lng,
  p.gst_number,
  p.license_number,
  true,
  true
FROM public.profiles p
WHERE p.requested_role = 'distributor'
  AND p.verification_status = 'approved'
  AND NOT EXISTS (SELECT 1 FROM public.dealers d WHERE d.user_id = p.user_id);