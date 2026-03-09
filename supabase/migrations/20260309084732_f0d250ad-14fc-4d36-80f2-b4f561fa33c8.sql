CREATE TABLE public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  inquiry_type text NOT NULL DEFAULT 'general',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_resolved boolean NOT NULL DEFAULT false
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inquiries"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage inquiries"
ON public.contact_inquiries
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));