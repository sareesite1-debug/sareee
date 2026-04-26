import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, total, loading, updateQuantity, removeFromCart } = useCart();

  if (loading) return <div className="container mx-auto px-6 py-32 font-body text-ink-soft">Loading...</div>;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="container mx-auto px-6 pt-36 pb-24 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="reveal-safe">
          <p className="eyebrow text-gold-dark mb-3">Your Selection</p>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10 pb-6 border-b border-gold/15">
            <h1 className="text-display text-4xl md:text-5xl text-ink">Shopping Bag</h1>
            <p className="font-display text-[10px] text-ink-soft uppercase tracking-[0.3em]">{items.length} {items.length === 1 ? "piece" : "pieces"}</p>
          </div>
        </motion.div>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 glass-card border border-dashed border-gold/30">
            <ShoppingBag size={32} className="mx-auto text-gold mb-6" strokeWidth={1} />
            <p className="font-heading text-3xl text-ink mb-3">Your bag is empty</p>
            <p className="text-sm text-ink-soft font-body mb-8">Discover our curated collection of handwoven silks.</p>
            <Link to="/shop" className="btn-liquid border border-maroon text-maroon px-8 py-3 font-display text-[9px] tracking-[0.3em] uppercase hover:text-ivory transition-colors">
              Explore pieces
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-8">
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                    className="flex gap-6 p-4 bg-ivory-deep/30 border border-gold/10 group hover:border-gold/30 transition-colors"
                  >
                    <Link to={`/shop/${item.product?.slug}`} className="w-24 md:w-32 aspect-[3/4] shrink-0 bg-ivory overflow-hidden block">
                      {item.product?.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-ivory border border-gold/10"><ShoppingBag size={16} className="text-gold/30" /></div>
                      )}
                    </Link>
                    <div className="flex-1 flex flex-col min-w-0 py-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link to={`/shop/${item.product?.slug}`} className="font-heading text-xl text-ink hover:text-maroon transition-colors leading-tight line-clamp-2">
                            {item.product?.name}
                          </Link>
                          <p className="text-xs text-ink-soft font-body mt-2">Handwoven</p>
                        </div>
                        <p className="font-heading text-lg text-maroon-deep whitespace-nowrap">₹{Number(item.product?.price || 0).toLocaleString("en-IN")}</p>
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="inline-flex items-center border border-gold/20 bg-ivory">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 hover:bg-gold/10 transition-colors text-ink text-lg">−</button>
                          <span className="w-10 text-center font-body text-sm text-ink">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 hover:bg-gold/10 transition-colors text-ink text-lg">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-[9px] uppercase tracking-[0.2em] font-body text-rose hover:text-rose-600 inline-flex items-center gap-1.5 transition-colors">
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
              <div className="glass-card p-8 sticky top-32">
                <p className="eyebrow text-gold-dark mb-6">Order Summary</p>
                
                <div className="space-y-4 text-sm font-body mb-6 pb-6 border-b border-gold/15">
                  <div className="flex justify-between text-ink-soft">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>Shipping</span>
                    <span className="text-maroon">Complimentary</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-heading text-xl text-ink">Total</span>
                  <span className="font-heading text-3xl text-maroon-deep">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[10px] text-ink-soft uppercase tracking-widest font-body mb-8 text-center">Taxes included</p>

                <button onClick={() => navigate("/checkout")} className="btn-liquid btn-emerald w-full py-4 mb-4 border border-maroon-deep">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Secure Checkout <ArrowRight size={14} />
                  </span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-ink-soft uppercase tracking-[0.1em] font-body">
                  <ShieldCheck size={12} className="text-gold" /> Encrypted & secure payment
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
