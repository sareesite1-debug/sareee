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
import heroImg from "@/assets/hero-editorial.jpg";
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
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
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
  <div className="overflow-hidden border-y border-gold/20 py-4 bg-emerald-deep">
    <div className="marquee-track">
      {[...Array(3)].map((_, r) => (
        <div key={r} className="flex items-center gap-12 pr-12">
          {["Banarasi Silks", "Kanjivaram", "Maheshwari", "Chanderi", "Handloom Cotton", "Bridal Trousseaux", "Est. 1985 · Mysore"].map((t, i) => (
            <span key={i} className="flex items-center gap-6 whitespace-nowrap">
              <span className="eyebrow text-ivory/50 tracking-[0.4em]">{t}</span>
              <span className="text-gold/40 text-lg">◈</span>
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

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Record<string, any>>({});

  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const { scrollYProgress: storyScroll } = useScroll({ target: storyRef, offset: ["start end", "end start"] });
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.08]);
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

  const handleHeroMouse = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    const el = document.getElementById("hero-content");
    if(el) el.style.transform = `translate(${x}px, ${y}px)`;
  };

  return (
    <div className="bg-ivory overflow-x-hidden">
      <ScrollProgressLine />

      {/* HERO */}
      <section ref={heroRef} onMouseMove={handleHeroMouse} className="relative h-screen min-h-[700px] overflow-hidden flex items-center perspective-1000">
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          <img src={heroImg} alt="Handwoven silk saree" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep/85 via-emerald-deep/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/60 via-transparent to-transparent" />
        </motion.div>

        <div className="absolute right-[10%] top-[20%] w-96 h-96 rounded-full bg-gold/5 blur-[80px] pointer-events-none animate-float-orb" />

        <motion.div id="hero-content" className="relative z-10 container mx-auto px-8 lg:px-16 transition-transform duration-700 ease-out preserve-3d" style={{ opacity: heroOpacity }}>
          <div className="max-w-3xl" style={{ transform: "translateZ(50px)" }}>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-gold" />
              <span className="eyebrow text-gold">{hero.eyebrow || "Since 1985 · Mysore, Karnataka"}</span>
            </motion.div>

            <div className="mb-8">
              <h1 className="text-display text-[clamp(3rem,7vw,6rem)] text-ivory leading-[1.0]">
                <RevealWords text={hero.heading || "Sarees that hold"} delay={0.4} />
                <br />
                <span className="italic"><RevealWords text="a thousand stories." delay={0.6} /></span>
              </h1>
            </div>

            <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 1.2, delay: 1, ease: [0.76, 0, 0.24, 1] }} className="w-32 h-px bg-gradient-to-r from-gold to-transparent mb-8 origin-left" />

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }} className="text-ivory/70 text-lg font-body font-light leading-relaxed max-w-xl mb-12">
              {hero.subheading || "Curated heirloom silks, breathable handlooms and bridal creations — each one woven by master artisans across India."}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-wrap items-center gap-6">
              <Link to={hero.cta_link || "/shop"} className="luxury-btn text-emerald-deep group">
                <span className="relative z-10">{hero.cta_label || "Discover the Edit"}</span>
                <ArrowRight size={13} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/categories" className="link-reveal font-display text-[9px] tracking-[0.35em] uppercase text-ivory/80 hover:text-ivory">
                Explore Collections
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40, rotateX: 15 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1, delay: 1.6, ease: [0.16, 1, 0.3, 1] }} className="absolute bottom-12 right-8 hidden lg:block perspective-800">
          <div className="glass-card-dark p-5 max-w-[240px]">
            <p className="eyebrow text-gold mb-2">Featured Weave</p>
            <p className="font-heading text-xl text-ivory leading-tight">Banarasi · Emerald & Antique Gold</p>
            <div className="mt-3 h-px bg-gold/30" />
            <p className="font-body text-[11px] text-ivory/50 mt-3 uppercase tracking-widest">Handwoven · 6 yards</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="eyebrow text-ivory/30">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ChevronDown size={16} className="text-gold/50" />
          </motion.div>
        </motion.div>
      </section>

      {promo.banner_text && (
        <div className="bg-emerald-deep text-ivory py-3 text-center border-b border-gold/10">
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
              <Link to="/categories" className="link-reveal font-display text-[9px] tracking-[0.3em] uppercase text-emerald">View all collections →</Link>
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
                            <motion.div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 via-emerald-deep/20 to-transparent" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.5 }} />
                            <motion.div className="absolute bottom-6 left-6 right-6" initial={{ y: 20, opacity: 0 }} whileHover={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, type: "spring", stiffness: 300 }}>
                              <span className="font-display text-[8px] tracking-[0.4em] uppercase text-gold bg-emerald-deep/80 px-4 py-2 backdrop-blur-md">Explore</span>
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
                          <h3 className="font-heading text-3xl text-ink group-hover:text-emerald transition-colors duration-300">{c.name}</h3>
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
      <section ref={storyRef} className="relative bg-emerald-deep overflow-hidden py-32 lg:py-44">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold/5 rounded-full pointer-events-none" />
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
                  <p className="font-heading text-5xl text-emerald-deep leading-none">40+</p>
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
                <span className="italic"><RevealWords text="conversation & craft." className="text-gold/80" delay={0.2} /></span>
              </h2>

              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-px bg-gradient-to-r from-gold to-transparent mb-8 origin-left" />

              {[
                "What began as a small Mysore boutique in 1985 is today a quiet sanctuary for women who believe a saree is more than a garment — it's an inheritance, a confession of taste, a slow craft worth knowing by name.",
                "We work directly with weavers in Banaras, Kanchipuram, Maheshwar and beyond — paying fairly, ordering small, and returning year after year.",
              ].map((para, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.15, duration: 0.8 }} className="text-ivory/65 font-body leading-relaxed mb-5 text-[15px]">
                  {para}
                </motion.p>
              ))}

               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8 }} className="grid grid-cols-3 gap-6 my-10 border-t border-b border-ivory/10 py-8 relative">
                <div className="absolute inset-0 bg-gold/5 blur-xl pointer-events-none" />
                {[["1985", "Est."], ["12+", "Weaving regions"], ["5000+", "Sarees curated"]].map(([num, label]) => (
                  <div key={label} className="relative z-10">
                    <p className="font-heading text-3xl text-gold leading-none">{num}</p>
                    <p className="font-body text-[10px] text-ivory/40 uppercase tracking-widest mt-1">{label}</p>
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
              <Link to="/shop" className="link-reveal font-display text-[9px] tracking-[0.3em] uppercase text-emerald">Shop all →</Link>
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
                          <motion.div className="absolute inset-0 bg-emerald-deep/40" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.4 }} />
                          <motion.div className="absolute bottom-4 left-0 right-0 text-center" initial={{ y: 20, opacity: 0 }} whileHover={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, type: "spring" }}>
                            <span className="font-display text-[8px] tracking-[0.4em] uppercase text-ivory glass-card-dark border-none px-4 py-2">Quick view</span>
                          </motion.div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs font-body uppercase tracking-widest">No image</div>
                      )}
                    </div>
                    <h3 className="font-heading text-xl text-ink group-hover:text-emerald transition-colors leading-tight">{p.name}</h3>
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
      <section className="relative py-32 lg:py-44 bg-emerald-deep overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[600, 800, 1000].map((size, i) => (
            <motion.div key={size} animate={{ rotate: i % 2 === 0 ? 360 : -360 }} transition={{ duration: 50 + i * 10, repeat: Infinity, ease: "linear" }} className="absolute border border-gold/5 rounded-full" style={{ width: size, height: size }} />
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

        <div className="container mx-auto px-6 text-center max-w-2xl relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold/40" />
            <span className="eyebrow text-gold">Visit us in Mysore</span>
            <div className="w-8 h-px bg-gold/40" />
          </motion.div>

          <h2 className="text-display text-4xl md:text-6xl text-ivory mb-8 leading-[1.0]">
            <RevealWords text="A saree is best" className="text-ivory" />
            <br />
            <span className="italic"><RevealWords text="chosen in person." className="text-gold/90" delay={0.2} /></span>
          </h2>

          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="text-ivory/60 font-body mb-12 leading-relaxed">
            Step into our flagship boutique at Gangotri Layout for a personalised consultation, a cup of filter coffee, and the slow joy of choosing in candlelight.
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, type: "spring" }}>
            <Link to="/contact" className="btn-liquid border border-gold/50 text-gold px-10 py-4 font-display text-[9px] tracking-[0.35em] uppercase inline-flex items-center gap-3 hover:text-emerald-deep transition-colors duration-500 group">
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
