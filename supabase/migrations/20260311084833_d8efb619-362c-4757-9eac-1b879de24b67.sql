
-- Create trigger to auto-assign dealer role on signup (when user signs up through the dealer registration form)
-- The handle_new_user trigger already creates the profile. We need a trigger to assign dealer role.
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only auto-assign dealer role if the email doesn't end with @farmer.sbai.local
  -- (farmer roles are assigned in the app code)
  IF NEW.email NOT LIKE '%@farmer.sbai.local' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'dealer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for role assignment
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Also make sure the profile trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
