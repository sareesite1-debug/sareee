import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingChat from "./FloatingChat";

/* ── Lightweight page transition (no blocking, no delay) ── */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const SiteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Film grain overlay — lightweight CSS-only, no JS */}
      <div className="noise-overlay" aria-hidden="true" />

      <Navbar />
      <main className="flex-1" id="main-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
};

export default SiteLayout;
