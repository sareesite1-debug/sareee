import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

interface Category { id: string; name: string; slug: string; description: string | null; image_url: string | null; sort_order: number; }
interface Product { id: string; name: string; slug: string; price: number; compare_at_price: number | null; image_url: string | null; stock: number | null; status: string; }

const Magnetic3DCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 20 });
  const y = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateX.set(-dy * 10);
    rotateY.set(dx * 10);
    x.set(dx * 5);
    y.set(dy * 5);
  };

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); rotateX.set(0); rotateY.set(0); }}
      style={{ x, y, rotateX, rotateY, transformStyle: "preserve-3d" }} className={`card-3d ${className}`}>
      {children}
    </motion.div>
  );
};

const ProductCard = ({ product, index, addToCart }: { product: Product; index: number; addToCart: (id: string) => void }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.05 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className="group card-3d">
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="relative overflow-hidden aspect-[3/4] mb-5 bg-ivory-deep border border-gold/10">
          {product.image_url ? (
            <>
              <motion.img src={product.image_url} alt={product.name} className="w-full h-full object-cover" animate={{ scale: hovered ? 1.08 : 1 }} transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }} loading="lazy" />
              <motion.div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 via-emerald-deep/20 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4 }} />
              <motion.button className="absolute bottom-4 left-4 right-4 glass-card-dark text-gold font-display text-[8px] tracking-[0.3em] uppercase py-3 flex items-center justify-center gap-2 border-gold/20"
                initial={{ y: 20, opacity: 0 }} animate={{ y: hovered ? 0 : 20, opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4, type: "spring" }} onClick={(e) => { e.preventDefault(); addToCart(product.id); }}>
                <ShoppingBag size={11} strokeWidth={1.5} /> Quick Add
              </motion.button>
            </>
          ) : <div className="w-full h-full flex items-center justify-center"><Sparkles size={20} className="text-gold/30" /></div>}
        </div>
        <div style={{ transform: "translateZ(20px)" }}>
          <h3 className="font-heading text-xl text-ink group-hover:text-emerald transition-colors duration-300 mb-1.5">{product.name}</h3>
          <p className="font-body text-sm text-gold-dark">₹{Number(product.price).toLocaleString("en-IN")}</p>
        </div>
      </Link>
    </motion.div>
  );
};

