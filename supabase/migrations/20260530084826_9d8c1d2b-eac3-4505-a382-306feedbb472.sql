
-- 1. Multi-image and multi-color on products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}'::text[];

-- 2. Snapshot product image + color into order items
ALTER TABLE public.customer_order_items
  ADD COLUMN IF NOT EXISTS product_image text,
  ADD COLUMN IF NOT EXISTS product_color text;

-- 3. Lock cancellation after shipped/delivered (block everyone, incl. admin)
CREATE OR REPLACE FUNCTION public.block_cancel_after_shipped()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (NEW.status = 'cancelled' OR NEW.tracking_status = 'cancelled')
     AND (OLD.tracking_status IN ('shipped','delivered')) THEN
    RAISE EXCEPTION 'Order can no longer be cancelled — already %', OLD.tracking_status;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_block_cancel_after_shipped ON public.customer_orders;
CREATE TRIGGER trg_block_cancel_after_shipped
BEFORE UPDATE ON public.customer_orders
FOR EACH ROW EXECUTE FUNCTION public.block_cancel_after_shipped();

-- Tighten customer self-cancel RLS: customers cannot cancel once shipped/delivered/already cancelled
DROP POLICY IF EXISTS "Customers cancel own pending orders" ON public.customer_orders;
CREATE POLICY "Customers cancel own pending orders"
ON public.customer_orders FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  AND tracking_status NOT IN ('shipped','delivered','cancelled')
  AND status <> 'cancelled'
)
WITH CHECK (auth.uid() = user_id);

-- 4. Auto-create/update customer in clients table on order insert
CREATE OR REPLACE FUNCTION public.upsert_client_on_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_existing_id uuid;
BEGIN
  SELECT id INTO v_existing_id
  FROM public.clients
  WHERE (email IS NOT NULL AND email = NEW.customer_email)
     OR (phone IS NOT NULL AND phone = NEW.customer_phone)
  LIMIT 1;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.clients (name, email, phone, total_orders, total_spent)
    VALUES (NEW.customer_name, NEW.customer_email, NEW.customer_phone, 1, COALESCE(NEW.total, 0));
  ELSE
    UPDATE public.clients
    SET name = COALESCE(NULLIF(NEW.customer_name, ''), name),
        email = COALESCE(NULLIF(NEW.customer_email, ''), email),
        phone = COALESCE(NULLIF(NEW.customer_phone, ''), phone),
        total_orders = COALESCE(total_orders, 0) + 1,
        total_spent = COALESCE(total_spent, 0) + COALESCE(NEW.total, 0),
        updated_at = now()
    WHERE id = v_existing_id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_upsert_client_on_order ON public.customer_orders;
CREATE TRIGGER trg_upsert_client_on_order
AFTER INSERT ON public.customer_orders
FOR EACH ROW EXECUTE FUNCTION public.upsert_client_on_order();
