-- Update handle_new_user: field_officer should also be pending and not auto-granted
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Distributors and field officers must be approved by admin first
  _v_status := CASE WHEN _role IN ('distributor','field_officer') THEN 'pending' ELSE 'approved' END;

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

  -- Auto-grant only safe roles
  IF _role NOT IN ('admin','distributor','field_officer') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Update grant_role_on_approval to handle field_officer too
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