import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, Settings, ShoppingBag,
  Package, User, Home, Store, Grid2X2, Info, Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";

const NAV_LINKS = [
  { to: "/",           label: "Home",        icon: Home    },
  { to: "/shop",       label: "Shop",        icon: Store   },
  { to: "/categories", label: "Collections", icon: Grid2X2 },
  { to: "/about",      label: "About",       icon: Info    },
  { to: "/contact",    label: "Contact",     icon: Phone   },
];

const Navbar = () => {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser]         = useState<any>(null);
  const [isAdmin, setIsAdmin]   = useState(false);

  const location  = useLocation();
  const navigate  = useNavigate();
  const { count } = useCart();
  const xBtnRef   = useRef<HTMLButtonElement>(null);

  // ── stable callbacks ────────────────────────────────────────────────────────
  const close = useCallback(() => setOpen(false), []);
  const open_ = useCallback(() => setOpen(true),  []);

  // ── scroll detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── auth ────────────────────────────────────────────────────────────────────
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

  // ── body scroll lock ────────────────────────────────────────────────────────
  // We only toggle overflow — do NOT use position:fixed on body because it
  // shifts the layout coordinate space and breaks tap targets on the backdrop
  // and X button. The drawer itself already has pointer-events correctly layered.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── close on route change ───────────────────────────────────────────────────
  const pathnameRef = useRef(location.pathname);
  useEffect(() => {
    if (pathnameRef.current !== location.pathname) {
      pathnameRef.current = location.pathname;
      setOpen(false);
    }
  }, [location.pathname]);

  // ── Escape key ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  // ── focus X button when drawer opens ────────────────────────────────────────
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => xBtnRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ── swipe-left to close (horizontal swipe only) ──────────────────────────────
  useEffect(() => {
    if (!open) return;
    let startX = 0;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = startX - e.changedTouches[0].clientX;
      const dy = Math.abs(e.changedTouches[0].clientY - startY);
      if (dx > 60 && dx > dy * 2) close();   // clearly horizontal leftward swipe
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend",   onEnd);
    };
  }, [open, close]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setIsAdmin(false); close(); navigate("/");
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      {/* ══ NAVBAR ══ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 bg-ivory/95 backdrop-blur-2xl border-b border-gold/10 ${
          scrolled ? "shadow-[0_2px_40px_-12px_hsl(var(--maroon-deep)/0.2)]" : ""
        }`}
      >
        <div className="container mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between py-4 lg:py-5">

            {/* Logo */}
            <Link to="/" aria-label="Arpitha Saree Center – Home" className="flex flex-col leading-none">
              <span className="font-display text-[9px] tracking-[0.5em] text-gold-dark uppercase">Since 1985</span>
              <span className="font-heading text-[1.75rem] lg:text-3xl text-ink font-light tracking-tight leading-none mt-0.5">
                Arpitha
              </span>
              <span className="hidden sm:block font-body text-[7px] tracking-[0.4em] text-ink-soft uppercase mt-0.5">
                Saree Center · Kanchipuram
              </span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="relative py-2">
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

            {/* Actions */}
            <div className="flex items-center gap-1">
              {user ? (
                <>
                  <Link to="/orders" aria-label="My orders" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink hover:text-maroon transition-colors">
                    <Package size={13} strokeWidth={1.5} aria-hidden="true" /> Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" aria-label="Admin panel" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-gold-dark hover:text-maroon">
                      <Settings size={13} strokeWidth={1.5} aria-hidden="true" /> Admin
                    </Link>
                  )}
                  <button onClick={handleSignOut} aria-label="Sign out" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink-soft hover:text-ink">
                    <LogOut size={13} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </>
              ) : (
                <Link to="/auth" className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 font-display text-[8px] tracking-[0.25em] uppercase text-ink hover:text-maroon">
                  <User size={13} strokeWidth={1.5} aria-hidden="true" /> Sign in
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                aria-label={count > 0 ? `Shopping bag, ${count} item${count !== 1 ? "s" : ""}` : "Shopping bag"}
                className="relative p-2.5 ml-1 border border-gold/20 hover:border-gold/50 transition-all duration-300 group"
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
                className="lg:hidden flex items-center justify-center w-11 h-11 ml-1 text-ink border border-gold/20 active:scale-95 transition-transform"
                onClick={open_}
                aria-label="Open navigation menu"
                aria-expanded={open}
                aria-controls="mobile-nav"
              >
                <Menu size={19} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══ MOBILE DRAWER ══
          Both backdrop and drawer use fixed positioning inside a React portal-like
          fragment. The backdrop sits at z-[60], drawer at z-[70] so the drawer is
          always on top and its buttons receive pointer events first.
          IMPORTANT: do NOT set position:fixed on <body> — it moves the layout
          coordinate system and makes fixed children miss click/touch targets.       */}
      <AnimatePresence>
        {open && (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden fixed inset-0 z-[60] bg-black/50"
              onClick={close}
              onTouchEnd={(e) => { e.preventDefault(); close(); }}
              aria-hidden="true"
            />

            {/* ── Drawer panel ── */}
            <motion.aside
              key="drawer"
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 38 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-[80vw] max-w-[300px] bg-ivory flex flex-col"
              onClick={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gold/15 bg-maroon-deep shrink-0">
                <div className="flex flex-col">
                  <span className="font-display text-[8px] tracking-[0.45em] text-gold uppercase">Since 1985</span>
                  <span className="font-heading text-2xl text-ivory font-light leading-tight">Arpitha</span>
                </div>
                <button
                  ref={xBtnRef}
                  onClick={close}
                  aria-label="Close navigation menu"
                  className="flex items-center justify-center w-10 h-10 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-ivory/50 transition-colors rounded-sm"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* User strip */}
              <div className="px-5 py-3.5 border-b border-gold/10 bg-ivory-deep/60 shrink-0">
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
                  <Link to="/auth" onClick={close} className="flex items-center gap-3 group">
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

              {/* Nav links */}
              <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-4 py-4">
                <p className="px-2 mb-2 font-display text-[8px] tracking-[0.3em] uppercase text-ink-soft/50">Menu</p>

                {NAV_LINKS.map((l) => {
                  const active = location.pathname === l.to;
                  const Icon   = l.icon;
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 transition-all duration-150 group ${
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
                        active ? "text-maroon-deep" : "text-ink group-hover:text-maroon"
                      }`}>
                        {l.label}
                      </span>
                      {active && <span className="ml-auto w-2 h-2 rounded-full bg-maroon-deep shrink-0" aria-hidden="true" />}
                    </Link>
                  );
                })}

                {/* Quick access */}
                <div className="mt-5 pt-4 border-t border-gold/15">
                  <p className="px-2 mb-2 font-display text-[8px] tracking-[0.3em] uppercase text-ink-soft/50">Quick Access</p>

                  <Link
                    to="/cart"
                    onClick={close}
                    aria-label={count > 0 ? `Shopping bag, ${count} item${count !== 1 ? "s" : ""}` : "Shopping bag"}
                    className="flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-150 group"
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
                      onClick={close}
                      className="flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-150 group"
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
                      onClick={close}
                      className="flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-150 group"
                    >
                      <span aria-hidden="true" className="flex items-center justify-center w-9 h-9 rounded-sm bg-gold/10 text-gold-dark group-hover:bg-gold/20 transition-colors shrink-0">
                        <Settings size={16} strokeWidth={1.5} />
                      </span>
                      <span className="font-heading text-[1.35rem] text-gold-dark group-hover:text-maroon leading-none transition-colors">Admin Panel</span>
                    </Link>
                  )}
                </div>
              </nav>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gold/15 bg-ivory-deep/40 shrink-0">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 border border-gold/25 text-ink-soft hover:text-maroon hover:border-maroon/40 transition-colors rounded-sm font-display text-[8px] tracking-[0.3em] uppercase"
                  >
                    <LogOut size={13} strokeWidth={1.5} aria-hidden="true" /> Sign Out
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={close}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-maroon-deep text-ivory font-display text-[8px] tracking-[0.3em] uppercase rounded-sm hover:bg-maroon transition-colors"
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
