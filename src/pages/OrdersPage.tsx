import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, ArrowRight, Clock, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Order { id: string; order_number: string; total: number; status: string; tracking_status: string; created_at: string; }

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data } = await (supabase.from("customer_orders") as any).select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [navigate]);

  return (
    <div className="bg-ivory min-h-screen">
      <div className="container mx-auto px-6 pt-36 pb-24 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12 border-b border-gold/15 pb-6">
          <p className="eyebrow text-gold-dark mb-3">Account</p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="text-display text-4xl md:text-5xl text-ink">My Orders</h1>
            {!loading && <p className="font-display text-[10px] text-ink-soft uppercase tracking-[0.3em]">{orders.length} {orders.length === 1 ? "order" : "orders"}</p>}
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-ivory-deep/50 animate-pulse border border-gold/10" />)}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 glass-card border border-dashed border-gold/30">
            <Box size={32} className="mx-auto text-gold mb-6" strokeWidth={1} />
            <p className="font-heading text-3xl text-ink mb-3">No orders yet</p>
            <p className="text-sm text-ink-soft font-body mb-8">When you purchase a saree, it will appear here.</p>
            <Link to="/shop" className="btn-liquid border border-emerald text-emerald px-8 py-3 font-display text-[9px] tracking-[0.3em] uppercase hover:text-ivory transition-colors">
              Explore pieces
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((o, i) => (
                <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}>
                  <Link to={`/orders/${o.id}`} className="block border border-gold/15 bg-ivory-deep/20 p-6 md:p-8 group hover:bg-ivory hover:border-gold/40 hover:shadow-[0_10px_40px_-15px_hsl(var(--emerald-deep)/0.1)] transition-all duration-300 card-3d">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ transform: "translateZ(20px)" }}>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0 bg-ivory group-hover:bg-gold/10 transition-colors">
                          <Package size={16} className="text-gold-dark" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-heading text-xl text-ink group-hover:text-emerald transition-colors">{o.order_number}</p>
                          <p className="text-xs text-ink-soft font-body mt-1 flex items-center gap-1"><Clock size={10} /> {new Date(o.created_at).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 justify-between md:justify-end border-t border-gold/10 md:border-0 pt-4 md:pt-0">
                        <div className="text-left md:text-right">
                          <span className={`inline-block text-[9px] px-3 py-1.5 font-body uppercase tracking-[0.25em] mb-1 ${
                            o.status === "cancelled" ? "bg-rose-600/10 text-rose-600 border border-rose-600/20" :
                            o.tracking_status === "delivered" ? "bg-emerald/10 text-emerald border border-emerald/20" :
                            "bg-gold/10 text-gold-dark border border-gold/20"
                          }`}>
                            {o.tracking_status.replace(/_/g, " ")}
                          </span>
                          <p className="font-heading text-lg text-ink">₹{Number(o.total).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:bg-emerald group-hover:border-emerald group-hover:text-ivory text-ink-soft transition-colors">
                          <ArrowRight size={12} />
                        </div>
                      </div>

                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
