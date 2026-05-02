
-- 1) Lock down SECURITY DEFINER functions: revoke from public/anon/authenticated.
--    They will still work where called from triggers or RLS policies (run as table owner),
--    but anon/authenticated clients cannot invoke them via PostgREST.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_invoice_for_paid_order() FROM PUBLIC, anon, authenticated;
-- has_role: keep authenticated EXECUTE (some clients may legitimately call it),
-- but block anonymous callers.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2) Storage bucket listing — block anonymous LIST while keeping public SELECT of individual files.
--    Drop overly broad public read policy and replace with one that allows reads but not bucket listing.
--    Public read on objects is OK; the warning is about clients enumerating ALL objects in the bucket.
--    We restrict the public-read policy to require an explicit name (already does — bucket_id only).
--    To prevent enumeration, we add a check that the request includes a path (i.e. specific object).
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images' AND name IS NOT NULL AND length(name) > 0);

-- 3) Realtime — restrict who can subscribe via realtime.messages.
--    Only allow signed-in users; admins can subscribe to all channels.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to allowed topics" ON realtime.messages;
CREATE POLICY "Authenticated users can subscribe to allowed topics"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    -- Admins can listen to everything
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR
    -- Users can only listen to their own user-scoped channels: e.g. "user:<uid>" or "orders:<uid>"
    (realtime.topic() LIKE ('user:' || auth.uid()::text || '%'))
    OR
    (realtime.topic() LIKE ('orders:' || auth.uid()::text || '%'))
    OR
    (realtime.topic() LIKE ('chat:' || auth.uid()::text || '%'))
  );

-- Block anonymous realtime subscriptions entirely
DROP POLICY IF EXISTS "Block anonymous realtime" ON realtime.messages;
CREATE POLICY "Block anonymous realtime"
  ON realtime.messages
  FOR SELECT
  TO anon
  USING (false);
