-- 1) Wipe pre-existing/demo categories + products (cascading via FK delete behavior)
DELETE FROM public.customer_order_items WHERE product_id IN (SELECT id FROM public.products);
DELETE FROM public.cart_items WHERE product_id IN (SELECT id FROM public.products);
DELETE FROM public.products;
DELETE FROM public.categories;

-- 2) Enable Realtime on chat + customer_orders so messages and order updates push live
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_threads REPLICA IDENTITY FULL;
ALTER TABLE public.customer_orders REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_orders; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 3) Allow customers to cancel their own orders (status -> cancelled) before delivery.
-- Existing UPDATE policy is admin-only; add a customer self-cancel policy.
CREATE POLICY "Customers cancel own pending orders"
ON public.customer_orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND tracking_status <> 'delivered' AND status <> 'cancelled')
WITH CHECK (auth.uid() = user_id);

-- 4) Seed default content sections so the Content admin page has rows to edit
INSERT INTO public.content_sections (section_key, title, content) VALUES
  ('hero', 'Hero Banner', '{"eyebrow":"Since 1985 · Mysore","heading":"Timeless Sarees, Woven with Love","subheading":"Discover handpicked Banarasi, Kanjivaram and bridal collections from India''s most celebrated weavers.","cta_label":"Shop Now","cta_link":"/shop"}'::jsonb),
  ('featured_collections', 'Featured Collections', '{"eyebrow":"Featured","heading":"Shop by Category"}'::jsonb),
  ('testimonials', 'Testimonials', '{"items":[{"name":"Lakshmi R.","quote":"The quality of the Kanjivaram is breathtaking. Felt heard at every step."}]}'::jsonb),
  ('promotions', 'Promotions', '{"banner_text":"","banner_link":""}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

-- 5) Add unique constraint on section_key so admin upserts cleanly
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_sections_section_key_key') THEN
    ALTER TABLE public.content_sections ADD CONSTRAINT content_sections_section_key_key UNIQUE (section_key);
  END IF;
END $$;