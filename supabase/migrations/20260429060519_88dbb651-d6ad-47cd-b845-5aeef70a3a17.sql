-- Remove all authentication and dashboard-related tables.
-- Drop tables in dependency-safe order using CASCADE to also remove
-- dependent triggers, policies and foreign keys.

DROP TABLE IF EXISTS public.farmer_meetings CASCADE;
DROP TABLE IF EXISTS public.dealer_visits CASCADE;
DROP TABLE IF EXISTS public.sales_targets CASCADE;
DROP TABLE IF EXISTS public.field_officer_orders CASCADE;
DROP TABLE IF EXISTS public.field_officers CASCADE;
DROP TABLE IF EXISTS public.farmer_questions CASCADE;
DROP TABLE IF EXISTS public.farmer_profiles CASCADE;
DROP TABLE IF EXISTS public.distributor_inventory CASCADE;
DROP TABLE IF EXISTS public.distributor_messages CASCADE;
DROP TABLE IF EXISTS public.distributor_orders CASCADE;
DROP TABLE IF EXISTS public.distributors CASCADE;
DROP TABLE IF EXISTS public.dealers CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop helper functions used by the auth/role system.
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.generate_order_number() CASCADE;

DROP TYPE IF EXISTS public.app_role CASCADE;