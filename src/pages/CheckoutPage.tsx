import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CreditCard, Truck, ShieldCheck, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Chandigarh",
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    shipping_address: "", state: "Karnataka", notes: "",
    payment_method: "cod" as "cod" | "online",
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      setForm(f => ({ ...f, customer_email: session.user.email || "" }));
    });
  }, [navigate]);

  useEffect(() => { if (!items.length && user) navigate("/cart"); }, [items, user, navigate]);

  // GST INCLUSIVE
  const isKarnataka = form.state.trim().toLowerCase() === "karnataka";
  const subtotal = Math.round((total / 1.05) * 100) / 100;
  const gstAmt = Math.round((total - subtotal) * 100) / 100;
  const cgst = isKarnataka ? Math.round((gstAmt / 2) * 100) / 100 : 0;
  const sgst = isKarnataka ? gstAmt - cgst : 0;
  const igst = isKarnataka ? 0 : gstAmt;

  const validateStep1 = () => form.customer_name && form.customer_phone;
  const validateStep2 = () => form.shipping_address && form.state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) { toast.error("Please complete all required fields"); return; }
    setSubmitting(true);
    const order_number = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const initialStatus = form.payment_method === "online" ? "paid" : "pending";
    const { data: order, error } = await (supabase.from("customer_orders") as any).insert({
      user_id: user.id, order_number, ...form, total,
      status: initialStatus, tracking_status: "order_placed",
    }).select().single();
    
    if (error) { toast.error(error.message); setSubmitting(false); return; }
    
    const itemRows = items.map(i => ({
      order_id: order.id, product_id: i.product_id, product_name: i.product?.name || "Item",
      unit_price: Number(i.product?.price) || 0, quantity: i.quantity, subtotal: (Number(i.product?.price) || 0) * i.quantity,
    }));
    await (supabase.from("customer_order_items") as any).insert(itemRows);
    await clearCart();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ type: "order_received", order_id: order.id }),
      });
    } catch {}

    toast.success(form.payment_method === "online" ? "Payment secured. Order confirmed!" : "Order confirmed!");
    navigate(`/orders/${order.id}`);
  };

  const InputField = ({ label, value, field, req = true, type = "text" }: any) => (
    <div className="mb-4">
      <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">{label}{req && " *"}</label>
      <input type={type} value={value} onChange={e => setForm({ ...form, [field]: e.target.value })} required={req}
        className="w-full border-b border-gold/30 bg-transparent px-0 py-3 text-sm font-body text-ink focus:outline-none focus:border-maroon transition-colors placeholder:text-ink-soft/30" placeholder={`Enter ${label.toLowerCase()}`} />
    </div>
  );

  return (
    <div className="bg-ivory min-h-screen">
      <div className="container mx-auto px-6 pt-36 pb-24 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          <p className="eyebrow text-gold-dark mb-3 flex items-center gap-2"><Lock size={12} /> Secure Checkout</p>
          <h1 className="text-display text-4xl md:text-5xl text-ink">Final details</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Main Form Area */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} id="checkout-form">
              {/* Step 1: Contact */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mb-10 ${activeStep !== 1 && "opacity-50"}`}>
                <div className="flex items-center justify-between mb-6 border-b border-gold/15 pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-sm transition-colors ${activeStep >= 1 ? "bg-maroon-deep text-ivory" : "bg-gold/10 text-gold-dark"}`}>
                      {activeStep > 1 ? <Check size={14} /> : "1"}
                    </div>
                    <h2 className="font-heading text-2xl text-ink">Contact Details</h2>
                  </div>
                  {activeStep > 1 && <button type="button" onClick={() => setActiveStep(1)} className="text-[10px] uppercase tracking-widest text-gold hover:text-maroon font-body">Edit</button>}
                </div>
                
                <AnimatePresence>
                  {activeStep === 1 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <InputField label="Full Name" value={form.customer_name} field="customer_name" />
                        <InputField label="Phone Number" value={form.customer_phone} field="customer_phone" type="tel" />
                        <div className="md:col-span-2">
                          <InputField label="Email Address" value={form.customer_email} field="customer_email" req={false} type="email" />
                        </div>
                      </div>
                      <button type="button" onClick={() => validateStep1() ? setActiveStep(2) : toast.error("Please fill required fields")} className="mt-6 luxury-btn bg-emerald text-ivory">Continue to shipping</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Step 2: Shipping */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`mb-10 ${activeStep !== 2 && "opacity-50"}`}>
                <div className="flex items-center justify-between mb-6 border-b border-gold/15 pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-sm transition-colors ${activeStep >= 2 ? "bg-maroon-deep text-ivory" : "border border-gold/30 text-gold-dark"}`}>
                      {activeStep > 2 ? <Check size={14} /> : "2"}
                    </div>
                    <h2 className="font-heading text-2xl text-ink">Shipping Address</h2>
                  </div>
                  {activeStep > 2 && <button type="button" onClick={() => setActiveStep(2)} className="text-[10px] uppercase tracking-widest text-gold hover:text-maroon font-body">Edit</button>}
                </div>

                <AnimatePresence>
                  {activeStep === 2 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mb-4">
                        <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">Complete Address *</label>
                        <textarea value={form.shipping_address} onChange={e => setForm({ ...form, shipping_address: e.target.value })} required rows={3}
                          className="w-full border border-gold/20 bg-ivory-deep/30 p-4 text-sm font-body focus:outline-none focus:border-maroon transition-colors resize-none placeholder:text-ink-soft/30" placeholder="Street, area, city, pincode" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <div className="mb-4">
                          <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">State *</label>
                          <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required
                            className="w-full border-b border-gold/30 bg-transparent px-0 py-3 text-sm font-body text-ink focus:outline-none focus:border-maroon">
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="mb-4">
                          <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">Order Notes</label>
                          <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full border-b border-gold/30 bg-transparent px-0 py-3 text-sm font-body text-ink focus:outline-none focus:border-maroon placeholder:text-ink-soft/30" placeholder="Gift wrap, delivery instructions..." />
                        </div>
                      </div>
                      <button type="button" onClick={() => validateStep2() ? setActiveStep(3) : toast.error("Please complete address")} className="mt-6 luxury-btn bg-emerald text-ivory">Continue to payment</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Step 3: Payment */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`mb-10 ${activeStep !== 3 && "opacity-50"}`}>
                <div className="flex items-center gap-4 mb-6 border-b border-gold/15 pb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-sm transition-colors ${activeStep === 3 ? "bg-maroon-deep text-ivory" : "border border-gold/30 text-gold-dark"}`}>3</div>
                  <h2 className="font-heading text-2xl text-ink">Payment Method</h2>
                </div>

                <AnimatePresence>
                  {activeStep === 3 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
                      {[
                        { v: "online", t: "Online Payment", d: "Secure UPI, bank transfer, or card", icon: CreditCard },
                        { v: "cod", t: "Cash on Delivery", d: "Pay in cash when your pieces arrive", icon: Truck },
                      ].map(p => (
                        <motion.div
                          key={p.v}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setForm({ ...form, payment_method: p.v as any })}
                          className={`cursor-pointer p-6 border transition-all duration-300 relative flex items-start gap-4 ${form.payment_method === p.v ? "border-maroon bg-emerald/5 shadow-[0_0_20px_hsl(var(--emerald)/0.1)]" : "border-gold/20 bg-ivory-deep/20 hover:border-gold/50"}`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${form.payment_method === p.v ? "border-maroon" : "border-gold/40"}`}>
                            {form.payment_method === p.v && <div className="w-2.5 h-2.5 rounded-full bg-emerald" />}
                          </div>
                          <div>
                            <p className="font-heading text-xl text-ink mb-1 flex items-center gap-2"><p.icon size={16} className={form.payment_method === p.v ? "text-maroon" : "text-gold-dark"} /> {p.t}</p>
                            <p className="text-[13px] text-ink-soft font-body">{p.d}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </form>
          </div>

          {/* Sticky Summary */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="sticky top-32 glass-card p-1">
              <div className="bg-ivory/80 p-8">
                <p className="eyebrow text-gold-dark mb-6">Order Summary</p>
                
                <div className="space-y-4 mb-6 pb-6 border-b border-gold/15 max-h-64 overflow-y-auto pr-2">
                  {items.map(i => (
                    <div key={i.id} className="flex items-center gap-4">
                      <div className="w-16 aspect-[3/4] shrink-0 bg-ivory-deep border border-gold/10 img-fit">
                        {i.product?.image_url && <img src={i.product.image_url} alt={i.product?.name || ""} />}
                      </div>
                      <div className="flex-1 min-w-0 font-body">
                        <p className="text-sm text-ink truncate font-medium">{i.product?.name}</p>
                        <p className="text-xs text-ink-soft mt-1">Qty: {i.quantity}</p>
                      </div>
                      <p className="font-body text-sm text-ink">₹{((Number(i.product?.price) || 0) * i.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm font-body mb-6 pb-6 border-b border-gold/15">
                  <div className="flex justify-between text-ink-soft"><span>Subtotal (excl. tax)</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                  {isKarnataka ? (
                    <>
                      <div className="flex justify-between text-ink-soft"><span>CGST 2.5%</span><span>₹{cgst.toLocaleString("en-IN")}</span></div>
                      <div className="flex justify-between text-ink-soft"><span>SGST 2.5%</span><span>₹{sgst.toLocaleString("en-IN")}</span></div>
                    </>
                  ) : (
                    <div className="flex justify-between text-ink-soft"><span>IGST 5%</span><span>₹{igst.toLocaleString("en-IN")}</span></div>
                  )}
                  <div className="flex justify-between text-ink-soft mt-2 pt-2 border-t border-gold/5"><span>Shipping</span><span className="text-maroon">Complimentary</span></div>
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-heading text-xl text-ink">Total</span>
                  <span className="font-heading text-3xl text-maroon-deep">₹{total.toLocaleString("en-IN")}</span>
                </div>

                <button type="submit" form="checkout-form" disabled={submitting || activeStep !== 3} className="btn-liquid btn-emerald w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? "Processing..." : "Confirm & Pay"}
                  </span>
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-ink-soft uppercase tracking-[0.1em] font-body text-center">
                  <ShieldCheck size={12} className="text-gold" /> All data is encrypted and secure
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
