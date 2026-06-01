import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, Settings, ShoppingBag,
  Package, User, Home, Store, Grid2X2, Info, Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

const NAV_LINKS = [
  { to: "/",           label: "Home",        icon: Home     },
  { to: "/shop",       label: "Shop",        icon: Store    },
  { to: "/categories", label: "Collections", icon: Grid2X2  },
  { to: "/about",      label: "About",       icon: Info     },
  { to: "/contact",    label: "Contact",     icon: Phone    },
];

/* ─── Drawer slide-from-LEFT for easy one-thumb reach ─── */
const DRAWER_VARIANTS = {
  hidden:  { x: "-100%", opacity: 0 },
  visible: { x: 0,       opacity: 1, transition: { type: "spring", stiffness: 320, damping: 34 } },
  exit:    { x: "-100%", opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
};

const Navbar = () => {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser]         = useState<any>(null);
  const [isAdmin, setIsAdmin]   = useState(false);
  const location                = useLocation();
  const navigate                = useNavigate();
  const { count }               = useCart();
  const drawerRef               = useRef<HTMLElement>(null);
  const firstFocusRef           = useRef<HTMLButtonElement>(null);

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

  /* ── body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ── close on route change ── */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  /* ── focus trap: move focus into drawer when opened ── */
  useEffect(() => {
    if (open) {
      // small delay so AnimatePresence has rendered the node
      const t = setTimeout(() => firstFocusRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ── keyboard: Escape closes drawer ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && open) setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* ── swipe-to-close (left swipe) ── */
  useEffect(() => {
    if (!open) return;
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd   = (e: TouchEvent) => {
      if (startX - e.changedTouches[0].clientX > 60) setOpen(false);
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend",   onTouchEnd);
    };
  }, [open]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setIsAdmin(false); setOpen(false); navigate("/");
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "U";
  const drawerId    = "mobile-nav-drawer";

  return (
    <>
      {/* ══════════════ TOP BAR ══════════════ */}
      <motion.header
        role="banner"
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
            <Link
              to="/"
              aria-label="Arpitha Saree Center – Home"
              className="group flex flex-col leading-none"
              onClick={() => setOpen(false)}
            >
              <span className="font-display text-[9px] tracking-[0.5em] text-gold-dark uppercase">Since 1985</span>
              <span className="font-heading text-[1.75rem] lg:text-3xl text-ink font-light tracking-tight leading-none mt-0.5">
                Arpitha
              </span>
              <span className="hidden sm:block font-body text-[7px] tracking-[0.4em] text-ink-soft uppercase mt-0.5">
                Saree Center · Kanchipuram
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="relative py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm">
                  <span className={`font-display text-[9px] tracking-[0.3em] uppercase transition-colors duration-300 ${
                    location.pathname === l.to ? "text-gold-dark" : "text-ink hover:text-maroon"
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
              ))}
            </nav>

            {/* ── Actions ── */}
            <div className="flex items-center gap-1">
              {user ? (
                <>
                  <Link
                    to="/orders"
                    aria-label="My orders"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink hover:text-maroon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                  >
                    <Package size={13} strokeWidth={1.5} aria-hidden="true" /> Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      aria-label="Admin panel"
                      className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-gold-dark hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                    >
                      <Settings size={13} strokeWidth={1.5} aria-hidden="true" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    aria-label="Sign out"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                  >
                    <LogOut size={13} strokeWidth={1.5} aria-hidden="true" />
                    <span className="sr-only">Sign out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  aria-label="Sign in to your account"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                >
                  <User size={13} strokeWidth={1.5} aria-hidden="true" /> Sign in
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                aria-label={count > 0 ? `Shopping bag, ${count} item${count !== 1 ? "s" : ""}` : "Shopping bag"}
                className="relative p-2.5 ml-1 border border-gold/20 hover:border-gold/50 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <ShoppingBag size={17} strokeWidth={1.2} className="text-ink group-hover:text-maroon transition-colors" aria-hidden="true" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      aria-hidden="true"
                      className="absolute -top-1.5 -right-1.5 bg-maroon-deep text-ivory font-display text-[8px] rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] px-0.5"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Hamburger */}
              <button
                className="lg:hidden flex items-center justify-center w-11 h-11 ml-1 text-ink rounded-sm border border-gold/20 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                onClick={() => setOpen(v => !v)}
                aria-label={open ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={open}
                aria-controls={drawerId}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {open
                    ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90,  opacity: 0 }} transition={{ duration: 0.18 }}><X    size={19} aria-hidden="true" /></motion.span>
                    : <motion.span key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><Menu size={19} aria-hidden="true" /></motion.span>
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
              transition={{ duration: 0.22 }}
              className="lg:hidden fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel — slides from LEFT for easy thumb reach */}
            <motion.aside
              key="drawer"
              id={drawerId}
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              variants={DRAWER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-[80vw] max-w-[320px] bg-ivory flex flex-col shadow-[8px_0_48px_hsl(var(--maroon-deep)/0.18)]"
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gold/15 bg-maroon-deep">
                <div className="flex flex-col">
                  <span className="font-display text-[8px] tracking-[0.45em] text-gold uppercase">Since 1985</span>
                  <span className="font-heading text-2xl text-ivory font-light leading-tight">Arpitha</span>
                </div>
                <button
                  ref={firstFocusRef}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-10 h-10 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-ivory/50 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  aria-label="Close navigation menu"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* ── User strip ── */}
              <div className="px-5 py-3.5 border-b border-gold/10 bg-ivory-deep/60">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-maroon-deep flex items-center justify-center shrink-0" aria-hidden="true">
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
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                  >
                    <div className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:border-maroon transition-colors" aria-hidden="true">
                      <User size={15} className="text-ink-soft group-hover:text-maroon transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-body text-sm text-ink group-hover:text-maroon transition-colors font-medium">Sign in</p>
                      <p className="font-body text-[11px] text-ink-soft">Orders &amp; wishlist</p>
                    </div>
                  </Link>
                )}
              </div>

              {/* ── Nav links ── */}
              <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-4 py-4">
                <p className="px-2 mb-2 font-display text-[8px] tracking-[0.3em] uppercase text-ink-soft/50">Menu</p>
                {NAV_LINKS.map((l, i) => {
                  const active = location.pathname === l.to;
                  const Icon = l.icon;
                  return (
                    <motion.div
                      key={l.to}
                      initial={{ x: -24, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.03 + i * 0.045, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        to={l.to}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                          active
                            ? "bg-maroon-deep/8 border border-maroon/20"
                            : "hover:bg-ivory-deep border border-transparent"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex items-center justify-center w-9 h-9 rounded-sm transition-colors shrink-0 ${
                            active ? "bg-maroon-deep text-ivory" : "bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8"
                          }`}
                        >
                          <Icon size={16} strokeWidth={1.5} />
                        </span>
                        <span className={`font-heading text-[1.35rem] leading-none transition-colors ${
                          active ? "text-maroon-deep font-medium" : "text-ink group-hover:text-maroon"
                        }`}>
                          {l.label}
                        </span>
                        {active && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-maroon-deep shrink-0" aria-hidden="true" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* ── Quick Access ── */}
                <div className="mt-5 pt-4 border-t border-gold/15">
                  <p className="px-2 mb-2 font-display text-[8px] tracking-[0.3em] uppercase text-ink-soft/50">Quick Access</p>

                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    aria-label={count > 0 ? `Shopping bag, ${count} item${count !== 1 ? "s" : ""}` : "Shopping bag"}
                    className="flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span aria-hidden="true" className="flex items-center justify-center w-9 h-9 rounded-sm bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8 transition-colors shrink-0">
                      <ShoppingBag size={16} strokeWidth={1.5} />
                    </span>
                    <span className="font-heading text-[1.35rem] text-ink group-hover:text-maroon leading-none transition-colors">Bag</span>
                    {count > 0 && (
                      <span aria-hidden="true" className="ml-auto bg-maroon-deep text-ivory font-display text-[8px] rounded-full flex items-center justify-center min-w-[22px] min-h-[22px] px-1">
                        {count}
                      </span>
                    )}
                  </Link>

                  {user && (
                    <Link
                      to="/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <span aria-hidden="true" className="flex items-center justify-center w-9 h-9 rounded-sm bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8 transition-colors shrink-0">
                        <Package size={16} strokeWidth={1.5} />
                      </span>
                      <span className="font-heading text-[1.35rem] text-ink group-hover:text-maroon leading-none transition-colors">My Orders</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <span aria-hidden="true" className="flex items-center justify-center w-9 h-9 rounded-sm bg-gold/10 text-gold-dark group-hover:bg-gold/20 transition-colors shrink-0">
                        <Settings size={16} strokeWidth={1.5} />
                      </span>
                      <span className="font-heading text-[1.35rem] text-gold-dark group-hover:text-maroon leading-none transition-colors">Admin Panel</span>
                    </Link>
                  )}
                </div>
              </nav>

              {/* ── Footer ── */}
              <div className="px-5 py-4 border-t border-gold/15 bg-ivory-deep/40">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 border border-gold/25 text-ink-soft hover:text-maroon hover:border-maroon/40 transition-colors rounded-sm font-display text-[8px] tracking-[0.3em] uppercase min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <LogOut size={13} strokeWidth={1.5} aria-hidden="true" /> Sign Out
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-maroon-deep text-ivory font-display text-[8px] tracking-[0.3em] uppercase rounded-sm hover:bg-maroon transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <User size={13} strokeWidth={1.5} aria-hidden="true" /> Sign In
                  </Link>
                )}
                <p className="text-center font-body text-[10px] text-ink-soft/40 mt-3">
                  Arpitha Saree Center · Kanchipuram
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
