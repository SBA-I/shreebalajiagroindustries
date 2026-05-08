
-- 1) Realtime + identity
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 2) RLS: allow admins to insert; allow users to delete own
DROP POLICY IF EXISTS "Admins can insert messages" ON public.messages;
CREATE POLICY "Admins can insert messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 3) Helper to fan-out to all admins (security definer)
CREATE OR REPLACE FUNCTION public.notify_admins(_subject text, _preview text, _body text, _from_name text, _type message_type)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.messages (user_id, from_name, subject, preview, body, type, read)
  SELECT ur.user_id, _from_name, _subject, _preview, _body, _type, false
  FROM public.user_roles ur
  WHERE ur.role = 'admin'::app_role;
END;
$$;

-- 4) Trigger: verification status change → notify the user
CREATE OR REPLACE FUNCTION public.notify_user_on_verification_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_status IS DISTINCT FROM COALESCE(OLD.verification_status,'')
     AND NEW.verification_status IN ('approved','rejected') THEN
    INSERT INTO public.messages (user_id, from_name, subject, preview, body, type, read)
    VALUES (
      NEW.user_id,
      'Shree Balaji Agro',
      CASE WHEN NEW.verification_status = 'approved'
           THEN 'Your account has been approved'
           ELSE 'Your account verification was rejected' END,
      CASE WHEN NEW.verification_status = 'approved'
           THEN 'You can now access your portal.'
           ELSE COALESCE(NEW.verification_notes, 'Please contact support for details.') END,
      CASE WHEN NEW.verification_status = 'approved'
           THEN 'Welcome aboard! Your ' || NEW.requested_role || ' account is now active.'
           ELSE 'Verification rejected: ' || COALESCE(NEW.verification_notes, 'no reason provided.') END,
      'announcement'::message_type,
      false
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_user_on_verification ON public.profiles;
CREATE TRIGGER trg_notify_user_on_verification
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_user_on_verification_change();

-- 5) Trigger: contact_inquiries → notify all admins
CREATE OR REPLACE FUNCTION public.notify_admins_on_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_admins(
    'New inquiry: ' || COALESCE(NEW.inquiry_type,'general'),
    LEFT(NEW.message, 120),
    'From ' || NEW.name || ' <' || NEW.email || '>: ' || NEW.message,
    NEW.name,
    'support'::message_type
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_inquiry ON public.contact_inquiries;
CREATE TRIGGER trg_notify_admins_inquiry
AFTER INSERT ON public.contact_inquiries
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_inquiry();

-- 6) Trigger: new farmer_leads → notify all admins
CREATE OR REPLACE FUNCTION public.notify_admins_on_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_admins(
    'New farmer lead: ' || NEW.farmer_name,
    COALESCE(NEW.village,'') || ', ' || COALESCE(NEW.district,''),
    'Field officer logged a new lead. Crops: ' || array_to_string(COALESCE(NEW.crops, ARRAY[]::text[]), ', '),
    'Field Officer',
    'general'::message_type
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_lead ON public.farmer_leads;
CREATE TRIGGER trg_notify_admins_lead
AFTER INSERT ON public.farmer_leads
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_lead();

-- 7) Trigger: dispatch update → notify dealer user
CREATE OR REPLACE FUNCTION public.notify_dealer_on_dispatch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _user uuid;
BEGIN
  IF NEW.dealer_id IS NULL THEN RETURN NEW; END IF;
  IF (TG_OP = 'INSERT')
     OR (NEW.stage IS DISTINCT FROM OLD.stage)
     OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    SELECT user_id INTO _user FROM public.dealers WHERE id = NEW.dealer_id;
    IF _user IS NOT NULL THEN
      INSERT INTO public.messages (user_id, from_name, subject, preview, body, type, read)
      VALUES (_user, 'Dispatch', 'Dispatch update: ' || NEW.tracking_number,
              'Stage: ' || NEW.stage || ' / Status: ' || NEW.status,
              'Your shipment ' || NEW.tracking_number || ' is now ' || NEW.stage || ' (' || NEW.status || ').',
              'order'::message_type, false);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_dealer_dispatch ON public.dispatches;
CREATE TRIGGER trg_notify_dealer_dispatch
AFTER INSERT OR UPDATE ON public.dispatches
FOR EACH ROW EXECUTE FUNCTION public.notify_dealer_on_dispatch();
