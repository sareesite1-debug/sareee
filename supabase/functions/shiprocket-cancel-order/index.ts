// Cancel a customer order in Shiprocket (mirrors local cancel/delete)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SR_EMAIL = Deno.env.get("SHIPROCKET_EMAIL");
const SR_PASSWORD = Deno.env.get("SHIPROCKET_PASSWORD");

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
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    if (!SR_EMAIL || !SR_PASSWORD) {
      return respond({ ok: true, skipped: true, reason: "Shiprocket credentials not configured" });
    }

    const { order_id, shiprocket_order_id } = await req.json();
    if (!order_id && !shiprocket_order_id) throw new Error("order_id or shiprocket_order_id required");

    let srId = shiprocket_order_id ? String(shiprocket_order_id) : "";

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    if (!srId && order_id) {
      const { data: order } = await supabase
        .from("customer_orders")
        .select("shiprocket_order_id")
        .eq("id", order_id)
        .maybeSingle();
      srId = order?.shiprocket_order_id ? String(order.shiprocket_order_id) : "";
    }

    if (!srId) {
      console.log("No shiprocket_order_id — order was never synced. Nothing to cancel.");
      return respond({ ok: true, skipped: true, reason: "Not synced to Shiprocket" });
    }

    const token = await getToken();
    const srRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids: [Number(srId)] }),
    });
    const srData = await srRes.json();
    console.log("Shiprocket cancel response:", srRes.status, JSON.stringify(srData));

    if (!srRes.ok) {
      const msg = JSON.stringify(srData).toLowerCase();
      // Treat already-cancelled or not-found as success so local delete can proceed
      if (msg.includes("already") || msg.includes("not found") || msg.includes("cancelled")) {
        return respond({ ok: true, already: true, shiprocket: srData });
      }
      throw new Error(`Shiprocket cancel failed: ${JSON.stringify(srData)}`);
    }

    return respond({ ok: true, shiprocket: srData });
  } catch (err) {
    console.error("shiprocket-cancel error:", err);
    return respond({ ok: false, error: String(err) }, 500);
  }
});
