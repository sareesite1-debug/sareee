// Auto-sync customer order to Shiprocket
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SR_EMAIL = Deno.env.get("SHIPROCKET_EMAIL");
const SR_PASSWORD = Deno.env.get("SHIPROCKET_PASSWORD");
const SR_PICKUP = Deno.env.get("SHIPROCKET_PICKUP_LOCATION") || "Primary";

async function getToken(): Promise<string> {
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SR_EMAIL, password: SR_PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Shiprocket auth failed: ${JSON.stringify(data)}`);
  return data.token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!SR_EMAIL || !SR_PASSWORD) {
      return new Response(JSON.stringify({ ok: false, skipped: true, reason: "Shiprocket credentials not configured" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { order_id } = await req.json();
    if (!order_id) throw new Error("order_id required");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: order, error: oErr } = await supabase.from("customer_orders").select("*").eq("id", order_id).single();
    if (oErr || !order) throw new Error("Order not found");
    const { data: items } = await supabase.from("customer_order_items").select("*").eq("order_id", order_id);
    if (!items || items.length === 0) throw new Error("No items in order");

    const token = await getToken();

    const addr = order.shipping_address || "";
    const [namePart] = (order.customer_name || "Customer").split(" ");
    const lastName = (order.customer_name || "").split(" ").slice(1).join(" ") || ".";

    const payload = {
      order_id: order.order_number,
      order_date: new Date(order.created_at).toISOString().slice(0, 19).replace("T", " "),
      pickup_location: SR_PICKUP,
      billing_customer_name: namePart,
      billing_last_name: lastName,
      billing_address: addr.slice(0, 80) || "Address not provided",
      billing_city: "Mysore",
      billing_pincode: "570009",
      billing_state: "Karnataka",
      billing_country: "India",
      billing_email: order.customer_email || "noemail@example.com",
      billing_phone: order.customer_phone || "0000000000",
      shipping_is_billing: true,
      order_items: items.map((i: any) => ({
        name: i.product_name,
        sku: i.product_id || `SKU-${i.id.slice(0, 8)}`,
        units: i.quantity,
        selling_price: Number(i.unit_price),
      })),
      payment_method: "COD",
      sub_total: Number(order.total),
      length: 20, breadth: 15, height: 5, weight: 0.5,
    };

    const srRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const srData = await srRes.json();
    if (!srRes.ok) throw new Error(`Shiprocket order create failed: ${JSON.stringify(srData)}`);

    await supabase.from("customer_orders").update({
      shiprocket_order_id: String(srData.order_id || ""),
      shiprocket_shipment_id: String(srData.shipment_id || ""),
    }).eq("id", order_id);

    return new Response(JSON.stringify({ ok: true, shiprocket: srData }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("shiprocket error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
