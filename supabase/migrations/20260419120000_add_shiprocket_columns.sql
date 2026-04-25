-- Add Shiprocket tracking columns to customer_orders
ALTER TABLE public.customer_orders
  ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT,
  ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT;

COMMENT ON COLUMN public.customer_orders.shiprocket_order_id IS 'Shiprocket order ID returned after order creation';
COMMENT ON COLUMN public.customer_orders.shiprocket_shipment_id IS 'Shiprocket shipment ID for AWB / tracking';
