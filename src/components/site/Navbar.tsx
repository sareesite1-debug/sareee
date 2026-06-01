import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Settings, ShoppingBag, Package, User, ChevronRight, Home, Store, Grid2X2, Info, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

const links = [
  { to: "/",           label: "Home",        icon: Home     },
  { to: "/shop",       label: "Shop",        icon: Store    },
  { to: "/categories", label: "Collections", icon: Grid2X2  },
  { to: "/about",      label: "About",       icon: Info     },
  { to: "/contact",    label: "Contact",     icon: Phone    },
];

const Navbar = () => {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser]       = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location              = useLocation();
  const navigate              = useNavigate();
  const { count }             = useCart();

  /* ── scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── auth state ── */
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

  /* ── lock body scroll when drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ── close drawer on route change ── */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setIsAdmin(false); setOpen(false); navigate("/");
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      {/* ══════════════ TOP BAR ══════════════ */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 bg-ivory/95 backdrop-blur-2xl border-b border-gold/10 ${
          scrolled ? "shadow-[0_2px_60px_-20px_hsl(var(--maroon-deep)/0.18)]" : ""
        }`}
      >
        <div className="container mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between py-4 lg:py-5">

            {/* ── Logo ── */}
            <Link to="/" className="group flex flex-col leading-none" onClick={() => setOpen(false)}>
              <motion.span
                className="font-display text-[9px] tracking-[0.5em] text-gold-dark uppercase"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Since 1985
              </motion.span>
              <span className="font-heading text-[1.75rem] lg:text-3xl text-ink font-light tracking-tight leading-none mt-0.5 overflow-hidden">
                {"Arpitha".split("").map((letter, i) => (
                  <motion.span key={i} className="inline-block"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    {letter}
                  </motion.span>
                ))}
              </span>
              <motion.span
                className="hidden sm:block font-body text-[7px] tracking-[0.4em] text-ink-soft uppercase mt-0.5"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
              >
                Saree Center · Kanchipuram
              </motion.span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden lg:flex items-center gap-10">
              {links.map((l, i) => (
                <motion.div key={l.to}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07, duration: 0.5 }}>
                  <Link to={l.to} className="relative py-2">
                    <span className={`font-display text-[9px] tracking-[0.3em] uppercase transition-colors duration-300 ${
                      location.pathname === l.to ? "text-gold-dark" : "text-ink hover:text-maroon"
                    }`}>
                      {l.label}
                    </span>
                    {location.pathname === l.to && (
                      <motion.div layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* ── Actions row ── */}
            <div className="flex items-center gap-1">
              {/* Desktop-only account links */}
              {user ? (
                <>
                  <Link to="/orders" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink hover:text-maroon transition-colors">
                    <Package size={13} strokeWidth={1.5} /> Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-gold-dark hover:text-maroon">
                      <Settings size={13} strokeWidth={1.5} /> Admin
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink-soft hover:text-ink">
                    <LogOut size={13} strokeWidth={1.5} />
                  </button>
                </>
              ) : (
                <Link to="/auth" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink hover:text-maroon">
                  <User size={13} strokeWidth={1.5} /> Sign in
                </Link>
              )}

              {/* Cart — always visible */}
              <Link to="/cart" aria-label="Bag"
                className="relative p-2.5 ml-1 border border-gold/20 hover:border-gold/50 transition-all duration-300 group">
                <ShoppingBag size={17} strokeWidth={1.2} className="text-ink group-hover:text-maroon transition-colors" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 bg-maroon-deep text-ivory font-display text-[8px] rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] px-0.5">
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Hamburger — mobile only */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 ml-1 text-ink rounded-sm border border-gold/20 active:scale-95 transition-transform"
                onClick={() => setOpen(v => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {open
                    ? <motion.span key="x"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={19} /></motion.span>
                    : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu size={19} /></motion.span>
                  }
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ══════════════ MOBILE DRAWER ══════════════ */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel — slides in from right */}
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-[70] w-[82vw] max-w-[340px] bg-ivory flex flex-col shadow-[-8px_0_40px_hsl(var(--maroon-deep)/0.12)]"
              aria-label="Mobile navigation"
            >

              {/* ── Drawer header ── */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gold/15">
                <div className="flex flex-col">
                  <span className="font-display text-[8px] tracking-[0.45em] text-gold-dark uppercase">Since 1985</span>
                  <span className="font-heading text-2xl text-ink font-light leading-tight">Arpitha</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-9 h-9 border border-gold/25 text-ink-soft hover:text-ink hover:border-gold/60 transition-colors rounded-sm"
                  aria-label="Close menu"
                >
                  <X size={17} />
                </button>
              </div>

              {/* ── User identity strip ── */}
              <div className="px-6 py-4 border-b border-gold/10 bg-ivory-deep/40">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-maroon-deep flex items-center justify-center shrink-0">
                      <span className="font-heading text-ivory text-base">{userInitial}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-xs text-ink font-medium truncate">{user.email}</p>
                      <p className="font-display text-[8px] tracking-[0.25em] uppercase text-gold-dark mt-0.5">
                        {isAdmin ? "Admin" : "Customer"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:border-maroon transition-colors">
                      <User size={15} className="text-ink-soft group-hover:text-maroon transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-body text-sm text-ink group-hover:text-maroon transition-colors">Sign in</p>
                      <p className="font-body text-[11px] text-ink-soft">Access your orders & wishlist</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-ink-soft group-hover:text-maroon transition-colors" />
                  </Link>
                )}
              </div>

              {/* ── Nav links ── */}
              <nav className="flex-1 overflow-y-auto px-4 py-3">
                {links.map((l, i) => {
                  const active = location.pathname === l.to;
                  const Icon = l.icon;
                  return (
                    <motion.div key={l.to}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.04 + i * 0.055, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}>
                      <Link
                        to={l.to}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-4 px-3 py-3.5 rounded-sm mb-0.5 transition-all duration-200 group ${
                          active
                            ? "bg-maroon-deep/6 border border-maroon/15"
                            : "hover:bg-ivory-deep/70 border border-transparent"
                        }`}
                      >
                        <span className={`flex items-center justify-center w-8 h-8 rounded-sm transition-colors ${
                          active ? "bg-maroon-deep text-ivory" : "bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8"
                        }`}>
                          <Icon size={15} strokeWidth={1.5} />
                        </span>
                        <span className={`font-heading text-xl leading-none transition-colors ${
                          active ? "text-maroon-deep" : "text-ink group-hover:text-maroon"
                        }`}>
                          {l.label}
                        </span>
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-maroon-deep" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* ── Cart shortcut ── */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.04 + links.length * 0.055, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}>
                  <div className="mt-3 mb-1">
                    <p className="px-3 font-display text-[8px] tracking-[0.3em] uppercase text-gold-dark/70 mb-1">Quick Access</p>
                  </div>
                  <Link to="/cart" onClick={() => setOpen(false)}
                    className="flex items-center gap-4 px-3 py-3.5 rounded-sm mb-0.5 hover:bg-ivory-deep/70 border border-transparent transition-all duration-200 group">
                    <span className="flex items-center justify-center w-8 h-8 rounded-sm bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8 transition-colors">
                      <ShoppingBag size={15} strokeWidth={1.5} />
                    </span>
                    <span className="font-heading text-xl text-ink group-hover:text-maroon leading-none transition-colors">Bag</span>
                    {count > 0 && (
                      <span className="ml-auto bg-maroon-deep text-ivory font-display text-[8px] rounded-full flex items-center justify-center min-w-[20px] min-h-[20px] px-1">
                        {count}
                      </span>
                    )}
                  </Link>

                  {/* My Orders (logged in only) */}
                  {user && (
                    <Link to="/orders" onClick={() => setOpen(false)}
                      className="flex items-center gap-4 px-3 py-3.5 rounded-sm mb-0.5 hover:bg-ivory-deep/70 border border-transparent transition-all duration-200 group">
                      <span className="flex items-center justify-center w-8 h-8 rounded-sm bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8 transition-colors">
                        <Package size={15} strokeWidth={1.5} />
                      </span>
                      <span className="font-heading text-xl text-ink group-hover:text-maroon leading-none transition-colors">My Orders</span>
                    </Link>
                  )}

                  {/* Admin (admin only) */}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)}
                      className="flex items-center gap-4 px-3 py-3.5 rounded-sm mb-0.5 hover:bg-ivory-deep/70 border border-transparent transition-all duration-200 group">
                      <span className="flex items-center justify-center w-8 h-8 rounded-sm bg-gold/10 text-gold-dark group-hover:bg-gold/20 transition-colors">
                        <Settings size={15} strokeWidth={1.5} />
                      </span>
                      <span className="font-heading text-xl text-gold-dark group-hover:text-maroon leading-none transition-colors">Admin Panel</span>
                    </Link>
                  )}
                </motion.div>
              </nav>

              {/* ── Drawer footer ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.4 }}
                className="px-6 py-5 border-t border-gold/15 bg-ivory-deep/30"
              >
                {user ? (
                  <button onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2.5 py-3 border border-gold/25 text-ink-soft hover:text-maroon hover:border-maroon/30 transition-colors rounded-sm font-display text-[8px] tracking-[0.3em] uppercase">
                    <LogOut size={13} strokeWidth={1.5} /> Sign Out
                  </button>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)}
                    className="w-full flex items-center justify-center gap-2.5 py-3 bg-maroon-deep text-ivory font-display text-[8px] tracking-[0.3em] uppercase rounded-sm hover:bg-maroon transition-colors">
                    <User size={13} strokeWidth={1.5} /> Sign In
                  </Link>
                )}
                <p className="text-center font-body text-[10px] text-ink-soft/50 mt-3 tracking-wider">
                  Arpitha Saree Center · Kanchipuram
                </p>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
