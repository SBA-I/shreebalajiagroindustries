-- 1. Dealers: remove broad public read; require auth for full row.
DROP POLICY IF EXISTS "Dealers public read" ON public.dealers;

CREATE POLICY "Authenticated users can view dealers"
ON public.dealers
FOR SELECT
TO authenticated
USING (is_active = true);

-- Public-safe dealer lookup that omits phone, email, contact_person
CREATE OR REPLACE FUNCTION public.search_dealers_public(_pincode text)
RETURNS TABLE (
  id uuid,
  name text,
  address_line text,
  city text,
  district text,
  state text,
  pincode text,
  is_authorized boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH exact AS (
    SELECT d.id, d.name, d.address_line, d.city, d.district, d.state, d.pincode, d.is_authorized
    FROM public.dealers d
    WHERE d.is_active = true
      AND d.pincode = _pincode
  )
  SELECT * FROM exact
  UNION ALL
  SELECT d.id, d.name, d.address_line, d.city, d.district, d.state, d.pincode, d.is_authorized
  FROM public.dealers d
  WHERE NOT EXISTS (SELECT 1 FROM exact)
    AND d.is_active = true
    AND d.pincode LIKE left(_pincode, 3) || '%'
  LIMIT 10;
$$;

REVOKE ALL ON FUNCTION public.search_dealers_public(text) FROM public;
GRANT EXECUTE ON FUNCTION public.search_dealers_public(text) TO anon, authenticated;

-- 2. Dispatches: drop public read; only admins (already covered by Admin manage).
DROP POLICY IF EXISTS "Dispatch public read" ON public.dispatches;

-- 3. Order items: admin-only read access.
CREATE POLICY "Admins can view order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage order items"
ON public.order_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Dealer documents: allow deleting own files in private bucket.
CREATE POLICY "Dealer can delete own docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'dealer-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);