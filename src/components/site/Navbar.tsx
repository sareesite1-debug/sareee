import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Menu, X, LogOut, Settings, ShoppingBag, Package, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();

  // Custom cursor
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const move = (e: MouseEvent) => { cursorX.set(e.clientX - 8); cursorY.set(e.clientY - 8); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) supabase.rpc("is_admin").then(({ data }) => setIsAdmin(data === true));
      else setIsAdmin(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) supabase.rpc("is_admin").then(({ data }) => setIsAdmin(data === true));
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setIsAdmin(false); navigate("/");
  };

  return (
    <>
      {/* Custom cursor — main dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference hidden lg:block"
        style={{ x: cursorXSpring, y: cursorYSpring }}
      >
        <div className="w-4 h-4 bg-white rounded-full" />
      </motion.div>

      {/* ── Navbar ── */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 transition-all duration-700 bg-ivory/90 backdrop-blur-2xl border-b border-gold/10 shadow-[0_2px_60px_-20px_hsl(var(--emerald-deep)/0.12)]"
      >
        <div className="container mx-auto px-6 lg:px-10">
          <motion.div
            className="flex items-center justify-between py-5"
            animate={{ height: scrolled ? "auto" : "auto" }}
          >
            {/* ── Logo with staggered letters ── */}
            <Link to="/" className="group flex flex-col leading-none">
              <motion.span
                className="font-display text-[10px] tracking-[0.5em] text-gold-dark uppercase"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Since 1985
              </motion.span>
              <span className="font-heading text-3xl text-ink font-light tracking-tight leading-none mt-0.5 overflow-hidden">
                {"Arpitha".split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
              <motion.span
                className="font-body text-[8px] tracking-[0.4em] text-ink-soft uppercase mt-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Saree · Center · Mysore
              </motion.span>
            </Link>

            {/* ── Desktop nav with animated underline ── */}
            <nav className="hidden lg:flex items-center gap-10">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07, duration: 0.5 }}
                >
                  <Link
                    to={l.to}
                    className="relative py-2"
                  >
                    <span className={`font-display text-[9px] tracking-[0.3em] uppercase transition-colors duration-300 ${
                      location.pathname === l.to ? "text-gold-dark" : "text-ink hover:text-emerald"
                    }`}>
                      {l.label}
                    </span>
                    {location.pathname === l.to && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* ── Actions ── */}
            <div className="flex items-center gap-1">
              {user ? (
                <>
                  <Link to="/orders" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink hover:text-emerald transition-colors">
                    <Package size={13} strokeWidth={1.5} /> Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-gold-dark hover:text-emerald">
                      <Settings size={13} strokeWidth={1.5} /> Admin
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink-soft hover:text-ink">
                    <LogOut size={13} strokeWidth={1.5} />
                  </button>
                </>
              ) : (
                <Link to="/auth" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink hover:text-emerald">
                  <User size={13} strokeWidth={1.5} /> Sign in
                </Link>
              )}

              {/* Cart button with glow */}
              <Link
                to="/cart"
                className="relative p-2.5 ml-1 border border-gold/20 hover:border-gold/50 transition-all duration-300 group border-glow"
                aria-label="Bag"
              >
                <ShoppingBag size={17} strokeWidth={1.2} className="text-ink group-hover:text-emerald transition-colors" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 bg-emerald-deep text-ivory font-display text-[8px] rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] min-h-[18px]"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Mobile menu button */}
              <button className="lg:hidden text-ink p-2.5 ml-1" onClick={() => setOpen(!open)} aria-label="Menu">
                <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.3 }}>
                  {open ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Mobile fullscreen drawer ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:hidden fixed inset-0 top-0 bg-ivory/98 backdrop-blur-2xl z-40"
            >
              <nav className="container mx-auto px-8 pt-28 pb-10 flex flex-col h-full">
                <div className="flex-1 flex flex-col justify-center gap-2">
                  {links.map((l, i) => (
                    <motion.div
                      key={l.to}
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        to={l.to}
                        onClick={() => setOpen(false)}
                        className={`block font-heading text-4xl py-4 border-b border-gold/10 transition-colors ${
                          location.pathname === l.to ? "text-gold-dark" : "text-ink"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          {l.label}
                          <span className="font-display text-[8px] tracking-[0.3em] text-gold/40 uppercase">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="pt-8 border-t border-gold/10 flex flex-col gap-3"
                >
                  {user ? (
                    <>
                      <Link to="/orders" onClick={() => setOpen(false)} className="font-body text-sm py-2 text-ink-soft hover:text-emerald transition-colors">My Orders</Link>
                      {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="font-body text-sm py-2 text-gold-dark hover:text-emerald transition-colors">Admin Panel</Link>}
                      <button onClick={() => { handleSignOut(); setOpen(false); }} className="text-left font-body text-sm py-2 text-ink-soft hover:text-ink transition-colors">Sign Out</button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setOpen(false)} className="font-body text-sm py-2 text-emerald">Sign In</Link>
                  )}
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Navbar;
