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

  // ── open / close ─────────────────────────────────────────────────────────────
  const openSidebar  = useCallback(() => setOpen(true),  []);
  const closeSidebar = useCallback(() => setOpen(false), []);

  /**
   * Navigate to a page AND close the sidebar.
   * We close first so AnimatePresence starts the exit animation,
   * then navigate on the next tick so the page transition doesn't
   * cancel the sidebar slide-out animation mid-way.
   */
  const goTo = useCallback((path: string) => {
    setOpen(false);
    // Small timeout lets the exit animation begin before React
    // unmounts/re-renders the whole layout on navigation
    setTimeout(() => navigate(path), 10);
  }, [navigate]);

  // ── scroll detection ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── auth ─────────────────────────────────────────────────────────────────────
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

  // ── body scroll lock ─────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── close sidebar on route change (safety net) ───────────────────────────────
  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      setOpen(false);
    }
  }, [location.pathname]);

  // ── Escape key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSidebar(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeSidebar]);

  // ── swipe-left to close ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    let sx = 0, sy = 0;
    const onTouchStart = (e: TouchEvent) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const onTouchEnd   = (e: TouchEvent) => {
      const dx = sx - e.changedTouches[0].clientX;
      const dy = Math.abs(e.changedTouches[0].clientY - sy);
      if (dx > 60 && dx > dy * 2) closeSidebar();
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend",   onTouchEnd);
    };
  }, [open, closeSidebar]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setOpen(false);
    navigate("/");
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

              {/* Hamburger — mobile only */}
              <button
                className="lg:hidden flex items-center justify-center w-11 h-11 ml-1 text-ink border border-gold/20 active:scale-95 transition-transform"
                onClick={openSidebar}
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

      {/* ══ MOBILE SIDEBAR ══
          Structure: fixed full-screen wrapper (z-[60]) that captures all clicks.
          Inside: backdrop div (fills wrapper, closes on click) + sidebar panel
          (sits on top, stops propagation so its own clicks don't reach backdrop).
          This is more reliable than two sibling motion elements competing for clicks.
      ══ */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — click anywhere on it to close */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden fixed inset-0 z-[60] bg-black/50"
              onClick={closeSidebar}
              aria-hidden="true"
            />

            {/* Sidebar panel — z higher than backdrop */}
            <motion.aside
              key="sidebar-panel"
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 36 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-[80vw] max-w-[300px] bg-ivory flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >

              {/* ── Sidebar header (maroon band with X button) ── */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gold/15 bg-maroon-deep shrink-0">
                <div className="flex flex-col">
                  <span className="font-display text-[8px] tracking-[0.45em] text-gold uppercase">Since 1985</span>
                  <span className="font-heading text-2xl text-ivory font-light leading-tight">Arpitha</span>
                </div>
                {/* X close button */}
                <button
                  type="button"
                  onClick={closeSidebar}
                  aria-label="Close navigation menu"
                  className="flex items-center justify-center w-10 h-10 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-ivory/50 transition-colors rounded-sm"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* ── User strip ── */}
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
                  <button
                    type="button"
                    onClick={() => goTo("/auth")}
                    className="flex items-center gap-3 group w-full text-left"
                  >
                    <div className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:border-maroon transition-colors" aria-hidden="true">
                      <User size={15} className="text-ink-soft group-hover:text-maroon transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-body text-sm text-ink group-hover:text-maroon transition-colors font-medium">Sign in</p>
                      <p className="font-body text-[11px] text-ink-soft">Orders &amp; wishlist</p>
                    </div>
                  </button>
                )}
              </div>

              {/* ── Nav links ── */}
              <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-4 py-4">
                <p className="px-2 mb-2 font-display text-[8px] tracking-[0.3em] uppercase text-ink-soft/50">Menu</p>

                {NAV_LINKS.map((l) => {
                  const active = location.pathname === l.to;
                  const Icon   = l.icon;
                  return (
                    <button
                      key={l.to}
                      type="button"
                      onClick={() => goTo(l.to)}
                      aria-current={active ? "page" : undefined}
                      className={`w-full flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 transition-all duration-150 group ${
                        active
                          ? "bg-maroon-deep/8 border border-maroon/20"
                          : "hover:bg-ivory-deep border border-transparent"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex items-center justify-center w-9 h-9 rounded-sm transition-colors shrink-0 ${
                          active
                            ? "bg-maroon-deep text-ivory"
                            : "bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8"
                        }`}
                      >
                        <Icon size={16} strokeWidth={1.5} />
                      </span>
                      <span className={`font-heading text-[1.35rem] leading-none transition-colors ${
                        active ? "text-maroon-deep" : "text-ink group-hover:text-maroon"
                      }`}>
                        {l.label}
                      </span>
                      {active && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-maroon-deep shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}

                {/* Quick access */}
                <div className="mt-5 pt-4 border-t border-gold/15">
                  <p className="px-2 mb-2 font-display text-[8px] tracking-[0.3em] uppercase text-ink-soft/50">Quick Access</p>

                  <button
                    type="button"
                    onClick={() => goTo("/cart")}
                    aria-label={count > 0 ? `Shopping bag, ${count} item${count !== 1 ? "s" : ""}` : "Shopping bag"}
                    className="w-full flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-150 group"
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
                  </button>

                  {user && (
                    <button
                      type="button"
                      onClick={() => goTo("/profile")}
                      className="w-full flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-150 group"
                    >
                      <span aria-hidden="true" className="flex items-center justify-center w-9 h-9 rounded-sm bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8 transition-colors shrink-0">
                        <User size={16} strokeWidth={1.5} />
                      </span>
                      <span className="font-heading text-[1.35rem] text-ink group-hover:text-maroon leading-none transition-colors">My Profile</span>
                    </button>
                  )}

                  {user && (
                    <button
                      type="button"
                      onClick={() => goTo("/orders")}
                      className="w-full flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-150 group"
                    >
                      <span aria-hidden="true" className="flex items-center justify-center w-9 h-9 rounded-sm bg-ivory-deep text-ink-soft group-hover:text-maroon group-hover:bg-maroon/8 transition-colors shrink-0">
                        <Package size={16} strokeWidth={1.5} />
                      </span>
                      <span className="font-heading text-[1.35rem] text-ink group-hover:text-maroon leading-none transition-colors">My Orders</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => goTo("/admin")}
                      className="w-full flex items-center gap-4 px-3 py-4 rounded-sm mb-0.5 hover:bg-ivory-deep border border-transparent transition-all duration-150 group"
                    >
                      <span aria-hidden="true" className="flex items-center justify-center w-9 h-9 rounded-sm bg-gold/10 text-gold-dark group-hover:bg-gold/20 transition-colors shrink-0">
                        <Settings size={16} strokeWidth={1.5} />
                      </span>
                      <span className="font-heading text-[1.35rem] text-gold-dark group-hover:text-maroon leading-none transition-colors">Admin Panel</span>
                    </button>
                  )}
                </div>
              </nav>

              {/* ── Footer ── */}
              <div className="px-5 py-4 border-t border-gold/15 bg-ivory-deep/40 shrink-0">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 border border-gold/25 text-ink-soft hover:text-maroon hover:border-maroon/40 transition-colors rounded-sm font-display text-[8px] tracking-[0.3em] uppercase"
                  >
                    <LogOut size={13} strokeWidth={1.5} aria-hidden="true" /> Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => goTo("/auth")}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-maroon-deep text-ivory font-display text-[8px] tracking-[0.3em] uppercase rounded-sm hover:bg-maroon transition-colors"
                  >
                    <User size={13} strokeWidth={1.5} aria-hidden="true" /> Sign In
                  </button>
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
