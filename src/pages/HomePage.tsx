import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { ArrowRight, Sparkles, Shield, Truck, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import craftImg from "@/assets/craft-silks.jpg";

interface Category { id: string; name: string; slug: string; image_url: string | null; description: string | null; }
interface Product { id: string; name: string; slug: string; price: number; image_url: string | null; }
interface Section { section_key: string; content: any; }

const RevealWords = ({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block relative">
          <motion.span
            className="inline-block"
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.85, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
};

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
    rotateX.set(-dy * 8);
    rotateY.set(dx * 8);
    x.set(dx * 6);
    y.set(dy * 6);
  };

  const reset = () => { x.set(0); y.set(0); rotateX.set(0); rotateY.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x, y, rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`${className} card-3d`}
    >
      {children}
    </motion.div>
  );
};

const Marquee = () => (
  <div className="overflow-hidden border-y border-gold/20 py-4 bg-maroon-deep">
    <div className="marquee-track">
      {[...Array(3)].map((_, r) => (
        <div key={r} className="flex items-center gap-12 pr-12">
          {["Kanchipuram Pure Silk", "Bridal Sarees", "Zari Weaves", "Temple Borders", "GI Certified", "Arpitha Saree Center", "Est. 1985 · Kanchipuram"].map((t, i) => (
            <span key={i} className="flex items-center gap-6 whitespace-nowrap">
              <span className="eyebrow text-ivory/75 tracking-[0.4em]">{t}</span>
              <span className="text-gold/70 text-lg">◈</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const ScrollProgressLine = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-dark via-gold to-gold-light z-[100] origin-left"
      style={{ scaleX }}
    />
  );
};

/* ── Animated saree-pattern SVG background ── */
const PatternBg = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="paisley" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="40" cy="40" r="18" fill="none" stroke="#C9952A" strokeWidth="0.8"/>
        <circle cx="40" cy="40" r="10" fill="none" stroke="#C9952A" strokeWidth="0.5"/>
        <circle cx="40" cy="40" r="3" fill="#C9952A"/>
        <line x1="40" y1="4" x2="40" y2="22" stroke="#C9952A" strokeWidth="0.5"/>
        <line x1="40" y1="58" x2="40" y2="76" stroke="#C9952A" strokeWidth="0.5"/>
        <line x1="4" y1="40" x2="22" y2="40" stroke="#C9952A" strokeWidth="0.5"/>
        <line x1="58" y1="40" x2="76" y2="40" stroke="#C9952A" strokeWidth="0.5"/>
        <line x1="12" y1="12" x2="28" y2="28" stroke="#C9952A" strokeWidth="0.4"/>
        <line x1="52" y1="52" x2="68" y2="68" stroke="#C9952A" strokeWidth="0.4"/>
        <line x1="68" y1="12" x2="52" y2="28" stroke="#C9952A" strokeWidth="0.4"/>
        <line x1="28" y1="52" x2="12" y2="68" stroke="#C9952A" strokeWidth="0.4"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#paisley)"/>
  </svg>
);

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Record<string, any>>({});

  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const { scrollYProgress: storyScroll } = useScroll({ target: storyRef, offset: ["start end", "end start"] });
  const storyImgY = useTransform(storyScroll, [0, 1], ["-8%", "8%"]);

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
  const testimonials = (sections.testimonials?.items || []) as { name: string; quote: string }[];

  return (
    <div className="bg-ivory overflow-x-hidden">
      <ScrollProgressLine />

      {/* ══════════════════════════════════════════
          HERO — Split editorial layout
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden pt-[80px] lg:pt-0">

        {/* LEFT PANEL — Deep maroon with text */}
        <div className="relative flex-1 lg:w-[52%] bg-maroon-deep flex items-center justify-center px-10 lg:px-20 py-32 lg:py-24 order-2 lg:order-1 min-h-[60vh] lg:min-h-screen">
          <PatternBg />

          {/* ambient glow */}
          <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-gold/8 blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-lg">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="w-10 h-px bg-gold/60" />
              <span className="eyebrow text-gold/80">{hero.eyebrow || "Since 1985 · Arpitha Saree Center"}</span>
            </motion.div>

            {/* Main headline */}
            <h1 className="font-heading text-[clamp(3rem,5.5vw,5.5rem)] text-ivory leading-[1.05] mb-8">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {hero.heading || "Woven in"}
              </motion.span>
              <motion.span
                className="block italic text-gold"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                Kanchipuram.
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Worn with pride.
              </motion.span>
            </h1>

            {/* Gold rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 1, ease: [0.76, 0, 0.24, 1] }}
              className="h-px bg-gradient-to-r from-gold via-gold/60 to-transparent mb-8 origin-left"
            />

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-ivory/90 text-base font-body font-light leading-relaxed max-w-md mb-12"
            >
              {hero.subheading || "Pure Kanchipuram silk sarees, handwoven by master craftsmen — GI-certified, real zari, and crafted to last a lifetime."}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-6"
            >
              <Link to={hero.cta_link || "/shop"} className="luxury-btn group">
                <span className="relative z-10">{hero.cta_label || "Discover the Edit"}</span>
                <ArrowRight size={13} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/categories" className="link-reveal font-display text-[9px] tracking-[0.35em] uppercase text-ivory/80 hover:text-gold transition-colors">
                Browse Collections
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="flex gap-10 mt-16 pt-8 border-t border-ivory/10"
            >
              {[["40+", "Years"], ["12+", "Regions"], ["5000+", "Sarees"]].map(([n, l]) => (
                <div key={l}>
                  <p className="font-heading text-2xl text-gold leading-none">{n}</p>
                  <p className="font-display text-[8px] tracking-[0.3em] text-ivory/75 uppercase mt-1">{l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* RIGHT PANEL — Ivory with decorative elements */}
        <div className="relative flex-1 lg:w-[48%] bg-ivory-deep flex items-center justify-center order-1 lg:order-2 min-h-[55vh] lg:min-h-screen overflow-hidden">

          {/* Large decorative mandala / geometric */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg viewBox="0 0 500 500" className="w-[90%] max-w-[480px] opacity-20" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" stroke="#6B0F1A" strokeWidth="1">
                {/* Outer ring */}
                <circle cx="250" cy="250" r="220"/>
                <circle cx="250" cy="250" r="200"/>
                <circle cx="250" cy="250" r="160"/>
                <circle cx="250" cy="250" r="120"/>
                <circle cx="250" cy="250" r="80"/>
                <circle cx="250" cy="250" r="40"/>
                {/* Radial lines */}
                {Array.from({length: 24}).map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180;
                  return <line key={i} x1={250 + 40*Math.cos(angle)} y1={250 + 40*Math.sin(angle)} x2={250 + 220*Math.cos(angle)} y2={250 + 220*Math.sin(angle)} strokeWidth="0.6"/>;
                })}
                {/* Petal shapes */}
                {Array.from({length: 8}).map((_, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  const x = 250 + 130*Math.cos(angle);
                  const y = 250 + 130*Math.sin(angle);
                  return <ellipse key={i} cx={x} cy={y} rx="18" ry="35" stroke="#C9952A" strokeWidth="1" transform={`rotate(${i*45+90} ${x} ${y})`}/>;
                })}
              </g>
              {/* Center diamond */}
              <polygon points="250,225 275,250 250,275 225,250" fill="none" stroke="#C9952A" strokeWidth="1.5"/>
            </svg>
          </motion.div>

          {/* Floating craft cards */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[15%] right-[8%] bg-white/80 backdrop-blur-sm border border-gold/20 p-5 shadow-sm max-w-[200px]"
          >
            <p className="eyebrow text-gold-dark mb-2">Featured Craft</p>
            <p className="font-heading text-xl text-ink leading-tight">Kanchipuram Silk</p>
            <p className="font-body text-[11px] text-ink-soft mt-2">Pure mulberry silk · GI certified</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30, y: 30 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[15%] left-[8%] bg-maroon/5 border border-maroon/20 p-5 max-w-[180px]"
          >
            <p className="font-heading text-3xl text-maroon leading-none">GI</p>
            <p className="font-display text-[8px] tracking-[0.3em] text-ink-soft uppercase mt-1">Certified weaves</p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="eyebrow text-ink-soft/70">Scroll</span>
            <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ChevronDown size={16} className="text-gold/50" />
            </motion.div>
          </motion.div>
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
      <section className="py-32 lg:py-44 bg-ivory">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-16 gap-6 flex-wrap">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-gold-dark" />
                <span className="eyebrow text-gold-dark">{featured.eyebrow || "The Collections"}</span>
              </motion.div>
              <h2 className="text-display text-5xl md:text-6xl text-ink max-w-xl">
                <RevealWords text={featured.heading || "Each weave, a region's signature."} />
              </h2>
            </div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.7 }}>
              <Link to="/categories" className="link-reveal font-display text-[9px] tracking-[0.3em] uppercase text-maroon">View all collections →</Link>
            </motion.div>
          </div>

          {categories.length === 0 ? (
            <div className="border border-dashed border-gold/30 py-24 text-center">
              <p className="font-heading text-3xl text-ink mb-2">Collections coming soon</p>
              <p className="text-sm text-ink-soft font-body">Add your first category from the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
              {categories.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * 0.1, duration: 0.9, type: "spring", stiffness: 100 }}>
                  <Magnetic3DCard className="perspective-1000">
                    <Link to={`/categories/${c.slug}`} className="group block">
                      <div className="relative overflow-hidden aspect-[4/5] mb-6 bg-ivory-deep img-fit">
                        {c.image_url ? (
                          <>
                            <motion.img src={c.image_url} alt={c.name} whileHover={{ scale: 1.07 }} transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }} loading="lazy" />
                            <motion.div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/80 via-maroon/20 to-transparent" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.5 }} />
                            <motion.div className="absolute bottom-6 left-6 right-6" initial={{ y: 20, opacity: 0 }} whileHover={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, type: "spring", stiffness: 300 }}>
                              <span className="font-display text-[8px] tracking-[0.4em] uppercase text-gold bg-maroon-deep/80 px-4 py-2 backdrop-blur-md">Explore</span>
                            </motion.div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs font-body uppercase tracking-widest">No image</div>
                        )}
                        <div className="absolute inset-0 border border-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 m-4 pointer-events-none" />
                      </div>
                      <div className="flex items-start justify-between">
                        <div style={{ transform: "translateZ(30px)" }}>
                          <p className="eyebrow text-gold-dark mb-2">No. {String(i + 1).padStart(2, "0")}</p>
                          <h3 className="font-heading text-3xl text-ink group-hover:text-maroon transition-colors duration-300">{c.name}</h3>
                          {c.description && <p className="text-sm text-ink-soft mt-2 font-body leading-relaxed line-clamp-2">{c.description}</p>}
                        </div>
                        <motion.div className="mt-2 w-8 h-8 border border-gold/30 flex items-center justify-center rounded-full" whileHover={{ rotate: 45, backgroundColor: "hsl(var(--gold)/0.1)" }} transition={{ duration: 0.3 }}>
                          <ArrowRight size={12} className="text-gold-dark" />
                        </motion.div>
                      </div>
                    </Link>
                  </Magnetic3DCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STORY - Scrollytelling */}
      <section ref={storyRef} className="relative bg-maroon-deep overflow-hidden py-32 lg:py-44">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold/10 rounded-full pointer-events-none animate-pulse-glow" />

        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 overflow-hidden">
              <motion.div style={{ y: storyImgY }} className="relative">
                <div className="aspect-[4/5] overflow-hidden rounded-sm">
                  <img src={craftImg} alt="Folded silk sarees" className="w-full h-full object-cover scale-110" loading="lazy" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-gold/20 pointer-events-none" />
                <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8, type: "spring" }} className="absolute -bottom-8 -left-6 glass-card p-6">
                  <p className="font-heading text-5xl text-maroon-deep leading-none">40+</p>
                  <p className="font-body text-xs text-ink-soft uppercase tracking-widest mt-1">Years of craft</p>
                </motion.div>
              </motion.div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-gold" />
                <span className="eyebrow text-gold">Our Story</span>
              </motion.div>

              <h2 className="text-display text-4xl md:text-5xl lg:text-6xl text-ivory mb-8 leading-[1.0]">
                <RevealWords text="Four decades of cloth," className="text-ivory" />
                <br />
                <span className="italic"><RevealWords text="conversation & craft." className="text-gold" delay={0.2} /></span>
              </h2>

              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-px bg-gradient-to-r from-gold to-transparent mb-8 origin-left" />

              {[
                "What began as a small store in Kanchipuram in 1985, Arpitha Saree Center is today a trusted destination for those who know that a Kanchipuram silk saree is more than a garment — it's a legacy woven in pure mulberry silk and real zari.",
                "We source directly from master weavers of Kanchipuram, preserving centuries-old techniques — every saree GI-certified, every thread authentic.",
              ].map((para, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.15, duration: 0.8 }} className="text-ivory/90 font-body leading-relaxed mb-5 text-[15px]">
                  {para}
                </motion.p>
              ))}

               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8 }} className="grid grid-cols-3 gap-6 my-10 border-t border-b border-ivory/10 py-8 relative">
                <div className="absolute inset-0 bg-gold/5 blur-xl pointer-events-none" />
                {[["1985", "Est."], ["12+", "Weaving regions"], ["5000+", "Sarees curated"]].map(([num, label]) => (
                  <div key={label} className="relative z-10">
                    <p className="font-heading text-3xl text-gold leading-none">{num}</p>
                    <p className="font-body text-[10px] text-ivory/65 uppercase tracking-widest mt-1">{label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }}>
                <Link to="/about" className="link-reveal font-display text-[9px] tracking-[0.35em] uppercase text-gold">Read the full story →</Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="py-32 lg:py-44 bg-ivory">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="flex items-end justify-between mb-16 gap-6 flex-wrap">
              <div>
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-px bg-gold-dark" />
                  <span className="eyebrow text-gold-dark">New In</span>
                </motion.div>
                <h2 className="text-display text-5xl md:text-6xl text-ink">
                  <RevealWords text="Fresh from the loom." />
                </h2>
              </div>
              <Link to="/shop" className="link-reveal font-display text-[9px] tracking-[0.3em] uppercase text-maroon">Shop all →</Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-16">
              {featuredProducts.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.07, duration: 0.8, type: "spring", stiffness: 100 }}>
                  <Link to={`/shop/${p.slug}`} className="group block relative">
                    <div className="absolute inset-0 bg-gold/5 blur-2xl scale-0 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                    <div className="relative overflow-hidden aspect-[3/4] mb-5 bg-ivory-deep border border-gold/10">
                      {p.image_url ? (
                        <>
                          <motion.img src={p.image_url} alt={p.name} className="w-full h-full object-cover" whileHover={{ scale: 1.06 }} transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }} loading="lazy" />
                          <motion.div className="absolute inset-0 bg-maroon-deep/40" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.4 }} />
                          <motion.div className="absolute bottom-4 left-0 right-0 text-center" initial={{ y: 20, opacity: 0 }} whileHover={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, type: "spring" }}>
                            <span className="font-display text-[8px] tracking-[0.4em] uppercase text-ivory glass-card-dark border-none px-4 py-2">Quick view</span>
                          </motion.div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs font-body uppercase tracking-widest">No image</div>
                      )}
                    </div>
                    <h3 className="font-heading text-xl text-ink group-hover:text-maroon transition-colors leading-tight">{p.name}</h3>
                    <p className="font-body text-sm text-gold-dark mt-1">₹{Number(p.price).toLocaleString("en-IN")}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST STRIP */}
      <section className="bg-ivory-deep py-20 border-y border-gold/15 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(hsl(var(--gold))_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gold/15">
            {[
              { icon: Sparkles, title: "Handwoven & sourced", desc: "Direct from master weavers, ethically priced and fairly traded." },
              { icon: Shield, title: "Authenticity, certified", desc: "Each piece verified by our in-house textile team before listing." },
              { icon: Truck, title: "Insured, tracked delivery", desc: "Pan-India shipping with care. Free above ₹5,000." },
            ].map((t, i) => (
              <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7, type: "spring" }} className="flex items-start gap-5 px-10 py-8 group">
                <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="w-10 h-10 border border-gold/30 flex items-center justify-center shrink-0 mt-1 bg-ivory rounded-full group-hover:border-gold transition-colors">
                  <t.icon size={16} className="text-gold-dark" strokeWidth={1.2} />
                </motion.div>
                <div>
                  <h3 className="font-heading text-xl text-ink mb-1.5">{t.title}</h3>
                  <p className="text-sm text-ink-soft font-body leading-relaxed">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 lg:py-44 bg-maroon-deep overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

        <div className="container mx-auto px-6 text-center max-w-2xl relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold/40" />
            <span className="eyebrow text-gold">Visit Arpitha Saree Center</span>
            <div className="w-8 h-px bg-gold/40" />
          </motion.div>

          <h2 className="text-display text-4xl md:text-6xl text-ivory mb-8 leading-[1.0]">
            <RevealWords text="A saree is best" className="text-ivory" />
            <br />
            <span className="italic"><RevealWords text="chosen in person." className="text-gold/90" delay={0.2} /></span>
          </h2>

          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="text-ivory/85 font-body mb-12 leading-relaxed">
            Step into Arpitha Saree Center in Kanchipuram and experience the joy of choosing your pure silk saree in person — feel the zari, touch the silk, and find the one that's truly yours.
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, type: "spring" }}>
            <Link to="/contact" className="btn-liquid border border-gold/50 text-gold px-10 py-4 font-display text-[9px] tracking-[0.35em] uppercase inline-flex items-center gap-3 hover:text-maroon-deep transition-colors duration-500 group">
              Get directions
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
