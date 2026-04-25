import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, Sparkles } from "lucide-react";
import editorialImg from "@/assets/hero-editorial.jpg";
import craftImg from "@/assets/craft-silks.jpg";

const RevealWords = ({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block relative">
          <motion.span
            className="inline-block"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.85, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
};

const AboutPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  const timelineRef = useRef(null);
  const { scrollYProgress: timelineScroll } = useScroll({ target: timelineRef, offset: ["start center", "end center"] });
  const lineScale = useTransform(timelineScroll, [0, 1], [0, 1]);

  return (
    <div className="bg-ivory min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden flex items-center bg-emerald-deep text-ivory">
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y, opacity }}>
          <img src={editorialImg} alt="Arpitha Saree Center History" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-transparent to-transparent" />
        </motion.div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-10 relative z-10 text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="eyebrow text-gold">Est. 1985 · Mysore</span>
            <div className="w-12 h-px bg-gold" />
          </motion.div>
          
          <h1 className="text-display text-5xl md:text-7xl mb-8 leading-[1.0]">
            <RevealWords text="A quiet devotion to" />
            <br />
            <span className="italic"><RevealWords text="India's textile heritage." delay={0.2} /></span>
          </h1>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, delay: 0.8, ease: [0.76, 0, 0.24, 1] }} className="w-px h-32 bg-gradient-to-b from-gold to-transparent mx-auto mb-8 origin-top" />
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="animate-bounce">
            <ArrowDown size={20} className="text-gold/50 mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 lg:py-44 container mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-12">
            <Sparkles size={24} className="text-gold mx-auto mb-6" strokeWidth={1} />
            <h2 className="text-display text-4xl md:text-5xl text-ink leading-tight">
              We believe a saree is more than a garment. It is an inheritance, a confession of taste, and a slow craft worth knowing by name.
            </h2>
          </motion.div>
          
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8 }} className="text-ink-soft font-body text-lg leading-relaxed mb-8">
            For nearly four decades, Arpitha Saree Center has been a sanctuary for women who appreciate the nuance of a hand-loomed weave. What began as a small boutique in Mysore has grown into a destination for heirloom silks, breathless handlooms, and bridal trousseaus curated from the most storied weaving regions across India.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.8 }} className="text-ink-soft font-body text-lg leading-relaxed">
            We work directly with master artisans—from the ghats of Banaras to the temple towns of Kanchipuram—paying fairly, ordering small, and returning year after year to support the hands that keep these ancient traditions alive.
          </motion.p>
        </div>
      </section>

      {/* Scrollytelling Parallax Image */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-ink/20 z-10" />
        <motion.div className="absolute inset-0 w-full h-[120%]" style={{ y: useTransform(useScroll().scrollYProgress, [0, 1], ["0%", "-20%"]) }}>
          <img src={craftImg} alt="Craftsmanship" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <h2 className="text-display text-5xl md:text-8xl text-ivory/90 mix-blend-overlay tracking-widest text-center">
            CRAFTED WITH<br/>REVERENCE
          </h2>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="py-32 lg:py-44 bg-ivory relative">
        <div className="container mx-auto px-6 lg:px-10 max-w-5xl relative">
          
          {/* Animated center line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gold/10 -translate-x-1/2">
            <motion.div className="w-full bg-gold origin-top" style={{ scaleY: lineScale, height: "100%" }} />
          </div>

          <div className="text-center mb-24 relative z-10">
            <h2 className="eyebrow text-gold-dark mb-4">Our Journey</h2>
            <p className="text-display text-4xl text-ink">A timeline of tradition.</p>
          </div>

          <div className="space-y-24">
            {[
              { year: "1985", title: "The Beginning", desc: "Founded in a modest space in Gangotri Layout, Mysore, with a vision to bring authentic Kanjivarams to local connoisseurs." },
              { year: "1998", title: "Weaver Collaborations", desc: "Established direct relationships with master weavers in Banaras and Chanderi, cutting out middlemen to ensure fair wages and unparalleled quality." },
              { year: "2010", title: "The Bridal Studio", desc: "Expanded our boutique to include a dedicated bridal consultation space, helping brides curate heirloom trousseaus." },
              { year: "Present", title: "Digital Heritage", desc: "Bringing our carefully curated collections online, sharing the tactile joy of Indian handlooms with a global audience." }
            ].map((item, i) => (
              <div key={item.year} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                {/* Dot */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, type: "spring" }}
                  className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-deep rounded-full border-4 border-ivory z-10"
                />
                
                <div className={`flex-1 text-center md:text-left ${i % 2 === 0 ? "md:text-right" : ""}`}>
                  <motion.div initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
                    <p className="font-display text-6xl text-gold/20 mb-2">{item.year}</p>
                    <h3 className="font-heading text-2xl text-ink mb-3">{item.title}</h3>
                    <p className="text-ink-soft font-body leading-relaxed">{item.desc}</p>
                  </motion.div>
                </div>
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-emerald-deep text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--gold))_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]" />
        <div className="container mx-auto px-6 relative z-10 max-w-2xl">
          <Sparkles size={24} className="text-gold mx-auto mb-8" strokeWidth={1} />
          <h2 className="text-display text-4xl md:text-5xl text-ivory mb-6">Experience the weave.</h2>
          <p className="text-ivory/60 font-body mb-10 leading-relaxed">
            We invite you to explore our collections online or visit our boutique in Mysore for a personal viewing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="btn-emerald bg-gold text-emerald-deep border border-gold hover:bg-transparent hover:text-gold transition-colors">
              Explore Collections
            </Link>
            <Link to="/contact" className="btn-outline-emerald border-gold/50 text-gold hover:border-gold hover:bg-gold/10">
              Visit Boutique
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
