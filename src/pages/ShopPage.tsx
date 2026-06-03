import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductFilters, { applyProductFilters, FilterState } from "@/components/site/ProductFilters";

interface Category { id: string; name: string; slug: string; sort_order: number; }
interface Product {
  id: string; category_id: string | null; name: string; slug: string;
  description: string | null; price: number; compare_at_price: number | null;
  image_url: string | null; stock: number | null; status: string;
  colors?: string[] | null; color?: string | null;
}

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 220, damping: 26, delay: Math.min(index * 0.03, 0.3) }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group card-3d"
    >
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="relative overflow-hidden aspect-[3/4] mb-5 bg-ivory-deep border border-gold/10 img-fit">
          {product.image_url ? (
            <motion.img
              src={product.image_url}
              alt={product.name}
              width={600}
              height={800}
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles size={20} className="text-gold/30" strokeWidth={1} aria-hidden="true" />
            </div>
          )}
          {product.compare_at_price && product.compare_at_price > product.price && (
            <div className="absolute top-3 left-3 bg-rose text-ivory font-display text-[7px] tracking-[0.2em] uppercase px-2 py-1 shadow-md">Sale</div>
          )}
        </div>
        <h3 className="font-heading text-xl text-ink group-hover:text-emerald transition-colors duration-300 leading-tight mb-1.5">{product.name}</h3>
        <div className="flex items-center gap-3">
          <p className="font-body text-sm text-gold-dark">₹{Number(product.price).toLocaleString("en-IN")}</p>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <p className="font-body text-sm text-ink-soft line-through">₹{Number(product.compare_at_price).toLocaleString("en-IN")}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

const ShopPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({ categoryId: "all", colors: [], minPrice: 0, maxPrice: 1000000 });

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        (supabase.from("categories") as any).select("id,name,slug,sort_order").order("sort_order"),
        (supabase.from("products") as any).select("*").eq("status", "active").order("created_at", { ascending: false }),
      ]);
      setCategories(c.data || []);
      const prods: Product[] = p.data || [];
      setProducts(prods);
      if (prods.length) {
        const prices = prods.map(x => Number(x.price));
        setFilters(f => ({ ...f, minPrice: Math.floor(Math.min(...prices)), maxPrice: Math.ceil(Math.max(...prices)) }));
      }
      setLoading(false);
    })();
  }, []);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 100000 };
    const prices = products.map(p => Number(p.price));
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  const visible = useMemo(() => applyProductFilters(products, filters), [products, filters]);

  return (
    <div className="bg-ivory min-h-screen">
      <header className="border-b border-gold/15 bg-ivory pt-28 pb-8">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px bg-gold-dark" aria-hidden="true" />
            <span className="eyebrow text-gold-dark">The Boutique</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-ink">Shop all pieces</h1>
        </div>
      </header>

      <section className="container mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <p className="font-display text-[8px] text-ink-soft uppercase tracking-[0.3em]">{visible.length} {visible.length === 1 ? "piece" : "pieces"}</p>
          <button
            type="button"
            onClick={() => setFiltersOpen(v => !v)}
            className="inline-flex items-center gap-2 border border-gold/30 px-4 py-2 font-display text-[10px] tracking-[0.25em] uppercase text-ink"
            aria-expanded={filtersOpen}
            aria-controls="shop-filters"
          >
            <SlidersHorizontal size={14} aria-hidden="true" /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <div id="shop-filters" className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
            <ProductFilters
              products={products}
              categories={categories}
              state={filters}
              onChange={setFilters}
              priceBounds={priceBounds}
            />
          </div>

          <div>
            <div className="hidden lg:flex items-center justify-end mb-6 pb-4 border-b border-gold/15">
              <p className="font-display text-[8px] text-ink-soft uppercase tracking-[0.3em]">{visible.length} {visible.length === 1 ? "piece" : "pieces"}</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-ivory-deep mb-5" />
                    <div className="h-5 bg-ivory-deep mb-2 w-2/3 rounded" />
                    <div className="h-3 bg-ivory-deep w-1/3 rounded" />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="border border-dashed border-gold/25 py-32 text-center">
                <Sparkles size={28} className="text-gold mx-auto mb-4" strokeWidth={1.2} aria-hidden="true" />
                <p className="font-heading text-3xl text-ink mb-2">Nothing matches your filters</p>
                <p className="text-sm text-ink-soft font-body">Try widening the price range or clearing colours.</p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14">
                <AnimatePresence mode="popLayout">
                  {visible.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-ivory-deep border-t border-gold/15 py-16">
        <div className="container mx-auto px-6 text-center">
          <p className="eyebrow text-gold-dark mb-3">Looking for something special?</p>
          <h2 className="font-heading text-3xl text-ink mb-6">Let us help you find the perfect saree.</h2>
          <Link to="/contact" className="border border-emerald text-emerald px-8 py-4 font-display text-[9px] tracking-[0.3em] uppercase hover:bg-emerald hover:text-ivory transition-colors inline-flex items-center gap-2 group">
            Book a consultation <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
