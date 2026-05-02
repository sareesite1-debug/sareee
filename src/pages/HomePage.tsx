import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import craftImg from "@/assets/craft-silks.jpg";
import heroEditorial from "@/assets/hero-editorial.jpg";
import heroPattern from "@/assets/hero-pattern.png";

interface Category { id: string; name: string; slug: string; image_url: string | null; description: string | null; }
interface Product { id: string; name: string; slug: string; price: number; image_url: string | null; }
interface Section { section_key: string; content: any; }

/* Lightweight CSS-only fade-up — no JS work per element, no scroll listeners. */
const FadeUp = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const Marquee = () => (
  <div className="overflow-hidden border-y border-gold/20 py-4 bg-maroon-deep">
    <div className="marquee-track" aria-hidden="true">
      {[...Array(3)].map((_, r) => (
        <div key={r} className="flex items-center gap-12 pr-12">
          {["Kanchipuram Pure Silk", "Bridal Sarees", "Zari Weaves", "Temple Borders", "GI Certified", "Arpitha Saree Center", "Est. 1985 · Kanchipuram"].map((t, i) => (
            <span key={i} className="flex items-center gap-6 whitespace-nowrap">
              <span className="eyebrow text-ivory/75 tracking-[0.4em]">{t}</span>
              <span className="text-gold/70 text-lg" aria-hidden="true">◈</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const PatternBg = () => (
  <div
    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.18] mix-blend-screen"
    style={{
      backgroundImage: `url(${heroPattern})`,
      backgroundRepeat: "repeat",
      backgroundSize: "260px auto",
    }}
    aria-hidden="true"
  />
);

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      const [c, p, s] = await Promise.all([
        (supabase.from("categories") as any).select("*").order("sort_order").limit(6),
        (supabase.from("products") as any).select("*").eq("status", "active").order("created_at", { ascending: false }).limit(8),
        (supabase.from("content_sections") as any).select("section_key,content"),
      ]);
      setCategories(c.data || []);
      setFeaturedProducts(p.data || []);
      const map: Record<string, any> = {};
      (s.data || []).forEach((row: Section) => { map[row.section_key] = row.content || {}; });
      setSections(map);
    })();
  }, []);

  const hero = sections.hero || {};
  const featured = sections.featured_collections || {};
  const promo = sections.promotions || {};

  return (
    <div className="bg-ivory overflow-x-hidden">
      {/* HERO */}
      <section
        className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden pt-[80px] lg:pt-0 text-safe"
        aria-label="Hero section"
      >
        {/* LEFT PANEL */}
        <div className="relative flex-1 lg:w-[52%] bg-maroon-deep flex items-center justify-center px-6 sm:px-10 lg:px-20 py-16 lg:py-24 order-2 lg:order-1 min-h-[60vh] lg:min-h-screen">
          <PatternBg />
          <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-gold/8 blur-[120px] pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 max-w-lg w-full">
            <div className="flex items-center gap-4 mb-8 sm:mb-10">
              <div className="w-10 h-px bg-gold/60" aria-hidden="true" />
              <span className="eyebrow text-gold/80">{hero.eyebrow || "Since 1985 · Arpitha Saree Center"}</span>
            </div>

            <h1 className="font-heading text-[clamp(2.5rem,5.5vw,5.5rem)] text-ivory leading-[1.05] mb-6 sm:mb-8">
              <span className="block">{hero.heading || "Woven in"}</span>
              <span className="block italic text-gold">Kanchipuram.</span>
              <span className="block">Worn with pride.</span>
            </h1>

            <div className="h-px bg-gradient-to-r from-gold via-gold/60 to-transparent mb-6 sm:mb-8" aria-hidden="true" />

            <p className="text-ivory/90 text-base font-body font-light leading-relaxed max-w-md mb-10 sm:mb-12">
              {hero.subheading || "Pure Kanchipuram silk sarees, handwoven by master craftsmen — GI-certified, real zari, and crafted to last a lifetime."}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link to={hero.cta_link || "/shop"} className="luxury-btn group">
                <span className="relative z-10">{hero.cta_label || "Discover the Edit"}</span>
                <ArrowRight size={13} className="relative z-10 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link to="/categories" className="link-reveal font-display text-[9px] tracking-[0.35em] uppercase text-ivory/80 hover:text-gold transition-colors">
                Browse Collections
              </Link>
            </div>

            <div className="flex gap-8 sm:gap-10 mt-12 sm:mt-16 pt-8 border-t border-ivory/10">
              {[["40+", "Years"], ["12+", "Regions"], ["5000+", "Sarees"]].map(([n, l]) => (
                <div key={l}>
                  <p className="font-heading text-2xl text-gold leading-none">{n}</p>
                  <p className="font-display text-[8px] tracking-[0.3em] text-ivory/75 uppercase mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative flex-1 lg:w-[48%] bg-ivory-deep flex items-center justify-center order-1 lg:order-2 min-h-[55vh] lg:min-h-screen overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <svg viewBox="0 0 500 500" className="w-[90%] max-w-[480px] opacity-20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g fill="none" stroke="#6B0F1A" strokeWidth="1">
                <circle cx="250" cy="250" r="220" />
                <circle cx="250" cy="250" r="200" />
                <circle cx="250" cy="250" r="160" />
                <circle cx="250" cy="250" r="120" />
                <circle cx="250" cy="250" r="80" />
                <circle cx="250" cy="250" r="40" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180;
                  return <line key={i} x1={250 + 40 * Math.cos(angle)} y1={250 + 40 * Math.sin(angle)} x2={250 + 220 * Math.cos(angle)} y2={250 + 220 * Math.sin(angle)} strokeWidth="0.6" />;
                })}
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  const x = 250 + 130 * Math.cos(angle);
                  const y = 250 + 130 * Math.sin(angle);
                  return <ellipse key={i} cx={x} cy={y} rx="18" ry="35" stroke="#C9952A" strokeWidth="1" transform={`rotate(${i * 45 + 90} ${x} ${y})`} />;
                })}
              </g>
              <polygon points="250,225 275,250 250,275 225,250" fill="none" stroke="#C9952A" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="relative z-10 w-[58%] max-w-[360px] min-w-[240px]">
            <div className="relative aspect-[3/4] border border-gold/25 bg-ivory shadow-[0_32px_90px_-36px_hsl(var(--maroon-deep)/0.45)] p-3">
              <div className="img-fit h-full w-full bg-ivory-deep">
                <img
                  src={heroEditorial}
                  alt="Premium silk saree drape from Arpitha Saree Center, Kanchipuram"
                  width="360"
                  height="480"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div className="absolute -inset-3 border border-gold/20 pointer-events-none" aria-hidden="true" />
              <div className="absolute inset-3 bg-gradient-to-t from-maroon-deep/20 via-transparent to-ivory/10 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          <div className="absolute top-[15%] right-[5%] sm:right-[8%] bg-ivory/90 backdrop-blur-sm border border-gold/20 p-4 sm:p-5 shadow-sm max-w-[180px] sm:max-w-[200px]">
            <p className="eyebrow text-gold-dark mb-2">Featured Craft</p>
            <p className="font-heading text-lg sm:text-xl text-ink leading-tight">Kanchipuram Silk</p>
            <p className="font-body text-[11px] text-ink-soft mt-2">Pure mulberry silk · GI certified</p>
          </div>

          <div className="absolute bottom-[15%] left-[5%] sm:left-[8%] bg-maroon/5 border border-maroon/20 p-4 sm:p-5 max-w-[160px] sm:max-w-[180px]">
            <p className="font-heading text-3xl text-maroon leading-none">GI</p>
            <p className="font-display text-[8px] tracking-[0.3em] text-ink-soft uppercase mt-1">Certified weaves</p>
          </div>
        </div>
      </section>

      {promo.banner_text && (
        <div className="bg-maroon-deep text-ivory py-3 text-center border-b border-gold/10">
          <Link to={promo.banner_link || "/shop"} className="font-display text-[9px] tracking-[0.35em] uppercase text-gold/90 hover:text-gold link-reveal">
            {promo.banner_text}
          </Link>
        </div>
      )}

      <Marquee />

      {/* COLLECTIONS GRID */}
      <section className="py-20 sm:py-32 lg:py-44 bg-ivory" aria-labelledby="collections-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12 sm:mb-16 gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-gold-dark" aria-hidden="true" />
                <span className="eyebrow text-gold-dark">{featured.eyebrow || "The Collections"}</span>
              </div>
              <h2 id="collections-heading" className="text-display text-4xl sm:text-5xl md:text-6xl text-ink max-w-xl">
                {featured.heading || "Each weave, a region's signature."}
              </h2>
            </div>
            <Link to="/categories" className="link-reveal font-display text-[9px] tracking-[0.3em] uppercase text-maroon">View all collections →</Link>
          </div>

          {categories.length === 0 ? (
            <div className="border border-dashed border-gold/30 py-16 sm:py-24 text-center">
              <p className="font-heading text-2xl sm:text-3xl text-ink mb-2">Collections coming soon</p>
              <p className="text-sm text-ink-soft font-body">Add your first category from the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-12 sm:gap-y-16">
              {categories.map((c, i) => (
                <FadeUp key={c.id} delay={Math.min(i * 0.05, 0.2)}>
                  <Link to={`/categories/${c.slug}`} className="group block">
                    <div className="relative overflow-hidden aspect-[4/5] mb-5 sm:mb-6 bg-ivory-deep img-fit">
                      {c.image_url ? (
                        <>
                          <img
                            src={c.image_url}
                            alt={`${c.name} saree collection`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-maroon/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs font-body uppercase tracking-widest">No image</div>
                      )}
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="eyebrow text-gold-dark mb-2">No. {String(i + 1).padStart(2, "0")}</p>
                        <h3 className="font-heading text-2xl sm:text-3xl text-ink group-hover:text-maroon transition-colors duration-300">{c.name}</h3>
                        {c.description && <p className="text-sm text-ink-soft mt-2 font-body leading-relaxed line-clamp-2">{c.description}</p>}
                      </div>
                      <div className="mt-2 w-8 h-8 border border-gold/30 flex items-center justify-center rounded-full group-hover:bg-gold/10 group-hover:border-gold transition-all duration-300" aria-hidden="true">
                        <ArrowRight size={12} className="text-gold-dark" />
                      </div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STORY */}
      <section className="relative bg-maroon-deep overflow-hidden py-20 sm:py-32 lg:py-44" aria-labelledby="story-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden rounded-sm">
                  <img
                    src={craftImg}
                    alt="Folded handwoven silk sarees at Arpitha Saree Center"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="480"
                    height="600"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-gold/20 pointer-events-none" aria-hidden="true" />
                <div className="absolute -bottom-8 -left-4 sm:-left-6 glass-card p-5 sm:p-6">
                  <p className="font-heading text-4xl sm:text-5xl text-maroon-deep leading-none">40+</p>
                  <p className="font-body text-xs text-ink-soft uppercase tracking-widest mt-1">Years of craft</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 mt-12 lg:mt-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-gold" aria-hidden="true" />
                <span className="eyebrow text-gold">Our Story</span>
              </div>

              <h2 id="story-heading" className="text-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ivory mb-8 leading-[1.0]">
                Four decades of cloth,
                <br />
                <span className="italic text-gold">conversation & craft.</span>
              </h2>

              <div className="h-px bg-gradient-to-r from-gold to-transparent mb-8" aria-hidden="true" />

              {[
                "What began as a small store in Kanchipuram in 1985, Arpitha Saree Center is today a trusted destination for those who know that a Kanchipuram silk saree is more than a garment — it's a legacy woven in pure mulberry silk and real zari.",
                "We source directly from master weavers of Kanchipuram, preserving centuries-old techniques — every saree GI-certified, every thread authentic.",
              ].map((para, i) => (
                <p key={i} className="text-ivory/90 font-body leading-relaxed mb-5 text-[15px]">
                  {para}
                </p>
              ))}

              <div className="grid grid-cols-3 gap-4 sm:gap-6 my-8 sm:my-10 border-t border-b border-ivory/10 py-6 sm:py-8 relative">
                {[["1985", "Est."], ["12+", "Weaving regions"], ["5000+", "Sarees curated"]].map(([num, label]) => (
                  <div key={label} className="relative z-10">
                    <p className="font-heading text-2xl sm:text-3xl text-gold leading-none">{num}</p>
                    <p className="font-body text-[10px] text-ivory/65 uppercase tracking-widest mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <Link to="/about" className="link-reveal font-display text-[9px] tracking-[0.35em] uppercase text-gold">Read the full story →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="py-20 sm:py-32 lg:py-44 bg-ivory" aria-labelledby="products-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-end justify-between mb-12 sm:mb-16 gap-6 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-px bg-gold-dark" aria-hidden="true" />
                  <span className="eyebrow text-gold-dark">New In</span>
                </div>
                <h2 id="products-heading" className="text-display text-4xl sm:text-5xl md:text-6xl text-ink">
                  Fresh from the loom.
                </h2>
              </div>
              <Link to="/shop" className="link-reveal font-display text-[9px] tracking-[0.3em] uppercase text-maroon">Shop all →</Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-10 sm:gap-y-16">
              {featuredProducts.map((p, i) => (
                <FadeUp key={p.id} delay={Math.min(i * 0.04, 0.16)}>
                  <Link to={`/shop/${p.slug}`} className="group block relative">
                    <div className="relative overflow-hidden aspect-[3/4] mb-4 sm:mb-5 bg-ivory-deep border border-gold/10 img-fit">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={`${p.name} - Buy saree online`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs font-body uppercase tracking-widest">No image</div>
                      )}
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl text-ink group-hover:text-maroon transition-colors leading-tight">{p.name}</h3>
                    <p className="font-body text-sm text-gold-dark mt-1">₹{Number(p.price).toLocaleString("en-IN")}</p>
                  </Link>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST STRIP */}
      <section className="bg-ivory-deep py-16 sm:py-20 border-y border-gold/15 relative overflow-hidden" aria-label="Why shop with us">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gold/15">
            {[
              { icon: Sparkles, title: "Handwoven & sourced", desc: "Direct from master weavers, ethically priced and fairly traded." },
              { icon: Shield, title: "Authenticity, certified", desc: "Each piece verified by our in-house textile team before listing." },
              { icon: Truck, title: "Insured, tracked delivery", desc: "Pan-India shipping with care. Free above ₹5,000." },
            ].map((t) => (
              <div key={t.title} className="flex items-start gap-4 sm:gap-5 px-6 sm:px-10 py-7 sm:py-8 group">
                <div className="w-10 h-10 border border-gold/30 flex items-center justify-center shrink-0 mt-1 bg-ivory rounded-full group-hover:border-gold transition-colors" aria-hidden="true">
                  <t.icon size={16} className="text-gold-dark" strokeWidth={1.2} />
                </div>
                <div>
                  <h3 className="font-heading text-lg sm:text-xl text-ink mb-1.5">{t.title}</h3>
                  <p className="text-sm text-ink-soft font-body leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-32 lg:py-44 bg-maroon-deep overflow-hidden" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold/40" aria-hidden="true" />
            <span className="eyebrow text-gold">Visit Arpitha Saree Center</span>
            <div className="w-8 h-px bg-gold/40" aria-hidden="true" />
          </div>

          <h2 id="cta-heading" className="text-display text-3xl sm:text-4xl md:text-6xl text-ivory mb-8 leading-[1.0]">
            A saree is best
            <br />
            <span className="italic text-gold/90">chosen in person.</span>
          </h2>

          <p className="text-ivory/85 font-body mb-10 sm:mb-12 leading-relaxed text-sm sm:text-base">
            Step into Arpitha Saree Center in Kanchipuram and experience the joy of choosing your pure silk saree in person — feel the zari, touch the silk, and find the one that's truly yours.
          </p>

          <div>
            <Link to="/contact" className="btn-liquid border border-gold/50 text-gold px-8 sm:px-10 py-4 font-display text-[9px] tracking-[0.35em] uppercase inline-flex items-center gap-3 hover:text-maroon-deep transition-colors duration-500 group">
              Get directions
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
