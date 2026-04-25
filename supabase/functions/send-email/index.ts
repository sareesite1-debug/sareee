// Send order-related emails to customer + owner via Brevo API
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")!;
const FROM_EMAIL = "sareesite1@gmail.com";
const FROM_NAME = "Arpita Saree Center";
const OWNER_EMAIL = "sareesite1@gmail.com";

// SUPABASE_URL is auto-injected, SERVICE_ROLE_KEY set manually in secrets
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;

interface Body { type: "order_received" | "order_delivered" | "order_cancelled"; order_id: string; }

const subjects: Record<string, string> = {
  order_received: "Your Arpita Saree Center order has been received",
  order_delivered: "Your Arpita Saree Center order has been delivered",
  order_cancelled: "Your Arpita Saree Center order has been cancelled",
};

const ownerSubjects: Record<string, string> = {
  order_received: "New order received",
  order_delivered: "Order marked delivered",
  order_cancelled: "Order cancelled",
};

const renderEmail = (heading: string, intro: string, order: any, items: any[]) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;color:#1a1a1a">
  <h1 style="color:#7a1e1e;font-size:22px;margin:0 0 8px">${heading}</h1>
  <p style="color:#555;font-size:14px;margin:0 0 20px">${intro}</p>
  <div style="background:#faf6f0;padding:16px;border-radius:6px;margin-bottom:16px">
    <p style="margin:0 0 4px"><strong>Order:</strong> ${order.order_number}</p>
    <p style="margin:0 0 4px"><strong>Customer:</strong> ${order.customer_name}</p>
    <p style="margin:0 0 4px"><strong>Phone:</strong> ${order.customer_phone || "-"}</p>
    <p style="margin:0"><strong>Address:</strong> ${order.shipping_address || "-"}</p>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
    <thead><tr style="background:#f3f3f3">
      <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd">Item</th>
      <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd">Qty</th>
      <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd">Price</th>
    </tr></thead>
    <tbody>${items.map(i => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${i.product_name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${Number(i.subtotal).toLocaleString()}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  <p style="text-align:right;font-size:16px;color:#7a1e1e"><strong>Total: ₹${Number(order.total).toLocaleString()}</strong></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="color:#888;font-size:12px;text-align:center">Arpita Saree Center<br/>#LIG 63, 6th Cross, Gangotri Layout, Mysore - 570009<br/>Phone: 9611225226 · sareesite1@gmail.com</p>
</div>`;

async function sendEmail(to: string, toName: string, subject: string, html: string) {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not set in Supabase secrets");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Brevo API error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!SERVICE_KEY) throw new Error("SERVICE_ROLE_KEY not set in Supabase secrets");

    const { type, order_id }: Body = await req.json();
    if (!type || !order_id) throw new Error("type and order_id required");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: order, error: oErr } = await supabase
      .from("customer_orders")
      .select("*")
      .eq("id", order_id)
      .single();
    if (oErr || !order) throw new Error(`Order not found: ${oErr?.message}`);

    const { data: items } = await supabase
      .from("customer_order_items")
      .select("*")
      .eq("order_id", order_id);

    const intros: Record<string, string> = {
      order_received: "Thank you for shopping with us! We've received your order and will confirm shortly.",
      order_delivered: "Your order has been delivered. We hope you love it!",
      order_cancelled: "Your order has been cancelled. If this was unexpected, please contact us.",
    };

    const customerHtml = renderEmail(subjects[type], intros[type], order, items || []);
    const ownerHtml = renderEmail(ownerSubjects[type], `Order ${type.replaceAll("_", " ")} for ${order.customer_name}.`, order, items || []);

    const results: any = {};

    if (order.customer_email) {
      try {
        results.customer = await sendEmail(order.customer_email, order.customer_name, subjects[type], customerHtml);
      } catch (e) {
        results.customer_error = String(e);
      }
    } else {
      results.customer_skipped = "No customer_email on order";
    }

    try {
      results.owner = await sendEmail(OWNER_EMAIL, FROM_NAME, ownerSubjects[type], ownerHtml);
    } catch (e) {
      results.owner_error = String(e);
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
