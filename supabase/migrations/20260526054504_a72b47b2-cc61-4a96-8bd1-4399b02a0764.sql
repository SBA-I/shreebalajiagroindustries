
CREATE OR REPLACE FUNCTION public.get_push_internal_secret()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _s text;
BEGIN
  SELECT decrypted_secret INTO _s FROM vault.decrypted_secrets WHERE name = 'internal_secret_for_push' LIMIT 1;
  RETURN _s;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_push_internal_secret(_secret text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  SELECT id INTO _id FROM vault.secrets WHERE name = 'internal_secret_for_push' LIMIT 1;
  IF _id IS NULL THEN
    PERFORM vault.create_secret(_secret, 'internal_secret_for_push', 'Used by trigger_push_on_message to call send-push');
  ELSE
    PERFORM vault.update_secret(_id, _secret, 'internal_secret_for_push', 'Used by trigger_push_on_message to call send-push');
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_push_internal_secret() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_push_internal_secret(text) FROM PUBLIC, anon, authenticated;
