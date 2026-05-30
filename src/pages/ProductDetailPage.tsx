import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingBag, Zap, ArrowLeft, Sparkles, Truck, Shield } from "lucide-react";
import { motion, useSpring } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

import { colorToSwatch } from "@/lib/colorNames";

interface Product { id: string; name: string; description: string | null; price: number; compare_at_price: number | null; image_url: string | null; stock: number | null; status: string; category_id: string | null; color: string | null; images: string[] | null; colors: string[] | null; }

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // 3D Image interaction
  const imgRef = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 20 });
  const y = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) / 15);
    y.set(-(e.clientY - cy) / 15);
  };

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from("products") as any).select("*").eq("slug", slug).maybeSingle();
      setProduct(data);
      if (data) {
        setActiveImage(data.image_url || (data.images?.[0] ?? ""));
        const cols = (data.colors as string[]) || (data.color ? [data.color] : []);
        setSelectedColor(cols[0] || "");
      }
      setLoading(false);
    })();
  }, [slug]);

  const handleBuyNow = async () => {
    if (!product) return;
    const ok = await addToCart(product.id, qty);
    if (ok) navigate("/cart");
  };

  if (loading) return <div className="container mx-auto px-4 py-32 text-center font-body text-ink-soft">Loading...</div>;
  if (!product) return (
    <div className="container mx-auto px-4 py-32 text-center font-body">
      <p className="text-ink-soft mb-4">Piece not found.</p>
      <Link to="/shop" className="text-maroon link-reveal text-[11px] tracking-[0.25em] uppercase">Back to shop</Link>
    </div>
  );

  return (
    <div className="bg-ivory min-h-screen">
      <div className="container mx-auto px-6 pt-36 pb-20 max-w-7xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] text-ink-soft hover:text-maroon mb-12 font-body uppercase tracking-[0.25em] link-reveal transition-colors">
            <ArrowLeft size={13} /> All pieces
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Image Side */}
          <div className="lg:col-span-6 lg:col-start-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="perspective-1000"
            >
              <motion.div
                ref={imgRef}
                onMouseMove={handleMouse}
                onMouseLeave={() => { x.set(0); y.set(0); }}
                style={{ rotateX: y, rotateY: x, transformStyle: "preserve-3d" }}
                className="relative bg-ivory-deep border border-gold/15 p-4 rounded-sm shadow-2xl"
              >
                <div className="relative overflow-hidden aspect-[3/4] group img-fit" style={{ transform: "translateZ(30px)" }}>
                  {activeImage ? (
                    <motion.img
                      key={activeImage}
                      src={activeImage}
                      alt={product.name}
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ink-soft font-body uppercase tracking-widest text-xs">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-tr from-ivory/0 via-ivory/10 to-ivory/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              </motion.div>
            </motion.div>
            {/* Thumbnails */}
            {(() => {
              const gallery = Array.from(new Set([
                ...(product.image_url ? [product.image_url] : []),
                ...((product.images as string[]) || []),
              ]));
              if (gallery.length <= 1) return null;
              return (
                <div className="flex flex-wrap gap-2 mt-4">
                  {gallery.map((url, i) => (
                    <button key={i} type="button" onClick={() => setActiveImage(url)}
                      className={`w-16 h-20 border overflow-hidden transition ${activeImage === url ? "border-maroon shadow-md" : "border-gold/20 hover:border-gold/50"}`}>
                      <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Info Side */}
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {}
              }}
              className="space-y-6"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <p className="eyebrow text-gold-dark mb-4 flex items-center gap-3">
                  <span className="w-6 h-px bg-gold-dark" /> From the loom
                </p>
                <h1 className="text-display text-4xl md:text-5xl text-ink leading-[1.1]">{product.name}</h1>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }} className="hairline w-20 origin-left" />

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-baseline gap-4">
                <p className="text-3xl font-heading text-maroon-deep">₹{Number(product.price).toLocaleString("en-IN")}</p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="text-base text-ink-soft line-through font-body">₹{Number(product.compare_at_price).toLocaleString("en-IN")}</p>
                )}
              </motion.div>
              <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-[10px] text-ink-soft uppercase tracking-[0.25em] font-body">All prices include 5% GST</motion.p>

              {product.description && (
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pt-4 pb-6">
                  <p className="text-ink-soft font-body leading-relaxed text-[15px]">{product.description}</p>
                </motion.div>
              )}

              {(() => {
                const allColors = ((product.colors as string[]) || []).length
                  ? (product.colors as string[])
                  : (product.color ? [product.color] : []);
                if (!allColors.length) return null;
                return (
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap items-center gap-3 pb-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-body text-ink-soft">Color{allColors.length > 1 ? "s" : ""}</span>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map(c => {
                        const active = c === selectedColor;
                        return (
                          <button key={c} type="button" onClick={() => setSelectedColor(c)}
                            className={`inline-flex items-center gap-2 border px-2.5 py-1 transition ${active ? "border-maroon bg-maroon/5" : "border-gold/20 hover:border-gold/50"}`}>
                            <span className="w-4 h-4 rounded-full border border-gold/30" style={{ background: colorToSwatch(c) }} />
                            <span className="text-xs font-body text-ink capitalize">{c}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-6 pt-2">
                {product.status === 'out_of_stock' ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-ink/5 border border-ink/10 text-ink-soft font-body text-xs uppercase tracking-[0.25em]">
                    Out of Stock
                  </span>
                ) : (
                  <>
                    <label className="text-[10px] uppercase tracking-[0.25em] font-body text-ink-soft">Quantity</label>
                    <div className="inline-flex items-center border border-gold/20 bg-card">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 hover:bg-gold/10 transition-colors text-ink text-lg">−</motion.button>
                      <input type="number" value={qty} onChange={e => setQty(Math.max(1, Math.min(product.stock ?? 999, Number(e.target.value))))} className="w-14 text-center bg-transparent border-x border-gold/20 font-body h-10 focus:outline-none" />
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQty(Math.min(product.stock ?? 999, qty + 1))} className="w-10 h-10 hover:bg-gold/10 transition-colors text-ink text-lg">+</motion.button>
                    </div>
                    {product.stock != null && product.stock > 0 && <span className="text-xs text-maroon font-body bg-maroon/10 px-3 py-1.5">{product.stock} in stock</span>}
                  </>
                )}
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 gap-4 pt-6">
                <button onClick={() => addToCart(product.id, qty)} disabled={product.status === 'out_of_stock'} className="btn-outline-emerald border-gold/50 text-ink hover:border-maroon hover:text-ivory py-4 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ShoppingBag size={14} /> Add to bag
                </button>
                <button onClick={handleBuyNow} disabled={product.status === 'out_of_stock'} className="btn-liquid btn-emerald py-4 border border-maroon-deep disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap size={14} /> Buy now
                  </span>
                </button>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="border-t border-gold/15 mt-10 pt-8 space-y-5">
                {[
                  { icon: Sparkles, t: "Authentic & handwoven", d: "Sourced directly from master weavers." },
                  { icon: Truck, t: "Insured pan-India shipping", d: "Free above ₹5,000 · tracked end to end." },
                  { icon: Shield, t: "7-day exchange", d: "Easy returns on unworn pieces." },
                ].map((f, i) => (
                  <motion.div key={f.t} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center shrink-0">
                      <f.icon size={12} className="text-gold-dark" strokeWidth={1.5} />
                    </div>
                    <div className="pt-0.5">
                      <p className="font-heading text-[15px] text-ink">{f.t}</p>
                      <p className="text-[13px] text-ink-soft font-body mt-0.5">{f.d}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
