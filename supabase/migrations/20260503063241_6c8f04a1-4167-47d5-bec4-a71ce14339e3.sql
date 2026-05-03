
-- 1) Restrict dealers SELECT: remove broad authenticated read; allow admin/distributor/field_officer roles
DROP POLICY IF EXISTS "Authenticated users can view dealers" ON public.dealers;

CREATE POLICY "Privileged roles can view dealers"
ON public.dealers
FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'distributor'::app_role)
    OR has_role(auth.uid(), 'field_officer'::app_role)
  )
);

-- Public dealer-locator already uses SECURITY DEFINER RPCs (search_dealers_public, nearest_dealers_public,
-- list_dealer_talukas_public) which return only non-sensitive fields, so public discovery still works.

-- 2) Prevent privilege escalation via profile self-update
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins can change anything
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Non-admins cannot modify administrative/verification fields
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
     OR NEW.verification_notes IS DISTINCT FROM OLD.verification_notes
     OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
     OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
     OR NEW.requested_role IS DISTINCT FROM OLD.requested_role THEN
    RAISE EXCEPTION 'Not allowed to modify administrative profile fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();