const CategoriesPage = () => {
  const { slug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: cats } = await (supabase.from("categories") as any).select("*").order("sort_order");
      setCategories(cats || []);
      if (slug && cats) {
        const active = cats.find((c: Category) => c.slug === slug);
        setActiveCategory(active || null);
        if (active) {
          const { data: prods } = await (supabase.from("products") as any).select("*").eq("category_id", active.id).eq("status", "active").order("created_at", { ascending: false });
          setProducts(prods || []);
        }
      } else {
        setActiveCategory(null);
        setProducts([]);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (!slug) {
    return (
      <div className="bg-ivory min-h-screen">
        <section ref={heroRef} className="relative bg-emerald-deep text-ivory pt-40 pb-28 overflow-hidden perspective-1000">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <motion.div style={{ y, opacity }} className="container mx-auto px-6 lg:px-10 relative z-10 text-center max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex justify-center items-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold" /><span className="eyebrow text-gold">The Collections</span><div className="w-8 h-px bg-gold" />
            </motion.div>
            <h1 className="text-display text-5xl md:text-6xl text-ivory mb-6 leading-tight">
              <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>Signatures of</motion.span></span>
              <span className="block overflow-hidden"><motion.span className="block italic text-gold/90" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>the house.</motion.span></span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }} className="text-ivory/60 text-lg font-body font-light">Explore our curated collections, each a testament to India's varied weaving heritage.</motion.p>
          </motion.div>
        </section>

        <section className="container mx-auto px-6 lg:px-10 py-24">
          {loading ? (
            <div className="text-center py-20 font-body text-ink-soft">Loading collections...</div>
          ) : categories.length === 0 ? (
            <div className="border border-dashed border-gold/30 py-24 text-center">
              <p className="font-heading text-3xl text-ink mb-2">No collections yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {categories.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: i * 0.1, duration: 0.9, type: "spring", stiffness: 100 }}>
                  <Magnetic3DCard className="perspective-1000 h-full">
                    <Link to={`/categories/${c.slug}`} className="group block h-full bg-ivory-deep border border-gold/10 p-4">
                      <div className="relative overflow-hidden aspect-[4/3] mb-6">
                        {c.image_url ? (
                          <>
                            <motion.img src={c.image_url} alt={c.name} className="w-full h-full object-cover" whileHover={{ scale: 1.05 }} transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }} loading="lazy" />
                            <div className="absolute inset-0 bg-emerald-deep/20 group-hover:bg-transparent transition-colors duration-700" />
                          </>
                        ) : (
                          <div className="w-full h-full bg-ivory flex items-center justify-center text-ink-soft font-body text-xs uppercase tracking-widest">No image</div>
                        )}
                        <motion.div className="absolute top-4 right-4 bg-ivory/90 backdrop-blur-md px-3 py-1 border border-gold/20"
                          initial={{ x: 20, opacity: 0 }} whileHover={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                          <span className="font-display text-[8px] uppercase tracking-[0.2em] text-emerald-deep flex items-center gap-2">View Edit <ArrowLeft size={10} className="rotate-180" /></span>
                        </motion.div>
                      </div>
                      <div className="px-2" style={{ transform: "translateZ(30px)" }}>
                        <h3 className="font-heading text-3xl text-ink group-hover:text-emerald transition-colors duration-300">{c.name}</h3>
                        {c.description && <p className="text-sm text-ink-soft font-body mt-3 leading-relaxed line-clamp-2">{c.description}</p>}
                      </div>
                    </Link>
                  </Magnetic3DCard>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Single Category View
  return (
    <div className="bg-ivory min-h-screen">
      <section className="relative pt-40 pb-20 overflow-hidden bg-ivory-deep border-b border-gold/15">
        <div className="absolute inset-0 bg-gradient-to-b from-ivory to-ivory-deep/40 pointer-events-none" />
        <div className="container mx-auto px-6 lg:px-10 relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/categories" className="inline-flex items-center gap-2 text-[10px] text-ink-soft hover:text-emerald mb-12 font-body uppercase tracking-[0.25em] link-reveal transition-colors">
              <ArrowLeft size={13} /> All Collections
            </Link>
          </motion.div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-24 bg-gold/10" />
              <div className="h-16 w-3/4 max-w-lg bg-gold/10" />
              <div className="h-20 w-full max-w-2xl bg-gold/10" />
            </div>
          ) : activeCategory ? (
            <div className="max-w-3xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-gold-dark" /><span className="eyebrow text-gold-dark">Collection</span>
              </motion.div>
              <h1 className="text-display text-5xl md:text-6xl text-ink mb-6">
                <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>{activeCategory.name}</motion.span></span>
              </h1>
              {activeCategory.description && (
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-ink-soft text-lg font-body font-light leading-relaxed">
                  {activeCategory.description}
                </motion.p>
              )}
            </div>
          ) : (
            <h1 className="text-4xl font-heading text-ink">Collection not found</h1>
          )}
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 py-20">
        {!loading && activeCategory && (
          <div className="flex items-center justify-between mb-12 pb-6 border-b border-gold/15">
            <p className="font-display text-[8px] text-ink-soft uppercase tracking-[0.3em]">{products.length} {products.length === 1 ? "piece" : "pieces"}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-14">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-ivory-deep mb-5" /></div>)}
          </div>
        ) : products.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border border-dashed border-gold/25 py-32 text-center glass-card">
            <Sparkles size={28} className="text-gold mx-auto mb-4" strokeWidth={1.2} />
            <p className="font-heading text-3xl text-ink mb-2">No pieces available</p>
            <p className="text-sm text-ink-soft font-body">Check back later for new arrivals.</p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-16">
            <AnimatePresence mode="popLayout">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} addToCart={addToCart} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default CategoriesPage;
