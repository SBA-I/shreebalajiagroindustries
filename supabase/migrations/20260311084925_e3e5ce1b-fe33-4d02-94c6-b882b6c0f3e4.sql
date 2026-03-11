
-- Create a security definer function to get dealer profiles (for farmer dealer locator)
CREATE OR REPLACE FUNCTION public.get_dealer_profiles()
RETURNS SETOF profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.* FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.user_id
  WHERE ur.role IN ('dealer', 'distributor')
  AND p.is_approved = true;
$$;
