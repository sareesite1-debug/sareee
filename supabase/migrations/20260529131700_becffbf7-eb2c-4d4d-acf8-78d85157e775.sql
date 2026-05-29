-- 1. Add color column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS color text;

-- 2. Restock products when a customer order is cancelled (status change to cancelled)
CREATE OR REPLACE FUNCTION public.restock_on_order_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (NEW.status = 'cancelled' OR NEW.tracking_status = 'cancelled')
     AND (OLD.status <> 'cancelled' AND OLD.tracking_status <> 'cancelled') THEN
    UPDATE public.products p
    SET stock = p.stock + oi.quantity,
        status = CASE WHEN p.status = 'out_of_stock' THEN 'active' ELSE p.status END
    FROM public.customer_order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restock_on_order_cancel ON public.customer_orders;
CREATE TRIGGER trg_restock_on_order_cancel
AFTER UPDATE ON public.customer_orders
FOR EACH ROW
EXECUTE FUNCTION public.restock_on_order_cancel();