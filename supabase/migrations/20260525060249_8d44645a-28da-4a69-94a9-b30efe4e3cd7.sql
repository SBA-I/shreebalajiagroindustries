
-- ============================================================
-- 1) STORAGE: restrict LIST/SELECT on storage.objects
-- Keep public-bucket GET working via public URLs (which don't need storage.objects SELECT),
-- but drop the broad "Public Access" SELECT policies that allow listing.
-- ============================================================

-- Drop any existing broad public read policies on storage.objects
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname IN (
        'Public Access',
        'Public read access',
        'Public Read',
        'Give anon users access',
        'Allow public read',
        'Anyone can read product-images',
        'Public can read marketing-kit',
        'Public can read msds',
        'Public can read safety-assets',
        'Public can read field-officer-photos'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Re-create scoped read policies (authenticated only, NOT anon — public file URLs still work)
CREATE POLICY "Authenticated read product-images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated read marketing-kit"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'marketing-kit');

CREATE POLICY "Authenticated read msds"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'msds');

CREATE POLICY "Authenticated read safety-assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'safety-assets');

CREATE POLICY "Authenticated read field-officer-photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'field-officer-photos');

-- Admin full management on every bucket
CREATE POLICY "Admins manage all storage objects"
  ON storage.objects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ============================================================
-- 2) Revoke anon SELECT on sensitive tables (RLS already blocks
-- access; this removes them from the anon GraphQL schema)
-- ============================================================

REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;
REVOKE SELECT ON public.messages FROM anon;
REVOKE SELECT ON public.dealers FROM anon;
REVOKE SELECT ON public.dealer_audits FROM anon;
REVOKE SELECT ON public.dealer_invoices FROM anon;
REVOKE SELECT ON public.dispatches FROM anon;
REVOKE SELECT ON public.farmer_crops FROM anon;
REVOKE SELECT ON public.farmer_leads FROM anon;
REVOKE SELECT ON public.field_officer_attendance FROM anon;
REVOKE SELECT ON public.field_visits FROM anon;
REVOKE SELECT ON public.disease_scans FROM anon;
REVOKE SELECT ON public.spray_logs FROM anon;
REVOKE SELECT ON public.inventory FROM anon;
REVOKE SELECT ON public.contact_inquiries FROM anon;
REVOKE SELECT ON public.newsletter_subscribers FROM anon;
REVOKE SELECT ON public.admin_audit_log FROM anon;
REVOKE SELECT ON public.order_items FROM anon;
REVOKE SELECT ON public.dealer_stock FROM anon;

-- (Keep anon SELECT on these public-content tables — the site needs them)
-- products, news_articles, sustainability_articles, msds_documents, pest_calendar, marketing_assets

-- ============================================================
-- 3) Anti-spam rate limiting on public forms
-- ============================================================

CREATE OR REPLACE FUNCTION public.rate_limit_contact_inquiries()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _recent_count int;
BEGIN
  SELECT COUNT(*) INTO _recent_count
  FROM public.contact_inquiries
  WHERE email = NEW.email
    AND created_at > now() - interval '60 seconds';

  IF _recent_count >= 1 THEN
    RAISE EXCEPTION 'Please wait a moment before submitting another inquiry.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rate_limit_contact_inquiries_trigger ON public.contact_inquiries;
CREATE TRIGGER rate_limit_contact_inquiries_trigger
  BEFORE INSERT ON public.contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_contact_inquiries();

CREATE OR REPLACE FUNCTION public.rate_limit_newsletter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _recent_count int;
BEGIN
  IF NEW.email IS NOT NULL THEN
    SELECT COUNT(*) INTO _recent_count
    FROM public.newsletter_subscribers
    WHERE email = NEW.email
      AND created_at > now() - interval '60 seconds'
      AND id <> NEW.id;
    IF _recent_count >= 1 THEN
      RAISE EXCEPTION 'Please wait a moment before subscribing again.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  IF NEW.phone IS NOT NULL THEN
    SELECT COUNT(*) INTO _recent_count
    FROM public.newsletter_subscribers
    WHERE phone = NEW.phone
      AND created_at > now() - interval '60 seconds'
      AND id <> NEW.id;
    IF _recent_count >= 1 THEN
      RAISE EXCEPTION 'Please wait a moment before subscribing again.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rate_limit_newsletter_trigger ON public.newsletter_subscribers;
CREATE TRIGGER rate_limit_newsletter_trigger
  BEFORE INSERT ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_newsletter();
