-- 1) Extend profiles with role-specific fields + verification
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS taluka text,
  ADD COLUMN IF NOT EXISTS crops text[],
  ADD COLUMN IF NOT EXISTS land_size_acres numeric,
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS shop_name text,
  ADD COLUMN IF NOT EXISTS gst_number text,
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS shop_address text,
  ADD COLUMN IF NOT EXISTS shop_lat numeric,
  ADD COLUMN IF NOT EXISTS shop_lng numeric,
  ADD COLUMN IF NOT EXISTS gst_document_url text,
  ADD COLUMN IF NOT EXISTS license_document_url text,
  ADD COLUMN IF NOT EXISTS employee_id text,
  ADD COLUMN IF NOT EXISTS assigned_territory text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS verification_notes text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Validate verification_status values via trigger (avoids immutable CHECK on enums later)
CREATE OR REPLACE FUNCTION public.validate_verification_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_status NOT IN ('pending','approved','rejected') THEN
    RAISE EXCEPTION 'Invalid verification_status: %', NEW.verification_status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_profile_verification_status ON public.profiles;
CREATE TRIGGER validate_profile_verification_status
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_verification_status();

-- 2) Update handle_new_user to capture all metadata + gate dealers behind verification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
  _crops text[];
  _land numeric;
  _v_status text;
BEGIN
  BEGIN
    _role := COALESCE((NEW.raw_user_meta_data ->> 'requested_role')::app_role, 'farmer');
  EXCEPTION WHEN others THEN
    _role := 'farmer';
  END;

  -- Parse crops array if provided (JSON array)
  BEGIN
    SELECT ARRAY(SELECT jsonb_array_elements_text((NEW.raw_user_meta_data -> 'crops')))
    INTO _crops;
  EXCEPTION WHEN others THEN
    _crops := NULL;
  END;

  BEGIN
    _land := NULLIF(NEW.raw_user_meta_data ->> 'land_size_acres', '')::numeric;
  EXCEPTION WHEN others THEN
    _land := NULL;
  END;

  -- Distributors must be approved by admin before getting the role
  _v_status := CASE WHEN _role = 'distributor' THEN 'pending' ELSE 'approved' END;

  INSERT INTO public.profiles (
    user_id, full_name, phone, requested_role,
    state, district, taluka, crops, land_size_acres, preferred_language,
    shop_name, gst_number, license_number, shop_address,
    shop_lat, shop_lng, gst_document_url, license_document_url,
    employee_id, assigned_territory,
    verification_status
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    _role,
    NEW.raw_user_meta_data ->> 'state',
    NEW.raw_user_meta_data ->> 'district',
    NEW.raw_user_meta_data ->> 'taluka',
    _crops,
    _land,
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'en'),
    NEW.raw_user_meta_data ->> 'shop_name',
    NEW.raw_user_meta_data ->> 'gst_number',
    NEW.raw_user_meta_data ->> 'license_number',
    NEW.raw_user_meta_data ->> 'shop_address',
    NULLIF(NEW.raw_user_meta_data ->> 'shop_lat','')::numeric,
    NULLIF(NEW.raw_user_meta_data ->> 'shop_lng','')::numeric,
    NEW.raw_user_meta_data ->> 'gst_document_url',
    NEW.raw_user_meta_data ->> 'license_document_url',
    NEW.raw_user_meta_data ->> 'employee_id',
    NEW.raw_user_meta_data ->> 'assigned_territory',
    _v_status
  );

  -- Grant role automatically EXCEPT for admin (manual) and distributor (pending approval)
  IF _role NOT IN ('admin','distributor') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the auth trigger exists (re-create idempotently)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) When admin approves a dealer, grant distributor role automatically
CREATE OR REPLACE FUNCTION public.grant_role_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_status = 'approved'
     AND COALESCE(OLD.verification_status,'') <> 'approved'
     AND NEW.requested_role = 'distributor' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'distributor')
    ON CONFLICT DO NOTHING;
  END IF;

  -- If rejected later, revoke the distributor role
  IF NEW.verification_status = 'rejected'
     AND COALESCE(OLD.verification_status,'') = 'approved'
     AND NEW.requested_role = 'distributor' THEN
    DELETE FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = 'distributor';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_grant_role_on_approval ON public.profiles;
CREATE TRIGGER profile_grant_role_on_approval
AFTER UPDATE OF verification_status ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.grant_role_on_approval();

-- 4) Storage bucket for dealer documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('dealer-documents', 'dealer-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: dealers manage their own folder, admins read all
DROP POLICY IF EXISTS "Dealer can read own docs" ON storage.objects;
CREATE POLICY "Dealer can read own docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'dealer-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Dealer can upload own docs" ON storage.objects;
CREATE POLICY "Dealer can upload own docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dealer-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Dealer can update own docs" ON storage.objects;
CREATE POLICY "Dealer can update own docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'dealer-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Admin reads dealer docs" ON storage.objects;
CREATE POLICY "Admin reads dealer docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'dealer-documents'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Also allow unauthenticated uploads during signup to a temp prefix? No — uploads happen
-- AFTER login when the dealer completes their profile. Signup page can collect numbers only.

-- 5) Allow dealers to update their own verification documents (already covered by
-- existing "Users can update own profile" policy). Nothing extra needed.