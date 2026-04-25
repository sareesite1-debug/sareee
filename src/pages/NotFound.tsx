import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-emerald-deep flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--gold))_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]" />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold/5 rounded-full pointer-events-none"
        animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold/10 rounded-full pointer-events-none"
        animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center bg-ivory-deep/5 backdrop-blur-md">
            <Sparkles size={24} className="text-gold" strokeWidth={1} />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          className="text-display text-8xl md:text-[12rem] text-ivory/10 leading-none mb-4 tracking-tighter"
        >
          404
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <h2 className="font-heading text-3xl md:text-5xl text-ivory mb-6">This page has woven <br/><span className="italic text-gold/90">a different path.</span></h2>
          <p className="text-ivory/60 font-body text-lg max-w-md mx-auto mb-12">
            The page you are looking for has either been moved or does not exist in our boutique.
          </p>

          <Link to="/" className="btn-liquid border border-gold text-gold px-10 py-4 font-display text-[9px] tracking-[0.35em] uppercase inline-flex items-center gap-3 hover:text-emerald-deep transition-colors duration-500 group">
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" /> Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
