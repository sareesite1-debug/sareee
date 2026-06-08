// Auto-sync customer order to Shiprocket
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SR_EMAIL = Deno.env.get("SHIPROCKET_EMAIL");
const SR_PASSWORD = Deno.env.get("SHIPROCKET_PASSWORD");
const SR_PICKUP = Deno.env.get("SHIPROCKET_PICKUP_LOCATION") || "Primary";

// Token cache (lives for the lifetime of this isolate, ~24h)
let cachedToken: string | null = null;
let tokenFetchedAt = 0;
const TOKEN_TTL_MS = 23 * 60 * 60 * 1000;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now - tokenFetchedAt < TOKEN_TTL_MS) return cachedToken;
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SR_EMAIL, password: SR_PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Shiprocket auth failed: ${JSON.stringify(data)}`);
  cachedToken = data.token;
  tokenFetchedAt = now;
  return cachedToken!;
}

Deno.serve(async (req) => {
  console.log("Function invoked:", req.method);
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    console.log("Credentials check — email set:", !!SR_EMAIL, "password set:", !!SR_PASSWORD);
    if (!SR_EMAIL || !SR_PASSWORD) {
      return respond({ ok: false, skipped: true, reason: "Shiprocket credentials not configured" });
    }

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));
    const { order_id } = body;
    if (!order_id) throw new Error("order_id required");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: order, error: oErr } = await supabase
      .from("customer_orders")
      .select("*")
      .eq("id", order_id)
      .single();
    if (oErr || !order) throw new Error(`Order not found: ${JSON.stringify(oErr)}`);
    console.log("Order fetched:", order.order_number, "shiprocket_order_id:", order.shiprocket_order_id);

    // Idempotency guard: skip if already synced
    if (order.shiprocket_order_id) {
      console.log(`Already synced to Shiprocket (${order.shiprocket_order_id}), skipping.`);
      return respond({ ok: true, skipped: true, reason: "Already synced", shiprocket_order_id: order.shiprocket_order_id });
    }

    const { data: items } = await supabase
      .from("customer_order_items")
      .select("*")
      .eq("order_id", order_id);
    if (!items || items.length === 0) throw new Error("No items in order");
    console.log("Items fetched:", items.length);

    const token = await getToken();
    console.log("Shiprocket token obtained");

    const [firstName, ...rest] = (order.customer_name || "Customer").split(" ");
    const lastName = rest.join(" ") || ".";
    const addr = (order.shipping_address || "Address not provided").slice(0, 80);
    const pm = String(order.payment_method || "cod").toLowerCase();

    const payload = {
      order_id: order.order_number,
      order_date: new Date(order.created_at).toISOString().slice(0, 19).replace("T", " "),
      pickup_location: SR_PICKUP,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: addr,
      billing_city: order.city || "Mysore",
      billing_pincode: order.zip_code || "570009",
      billing_state: order.state || "Karnataka",
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
      payment_method: ["online", "paid", "prepaid"].includes(pm) ? "Prepaid" : "COD",
      sub_total: Number(order.total),
      length: 20,
      breadth: 15,
      height: 5,
      weight: 0.5,
    };

    console.log("Sending to Shiprocket:", JSON.stringify(payload));

    const srRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const srData = await srRes.json();
    console.log("Shiprocket response status:", srRes.status, "body:", JSON.stringify(srData));

    // If Shiprocket says duplicate, treat as success
    if (!srRes.ok) {
      const msg = JSON.stringify(srData).toLowerCase();
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        console.warn("Duplicate order in Shiprocket, treating as success");
        return respond({ ok: true, skipped: true, reason: "Duplicate in Shiprocket", shiprocket: srData });
      }
      throw new Error(`Shiprocket order create failed: ${JSON.stringify(srData)}`);
    }

    await supabase
      .from("customer_orders")
      .update({
        shiprocket_order_id: String(srData.order_id || ""),
        shiprocket_shipment_id: String(srData.shipment_id || ""),
      })
      .eq("id", order_id);

    console.log("Order synced successfully:", srData.order_id);
    return respond({ ok: true, shiprocket: srData });
  } catch (err) {
    console.error("shiprocket error:", err);
    return respond({ ok: false, error: String(err) }, 500);
  }
});
