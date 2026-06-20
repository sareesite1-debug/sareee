import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ProductFilters, { applyProductFilters, applyProductSort, FilterState, SortKey, SORT_OPTIONS } from "@/components/site/ProductFilters";
import MobileFilterSortBar from "@/components/site/MobileFilterSortBar";
import { optimizeImg, imgSrcSet } from "@/lib/img";

interface Category { id: string; name: string; slug: string; description: string | null; image_url: string | null; sort_order: number; }
interface Product {
  id: string; category_id: string | null; name: string; slug: string;
  price: number; compare_at_price: number | null; image_url: string | null;
  stock: number | null; status: string;
  colors?: string[] | null; color?: string | null; created_at?: string;
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
        <div className="relative overflow-hidden aspect-[3/4] mb-5 bg-ivory-deep border border-gold/10 img-fit transition-all duration-500 group-hover:border-emerald/40 group-hover:shadow-[0_25px_60px_-25px_hsl(var(--emerald)/0.35)]">
          {product.image_url ? (
            <motion.img
              src={optimizeImg(product.image_url, 600)}
              srcSet={imgSrcSet(product.image_url, [300, 450, 600, 900])}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              alt={product.name}
              width={600}
              height={800}
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles size={20} className="text-gold/30" aria-hidden="true" />
            </div>
          )}
          {/* Gold sheen overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          {/* Quick view ribbon */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-ivory/95 backdrop-blur-sm py-3 text-center pointer-events-none">
            <span className="font-display text-[9px] tracking-[0.3em] uppercase text-emerald">View piece →</span>
          </div>
        </div>
        <h3 className="font-heading text-xl text-ink group-hover:text-emerald transition-colors duration-300 mb-1.5 relative inline-block">
          {product.name}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full bg-gold-dark transition-all duration-500" />
        </h3>
        <p className="font-body text-sm text-gold-dark">₹{Number(product.price).toLocaleString("en-IN")}</p>
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
  const [sort, setSort] = useState<SortKey>("newest");
  const [filters, setFilters] = useState<FilterState>({ categoryId: "all", colors: [], minPrice: 0, maxPrice: 1000000 });

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
          const list: Product[] = prods || [];
          setProducts(list);
          if (list.length) {
            const prices = list.map(x => Number(x.price));
            setFilters({ categoryId: "all", colors: [], minPrice: Math.floor(Math.min(...prices)), maxPrice: Math.ceil(Math.max(...prices)) });
          }
        }
      } else {
        setActiveCategory(null);
        setProducts([]);
      }
      setLoading(false);
    })();
  }, [slug]);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 100000 };
    const prices = products.map(p => Number(p.price));
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  const visible = useMemo(
    () => applyProductSort(applyProductFilters(products, filters), sort),
    [products, filters, sort],
  );

  // Collections index view
  if (!slug) {
    return (
      <div className="bg-ivory min-h-screen">
        <header className="border-b border-gold/15 bg-ivory pt-28 pb-8">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gold-dark" aria-hidden="true" />
              <span className="eyebrow text-gold-dark">The Collections</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl text-ink">Signatures of the house</h1>
            <p className="text-ink-soft text-sm font-body mt-2 max-w-xl">Explore our curated collections, each a testament to India's varied weaving heritage.</p>
          </div>
        </header>

        <section className="container mx-auto px-6 lg:px-10 py-14">
          {loading ? (
            <div className="text-center py-20 font-body text-ink-soft">Loading collections...</div>
          ) : categories.length === 0 ? (
            <div className="border border-dashed border-gold/30 py-24 text-center">
              <p className="font-heading text-3xl text-ink mb-2">No collections yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(c => (
                <Link key={c.id} to={`/categories/${c.slug}`} className="group block bg-ivory-deep/50 border border-gold/15 overflow-hidden hover:border-emerald transition-all duration-500 hover:shadow-[0_20px_50px_-20px_hsl(var(--emerald)/0.25)] hover:-translate-y-1">
                  <div className="relative aspect-[4/3] overflow-hidden bg-ivory-deep">
                    {c.image_url ? (
                      <img
                        src={optimizeImg(c.image_url, 800)}
                        srcSet={imgSrcSet(c.image_url, [400, 600, 800, 1200])}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        alt={c.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles size={28} className="text-gold/30" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-6">
                    <h2 className="font-heading text-2xl text-ink group-hover:text-emerald transition-colors">{c.name}</h2>
                    {c.description && <p className="text-sm text-ink-soft font-body mt-2 leading-relaxed line-clamp-2">{c.description}</p>}
                    <span className="mt-4 inline-flex items-center gap-2 font-display text-[9px] tracking-[0.25em] uppercase text-gold-dark group-hover:text-emerald transition-colors">
                      View edit <ArrowLeft size={11} className="rotate-180 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Single category view
  return (
    <div className="bg-ivory min-h-screen pb-24 lg:pb-0">
      <header className="border-b border-gold/15 bg-ivory pt-28 pb-8">
        <div className="container mx-auto px-6 lg:px-10">
          <Link to="/categories" className="inline-flex items-center gap-2 text-[10px] text-ink-soft hover:text-emerald mb-4 font-body uppercase tracking-[0.25em] transition-colors">
            <ArrowLeft size={13} aria-hidden="true" /> All Collections
          </Link>
          {loading ? (
            <div className="animate-pulse h-10 w-64 bg-gold/10" />
          ) : activeCategory ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-px bg-gold-dark" aria-hidden="true" />
                <span className="eyebrow text-gold-dark">Collection</span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl text-ink">{activeCategory.name}</h1>
              {activeCategory.description && (
                <p className="text-ink-soft text-sm font-body mt-2 max-w-2xl leading-relaxed">{activeCategory.description}</p>
              )}
            </>
          ) : (
            <h1 className="text-3xl font-heading text-ink">Collection not found</h1>
          )}
        </div>
      </header>

      <section className="container mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <div className="hidden lg:block">
            <ProductFilters
              products={products}
              categories={[]}
              showCategory={false}
              state={filters}
              onChange={setFilters}
              priceBounds={priceBounds}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gold/15">
              <p className="font-display text-[8px] text-ink-soft uppercase tracking-[0.3em]">{visible.length} {visible.length === 1 ? "piece" : "pieces"}</p>
              <label className="hidden lg:inline-flex items-center gap-2">
                <span className="font-display text-[9px] tracking-[0.25em] uppercase text-ink-soft">Sort</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value as SortKey)}
                    className="appearance-none bg-ivory border border-gold/25 pl-3 pr-8 py-2 text-sm font-body text-ink focus:border-emerald focus:outline-none cursor-pointer"
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft" aria-hidden="true" />
                </div>
              </label>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-ivory-deep mb-5" /></div>)}
              </div>
            ) : visible.length === 0 ? (
              <div className="border border-dashed border-gold/25 py-32 text-center">
                <Sparkles size={28} className="text-gold mx-auto mb-4" strokeWidth={1.2} aria-hidden="true" />
                <p className="font-heading text-3xl text-ink mb-2">No pieces match your filters</p>
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

      <MobileFilterSortBar
        products={products}
        categories={[]}
        showCategory={false}
        state={filters}
        onChange={setFilters}
        priceBounds={priceBounds}
        sort={sort}
        onSortChange={setSort}
        visibleCount={visible.length}
      />
    </div>
  );
};

export default CategoriesPage;
