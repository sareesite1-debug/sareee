import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// FloatingChat is never needed on first paint — lazy load it
const FloatingChat = lazy(() => import("./FloatingChat"));

const SiteLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Film grain overlay — lightweight CSS-only, no JS */}
      <div className="noise-overlay" aria-hidden="true" />

      <Navbar />
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>
      <Footer />
      {/* Load chat widget only after the rest of the page has hydrated */}
      <Suspense fallback={null}>
        <FloatingChat />
      </Suspense>
    </div>
  );
};

export default SiteLayout;
