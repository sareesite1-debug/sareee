import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created successfully! Welcome to Arpitha Saree Center.");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate(location.state?.from || "/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon: Icon, type, value, onChange }: any) => (
    <div className="relative group mb-6">
      <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft transition-colors group-focus-within:text-emerald">{label}</label>
      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gold-dark/60 group-focus-within:text-emerald transition-colors"><Icon size={14} /></div>
        <input type={type} required value={value} onChange={onChange}
          className="w-full bg-transparent border-b border-gold/30 pl-7 pr-0 py-2 text-ink font-body focus:outline-none focus:border-emerald transition-colors" />
        <motion.div className="absolute bottom-0 left-0 h-px bg-emerald origin-left" initial={{ scaleX: 0 }} whileInView={{ scaleX: 0 }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Left split - Image/Brand */}
      <div className="hidden lg:flex w-1/2 bg-emerald-deep relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--gold))_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]" />
        <motion.div className="absolute top-1/4 -right-20 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold" />
            <span className="eyebrow text-gold">Est. 1985</span>
          </div>
          <h1 className="text-display text-5xl text-ivory leading-tight max-w-md">
            <span className="italic text-gold/90">Curators</span> of fine <br/>Indian handlooms.
          </h1>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-ivory/60 font-body leading-relaxed mb-8">
            Create an account to track your orders, save your favorite weaves, and manage your bridal consultations seamlessly.
          </p>
          <div className="flex items-center gap-6 text-[10px] text-ivory/40 uppercase tracking-widest font-body">
            <span>Secure Checkout</span>
            <span className="w-1 h-1 rounded-full bg-gold/50" />
            <span>Order Tracking</span>
          </div>
        </div>
      </div>

      {/* Right split - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md glass-card p-10 md:p-14 relative">
          <div className="text-center mb-10">
            <p className="eyebrow text-gold-dark mb-2">Welcome</p>
            <h2 className="font-heading text-3xl text-ink">{isSignUp ? "Create Account" : "Sign In"}</h2>
          </div>

          <form onSubmit={handleAuth} className="relative z-10">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  <InputField label="Full Name" icon={User} type="text" value={name} onChange={(e: any) => setName(e.target.value)} />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField label="Email Address" icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
            <InputField label="Password" icon={Lock} type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />

            <button type="submit" disabled={loading} className="btn-liquid btn-emerald w-full py-4 mt-6">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={14} />
              </span>
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gold/15 pt-6">
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-body text-[11px] uppercase tracking-[0.2em] text-ink-soft hover:text-emerald transition-colors">
              {isSignUp ? "Already have an account? Sign in" : "New to Arpitha? Create an account"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
