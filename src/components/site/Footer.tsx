import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useInView, useSpring } from "framer-motion";
import { MapPin, Phone, Mail, Globe, PhoneCall, Send } from "lucide-react";
import { BRAND } from "@/lib/brand";

const MagneticIcon = ({ Icon, href }: { Icon: any; href: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });
  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  return (
    <motion.a ref={ref} href={href} onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ x, y }} whileHover={{ scale: 1.1 }}
      className="group w-10 h-10 border border-ivory/10 flex items-center justify-center text-ivory/30 hover:border-gold/50 hover:text-gold transition-colors duration-500">
      <Icon size={14} strokeWidth={1.2} />
    </motion.a>
  );
};

const Footer = () => {
  const year = new Date().getFullYear();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const cV = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
  const iV = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <footer className="bg-ink text-ivory relative overflow-hidden pb-10 border-t border-gold/20">
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="border-b border-ivory/5 overflow-hidden py-3">
        <div className="marquee-track">
          {[...Array(4)].map((_, r) => (
            <div key={r} className="flex items-center gap-10 pr-10">
              {["Heirloom Silks", "Handwoven", "Est. 1985", "Mysore, India", "Artisan Crafted", "Ethically Sourced"].map((t, i) => (
                <span key={i} className="flex items-center gap-6 whitespace-nowrap">
                  <span className="eyebrow text-ivory/60 tracking-[0.4em]">{t}</span>
                  <span className="text-gold/50">◈</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <motion.div ref={ref} variants={cV} initial="hidden" animate={inView ? "visible" : "hidden"} className="container mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-14">
          <div className="md:col-span-4">
            <motion.div variants={iV}>
              <Link to="/" className="block mb-7 group">
                <span className="font-display text-[9px] tracking-[0.5em] text-gold/60 uppercase">Since 1985</span>
                <div className="font-heading text-4xl text-ivory font-light tracking-tight leading-none mt-1.5">Arpitha</div>
                <div className="font-body text-[8px] tracking-[0.4em] text-ivory/65 uppercase mt-1.5">Saree Center · Kanchipuram</div>
              </Link>
              <p className="text-sm text-ivory/80 leading-relaxed font-body font-light max-w-sm mb-8">Pure Kanchipuram silk sarees — GI certified, handwoven by master craftsmen, and delivered to your door since 1985.</p>
              <motion.div className="h-px bg-gold/15 mb-7" initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 1.2, delay: 0.5, ease: [0.76, 0, 0.24, 1] }} style={{ transformOrigin: "left" }} />
              <div className="flex gap-3">
                {[Globe, PhoneCall, Send].map((Icon, i) => <MagneticIcon key={i} Icon={Icon} href="#" />)}
              </div>
            </motion.div>
          </div>
          <div className="md:col-span-2">
            <motion.div variants={iV}>
              <h4 className="eyebrow text-gold mb-6">Shop</h4>
              <div className="flex flex-col gap-3.5">
                {[{ to: "/shop", label: "All Sarees" }, { to: "/categories", label: "Collections" }, { to: "/orders", label: "My Orders" }, { to: "/cart", label: "My Bag" }].map(l => (
                  <Link key={l.to} to={l.to} className="link-reveal text-sm text-ivory/75 hover:text-ivory transition-colors font-body w-fit">{l.label}</Link>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="md:col-span-3">
            <motion.div variants={iV}>
              <h4 className="eyebrow text-gold mb-6">The House</h4>
              <div className="flex flex-col gap-3.5">
                {[{ to: "/about", label: "Our Story" }, { to: "/contact", label: "Visit the Boutique" }, { to: "/contact", label: "Bridal Consultation" }, { to: "/contact", label: "Care & Maintenance" }].map(l => (
                  <Link key={l.label} to={l.to} className="link-reveal text-sm text-ivory/75 hover:text-ivory transition-colors font-body w-fit">{l.label}</Link>
                ))}
              </div>
            </motion.div>
          </div>
          <div className="md:col-span-3">
            <motion.div variants={iV}>
              <h4 className="eyebrow text-gold mb-6">Visit</h4>
              <div className="space-y-4">
                {[{ Icon: MapPin, text: BRAND.address }, { Icon: Phone, text: BRAND.phoneFormatted }, { Icon: Mail, text: BRAND.email }].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5"><Icon size={11} strokeWidth={1.5} className="text-gold/60" /></div>
                    <p className="text-sm text-ivory/80 font-body leading-relaxed break-all">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-ivory/5 pt-6">
                <p className="eyebrow text-ivory/60 mb-3">Boutique Hours</p>
                <p className="font-body text-xs text-ivory/70 leading-relaxed">Mon – Sat: 10:00 AM – 8:00 PM<br />Sunday: 11:00 AM – 6:00 PM</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="border-t border-ivory/5 py-6">
        <div className="container mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-[10px] text-ivory/60 tracking-widest">© {year} {BRAND.name}. Crafted with reverence.</p>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Returns"].map(l => <a key={l} href="#" className="font-body text-[10px] text-ivory/60 hover:text-ivory tracking-widest transition-colors">{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
