
-- 1. Enable pg_net for outbound HTTP from the database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subs"
  ON public.push_subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all push subs"
  ON public.push_subscriptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

REVOKE SELECT ON public.push_subscriptions FROM anon;

-- 3. Store internal secret in vault for the DB trigger to use
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'internal_secret_for_push') THEN
    PERFORM vault.create_secret(
      coalesce(current_setting('app.internal_secret', true), 'change-me-set-via-migration'),
      'internal_secret_for_push',
      'Used by trigger_push_on_message to call send-push edge function'
    );
  END IF;
END $$;

-- 4. Trigger that calls send-push edge function on every new message
CREATE OR REPLACE FUNCTION public.trigger_push_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _secret text;
  _url text := 'https://crtzqnkpcbqocgyolajd.supabase.co/functions/v1/send-push';
BEGIN
  SELECT decrypted_secret INTO _secret
  FROM vault.decrypted_secrets WHERE name = 'internal_secret_for_push' LIMIT 1;

  IF _secret IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', _secret
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.subject,
      'body', COALESCE(NEW.preview, NEW.subject),
      'url', '/dashboard'
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_send_push ON public.messages;
CREATE TRIGGER messages_send_push
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.trigger_push_on_message();
