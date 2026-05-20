ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean NOT NULL DEFAULT true;

ALTER TABLE public.newsletter_subscribers ALTER COLUMN email DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_phone_unique
  ON public.newsletter_subscribers (phone) WHERE phone IS NOT NULL;