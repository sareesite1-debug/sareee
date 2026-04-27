import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingChat from "./FloatingChat";

/* ── Cinematic loading screen ── */
const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="loading-screen"
      exit={{ y: "-100%", opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
    >
      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gold/5 blur-[100px]"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "30%", left: "20%" }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-emerald/20 blur-[80px]"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "30%", right: "25%" }}
      />

      {/* Gold line draws across */}
      <motion.div
        className="loading-line"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: "left" }}
      />

      {/* Brand name */}
      <motion.div
        className="loading-brand"
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        Arpitha
      </motion.div>

      {/* Sub text */}
      <motion.div
        className="loading-sub"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        Kanchipuram Pure Silk · Since 1985
      </motion.div>

      {/* Bottom line */}
      <motion.div
        className="loading-line"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.5 }}
        transition={{ duration: 1, delay: 1.5, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: "right", marginTop: 16 }}
      />
    </motion.div>
  );
};

/* ── Page transition wrapper ── */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const SiteLayout = () => {
  const [showLoading, setShowLoading] = useState(() => {
    // Only show loading on first visit per session
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("arpitha-loaded");
    }
    return false;
  });

  const handleLoadingComplete = () => {
    sessionStorage.setItem("arpitha-loaded", "true");
    setShowLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Film grain overlay */}
      <div className="noise-overlay" />

      {/* Loading screen */}
      <AnimatePresence>
        {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <Navbar />
      <main className="flex-1">
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
