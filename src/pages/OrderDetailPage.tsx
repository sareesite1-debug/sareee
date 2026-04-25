import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Package, Truck, Home, ArrowLeft, XCircle, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const trackingSteps = [
  { key: "order_placed", label: "Placed", icon: Check },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

interface Order { id: string; order_number: string; total: number; status: string; tracking_status: string; created_at: string; customer_name: string; customer_phone: string; shipping_address: string; notes: string; state: string; payment_method: string; }
interface Item { id: string; product_name: string; unit_price: number; quantity: number; subtotal: number; product_id: string; }

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [o, it] = await Promise.all([
        (supabase.from("customer_orders") as any).select("*").eq("id", id).maybeSingle(),
        (supabase.from("customer_order_items") as any).select("*").eq("order_id", id),
      ]);
      setOrder(o.data); setItems(it.data || []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-32 text-center font-body text-ink-soft">Loading...</div>;
  if (!order) return <div className="container mx-auto px-4 py-32 text-center font-body"><p className="text-ink-soft mb-4">Order not found.</p><Link to="/orders" className="text-emerald link-reveal text-[11px] tracking-[0.25em] uppercase">Back to orders</Link></div>;

  const activeIdx = trackingSteps.findIndex(s => s.key === order.tracking_status);
  const canCancel = order.status !== "cancelled" && order.tracking_status !== "delivered" && order.tracking_status !== "cancelled";
  
  const total = Number(order.total) || 0;
  const subtotal = Math.round((total / 1.05) * 100) / 100;
  const gst = Math.round((total - subtotal) * 100) / 100;
  const isKa = (order.state || "").trim().toLowerCase() === "karnataka";

  const cancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    const { error } = await (supabase.from("customer_orders") as any).update({ status: "cancelled", tracking_status: "cancelled" }).eq("id", order.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Order cancelled successfully.");
    setOrder({ ...order, status: "cancelled", tracking_status: "cancelled" });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "order_cancelled", order_id: order.id }),
      });
    } catch {}
  };

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  return (
    <div className="bg-ivory min-h-screen">
      <div className="container mx-auto px-6 pt-36 pb-24 max-w-5xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <Link to="/orders" className="inline-flex items-center gap-2 text-[10px] text-ink-soft hover:text-emerald font-body uppercase tracking-[0.25em] link-reveal transition-colors">
            <ArrowLeft size={13} /> All Orders
          </Link>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-6 border-b border-gold/15">
            <div>
              <p className="eyebrow text-gold-dark mb-2">Order Summary</p>
              <h1 className="text-display text-4xl md:text-5xl text-ink">{order.order_number}</h1>
              <p className="text-sm text-ink-soft font-body mt-2">Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`text-[10px] px-4 py-2 font-body uppercase tracking-[0.25em] border ${
                order.status === "cancelled" ? "bg-rose-600/10 text-rose-600 border-rose-600/20" :
                order.status === "paid" || order.status === "completed" ? "bg-emerald/10 text-emerald border-emerald/20" :
                "bg-gold/10 text-gold-dark border-gold/20"
              }`}>{order.status}</span>
              {canCancel && (
                <button onClick={cancelOrder} className="inline-flex items-center gap-2 text-[10px] text-ink-soft hover:text-rose-600 transition-colors font-body uppercase tracking-[0.2em]">
                  <XCircle size={12} /> Cancel Order
                </button>
              )}
            </div>
          </motion.div>

          {/* Tracking Timeline */}
          <motion.div variants={itemVariants} className="glass-card p-8 md:p-12 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />
            <p className="eyebrow text-gold-dark mb-8 relative z-10">Journey of your weave</p>
            
            <div className="relative z-10">
              {/* Progress Line */}
              <div className="absolute top-6 left-[10%] right-[10%] h-px bg-gold/20" />
              <motion.div 
                className="absolute top-6 left-[10%] h-[2px] bg-emerald-deep"
                initial={{ width: 0 }}
                animate={{ width: activeIdx >= 0 ? `${(activeIdx / (trackingSteps.length - 1)) * 80}%` : "0%" }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />

              <div className="flex justify-between relative">
                {trackingSteps.map((s, i) => {
                  const done = i <= activeIdx;
                  const current = i === activeIdx;
                  const cancelled = order.status === "cancelled";
                  
                  return (
                    <div key={s.key} className="flex flex-col items-center w-1/5 relative">
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-500 z-10 border-4 border-ivory ${
                          cancelled ? "bg-ivory-deep text-ink-soft/30 border-ivory/50" :
                          done ? "bg-emerald-deep text-ivory shadow-[0_0_15px_hsl(var(--emerald-deep)/0.3)]" : "bg-ivory-deep text-ink-soft/40"
                        }`}
                      >
                        <s.icon size={16} strokeWidth={done && !cancelled ? 2.5 : 1.5} />
                      </motion.div>
                      <p className={`text-[9px] font-body uppercase tracking-[0.2em] text-center ${
                        cancelled ? "text-ink-soft/40" :
                        current ? "text-emerald-deep font-semibold" : done ? "text-ink" : "text-ink-soft/50"
                      }`}>{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            {order.status === "cancelled" && (
              <div className="absolute inset-0 bg-ivory/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                <div className="bg-white px-6 py-3 border border-rose-600/20 shadow-xl">
                  <p className="font-display text-[10px] uppercase tracking-widest text-rose-600">Order Cancelled</p>
                </div>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Shipping Info */}
            <motion.div variants={itemVariants} className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={16} className="text-gold" />
                <p className="eyebrow text-gold-dark">Shipping To</p>
              </div>
              <p className="font-heading text-xl text-ink mb-1">{order.customer_name}</p>
              <p className="text-sm text-ink-soft font-body mb-4">{order.customer_phone}</p>
              <p className="text-sm text-ink-soft font-body whitespace-pre-line leading-relaxed">{order.shipping_address}</p>
              {order.state && <p className="text-[10px] text-ink font-body mt-3 uppercase tracking-widest bg-gold/10 inline-block px-3 py-1">{order.state}</p>}
            </motion.div>

            {/* Payment Summary */}
            <motion.div variants={itemVariants} className="glass-card p-8 bg-ivory/80">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard size={16} className="text-gold" />
                <p className="eyebrow text-gold-dark">Payment Details</p>
              </div>
              <div className="space-y-3 text-sm font-body mb-6">
                <div className="flex justify-between text-ink-soft"><span>Subtotal (excl. tax)</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-ink-soft text-xs"><span>{isKa ? "CGST + SGST" : "IGST"} 5%</span><span>₹{gst.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-ink-soft mt-2 pt-2 border-t border-gold/10"><span>Shipping</span><span className="text-emerald">Complimentary</span></div>
              </div>
              <div className="flex justify-between items-baseline mb-4 pt-4 border-t border-gold/20">
                <span className="font-heading text-xl text-ink">Total</span>
                <span className="font-heading text-3xl text-emerald-deep">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[10px] text-ink-soft uppercase tracking-widest font-body text-right">
                Method: {order.payment_method === "online" ? "Online Payment" : "Cash on Delivery"}
              </p>
            </motion.div>
          </div>

          {/* Items Table */}
          <motion.div variants={itemVariants} className="glass-card overflow-hidden">
            <div className="p-6 border-b border-gold/15 bg-ivory-deep/30">
              <p className="eyebrow text-gold-dark">Order Contents</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {["Item", "Quantity", "Unit Price", "Subtotal"].map(h => (
                      <th key={h} className="px-6 py-4 text-[9px] font-body uppercase tracking-[0.2em] text-ink-soft font-normal border-b border-gold/10">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <motion.tr 
                      key={it.id} 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                      className="border-b border-gold/5 last:border-0 hover:bg-ivory-deep/20 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <Link to={`/shop`} className="font-heading text-lg text-ink hover:text-emerald transition-colors">{it.product_name}</Link>
                        <p className="text-[10px] text-ink-soft font-body uppercase tracking-widest mt-1">Handwoven</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-body text-ink-soft">{it.quantity}</td>
                      <td className="px-6 py-5 text-sm font-body text-ink-soft">₹{Number(it.unit_price).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-5 text-base font-body text-ink">₹{Number(it.subtotal).toLocaleString("en-IN")}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
