-- 1. Add payment_method + state columns
ALTER TABLE public.customer_orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS state text;

-- 2. Trigger function: when an order becomes paid/completed, create a GST invoice (idempotent on order_number)
CREATE OR REPLACE FUNCTION public.create_invoice_for_paid_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric := COALESCE(NEW.total, 0);
  v_is_ka boolean := (lower(coalesce(NEW.state, '')) IN ('karnataka','ka'));
  v_subtotal numeric;
  v_cgst numeric := 0;
  v_sgst numeric := 0;
  v_igst numeric := 0;
  v_items jsonb;
BEGIN
  -- Only act when transitioning into a paid-ish state
  IF (NEW.status IN ('paid','completed')) AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Skip if invoice already exists for this order
    IF EXISTS (SELECT 1 FROM public.payments WHERE invoice_number = 'INV-' || NEW.order_number) THEN
      RETURN NEW;
    END IF;

    -- GST is INCLUSIVE in total (5% total)
    v_subtotal := round(v_total / 1.05, 2);
    IF v_is_ka THEN
      v_cgst := round((v_total - v_subtotal) / 2, 2);
      v_sgst := (v_total - v_subtotal) - v_cgst;
    ELSE
      v_igst := round(v_total - v_subtotal, 2);
    END IF;

    -- Build items snapshot from order items
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'name', product_name, 'description', '', 'quantity', quantity,
      'rate', unit_price, 'amount', subtotal
    )), '[]'::jsonb)
    INTO v_items
    FROM public.customer_order_items WHERE order_id = NEW.id;

    INSERT INTO public.payments (
      invoice_number, customer_name, party_email, order_title,
      bill_type, items, subtotal,
      cgst_percent, sgst_percent, igst_percent,
      cgst_amount, sgst_amount, igst_amount,
      amount, status, payment_date
    ) VALUES (
      'INV-' || NEW.order_number, NEW.customer_name, NEW.customer_email, 'Online Order ' || NEW.order_number,
      'customer', v_items, v_subtotal,
      CASE WHEN v_is_ka THEN 2.5 ELSE 0 END,
      CASE WHEN v_is_ka THEN 2.5 ELSE 0 END,
      CASE WHEN v_is_ka THEN 0 ELSE 5 END,
      v_cgst, v_sgst, v_igst,
      v_total, 'paid', CURRENT_DATE
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_invoice_for_paid_order ON public.customer_orders;
CREATE TRIGGER trg_create_invoice_for_paid_order
AFTER UPDATE ON public.customer_orders
FOR EACH ROW
EXECUTE FUNCTION public.create_invoice_for_paid_order();