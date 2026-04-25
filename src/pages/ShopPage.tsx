import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

interface Category { id: string; name: string; slug: string; sort_order: number; }
interface Product { id: string; category_id: string | null; name: string; slug: string; description: string | null; price: number; compare_at_price: number | null; image_url: string | null; stock: number | null; status: string; }

const FilterPill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="relative font-display text-[8px] tracking-[0.3em] uppercase px-5 py-2.5 transition-all duration-300"
  >
    {active && (
      <motion.div layoutId="filter-active" className="absolute inset-0 bg-emerald-deep border border-emerald-deep" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
    )}
    <span className={`relative z-10 ${active ? "text-ivory" : "text-ink border border-gold/25 hover:border-gold hover:text-emerald"}`}>
      {children}
    </span>
    {!active && <div className="absolute inset-0 border border-gold/25" />}
  </motion.button>
);

const ProductCard = ({ product, index, addToCart }: { product: Product; index: number; addToCart: (id: string) => void }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.05 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group card-3d"
    >
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="relative overflow-hidden aspect-[3/4] mb-5 bg-ivory-deep border border-gold/10">
          {product.image_url ? (
            <>
              <motion.img src={product.image_url} alt={product.name} className="w-full h-full object-cover" animate={{ scale: hovered ? 1.08 : 1 }} transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }} loading="lazy" />
              <motion.div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 via-emerald-deep/20 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4 }} />
              <motion.button
                className="absolute bottom-4 left-4 right-4 glass-card-dark text-gold font-display text-[8px] tracking-[0.3em] uppercase py-3 flex items-center justify-center gap-2 border-gold/20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: hovered ? 0 : 20, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.4, type: "spring" }}
                onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
              >
                <ShoppingBag size={11} strokeWidth={1.5} /> Quick Add
              </motion.button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs font-body uppercase tracking-widest"><Sparkles size={20} className="text-gold/30" strokeWidth={1} /></div>
          )}
          {product.compare_at_price && product.compare_at_price > product.price && (
            <div className="absolute top-3 left-3 bg-rose-600 text-ivory font-display text-[7px] tracking-[0.2em] uppercase px-2 py-1 shadow-md">Sale</div>
          )}
        </div>
        <div style={{ transform: "translateZ(20px)" }}>
          <h3 className="font-heading text-xl text-ink group-hover:text-emerald transition-colors duration-300 leading-tight mb-1.5">{product.name}</h3>
          <div className="flex items-center gap-3">
            <p className="font-body text-sm text-gold-dark">₹{Number(product.price).toLocaleString("en-IN")}</p>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <p className="font-body text-sm text-ink-soft line-through">₹{Number(product.compare_at_price).toLocaleString("en-IN")}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ShopPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        (supabase.from("categories") as any).select("*").order("sort_order"),
        (supabase.from("products") as any).select("*").eq("status", "active").order("created_at", { ascending: false }),
      ]);
      setCategories(c.data || []);
      setProducts(p.data || []);
      setLoading(false);
    })();
  }, []);

  const visible = active === "all" ? products : products.filter(p => p.category_id === active);

  return (
    <div className="bg-ivory min-h-screen">
      <section className="relative bg-emerald-deep text-ivory pt-40 pb-28 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-80 h-80 bg-gold/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

        <div className="container mx-auto px-6 lg:px-10 relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex items-center gap-3 mb-7">
            <div className="w-8 h-px bg-gold" />
            <span className="eyebrow text-gold">The Boutique</span>
          </motion.div>

          <h1 className="text-display text-[clamp(3rem,6vw,5.5rem)] text-ivory max-w-3xl mb-7 leading-[1.0]">
            <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>Every weave,</motion.span></span>
            <span className="block overflow-hidden"><motion.span className="block italic text-gold/90" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}>an inheritance.</motion.span></span>
          </h1>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.6, ease: [0.76, 0, 0.24, 1] }} className="w-24 h-px bg-gradient-to-r from-gold to-transparent mb-7 origin-left" />

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="text-ivory/60 max-w-xl text-base font-body font-light leading-relaxed">
            Browse the full edit — from breathable everyday handlooms to bridal Banarasis curated piece by piece.
          </motion.p>
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex flex-wrap items-center justify-between gap-4 mb-14 pb-7 border-b border-gold/15">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={active === "all"} onClick={() => setActive("all")}>All pieces</FilterPill>
            {categories.map(c => <FilterPill key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>{c.name}</FilterPill>)}
          </div>
          <motion.p layout className="font-display text-[8px] text-ink-soft uppercase tracking-[0.3em]">{visible.length} {visible.length === 1 ? "piece" : "pieces"}</motion.p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-14">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-ivory-deep mb-5" />
                <div className="h-5 bg-ivory-deep mb-2 w-2/3 rounded" />
                <div className="h-3 bg-ivory-deep w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border border-dashed border-gold/25 py-32 text-center glass-card">
            <Sparkles size={28} className="text-gold mx-auto mb-4" strokeWidth={1.2} />
            <p className="font-heading text-3xl text-ink mb-2">Nothing here yet</p>
            <p className="text-sm text-ink-soft font-body">New pieces will appear as we add them.</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-16">
            <AnimatePresence mode="popLayout">
              {visible.map((p, i) => <ProductCard key={p.id} product={p} index={i} addToCart={addToCart} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <section className="bg-ivory-deep border-t border-gold/15 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-[80px]" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="eyebrow text-gold-dark mb-4">Looking for something special?</p>
          <h2 className="font-heading text-4xl text-ink mb-8">Let us help you find the perfect saree.</h2>
          <Link to="/contact" className="btn-liquid border border-emerald text-emerald px-8 py-4 font-display text-[9px] tracking-[0.3em] uppercase hover:text-ivory transition-colors duration-500 inline-flex items-center gap-2 group">
            Book a consultation <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
