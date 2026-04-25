import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface ChatMsg { id: string; sender_role: "user" | "admin"; message: string; created_at: string; }

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data: existing } = await (supabase.from("chat_threads") as any).select("id").eq("user_id", user.id).maybeSingle();
      if (existing?.id) { setThreadId(existing.id); }
      else {
        const { data: created } = await (supabase.from("chat_threads") as any)
          .insert({ user_id: user.id, user_email: user.email, user_name: user.user_metadata?.full_name || user.email }).select("id").single();
        setThreadId(created?.id ?? null);
      }
    })();
  }, [open, user]);

  useEffect(() => {
    if (!threadId) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await (supabase.from("chat_messages") as any).select("id,sender_role,message,created_at").eq("thread_id", threadId).order("created_at", { ascending: true });
      if (!cancelled) setMessages(data || []);
    };
    load();
    const ch = supabase.channel(`chat-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${threadId}` },
        (payload) => setMessages(prev => prev.find(m => m.id === (payload.new as any).id) ? prev : [...prev, payload.new as ChatMsg]))
      .subscribe();
    const poll = setInterval(load, 4000);
    return () => { cancelled = true; supabase.removeChannel(ch); clearInterval(poll); };
  }, [threadId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !threadId || !user) return;
    const text = input.trim();
    setInput("");
    await (supabase.from("chat_messages") as any).insert({ thread_id: threadId, sender_id: user.id, sender_role: "user", message: text });
    await (supabase.from("chat_threads") as any).update({ last_message_at: new Date().toISOString(), unread_admin: true }).eq("id", threadId);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-4 w-80 glass-card-dark shadow-2xl rounded-lg overflow-hidden"
          >
            <div className="bg-emerald-deep/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-gold/10">
              <span className="text-ivory font-heading text-sm font-semibold">Chat with Us</span>
              <button onClick={() => setOpen(false)} className="text-ivory/50 hover:text-ivory transition-colors"><X size={16} /></button>
            </div>
            {!user ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-sm text-ivory/50 font-body">Please sign in to chat with our team.</p>
                <Link to="/auth" className="inline-flex items-center gap-2 bg-gold text-emerald-deep px-5 py-2 text-xs font-body font-semibold uppercase tracking-wider rounded-sm hover:shadow-[0_0_20px_hsl(var(--gold)/0.3)] transition-shadow">
                  <LogIn size={14} /> Sign in
                </Link>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="h-64 overflow-y-auto p-4 space-y-3 bg-emerald-deep/40">
                  {messages.length === 0 && <p className="text-xs text-ivory/30 text-center font-body">Namaste 🙏 Send your first message.</p>}
                  {messages.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className={`flex ${m.sender_role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] px-3 py-2 text-sm rounded-lg font-body ${
                        m.sender_role === "user" ? "bg-gold/20 text-ivory border border-gold/10" : "bg-ivory/10 text-ivory/80"
                      }`}>{m.message}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-3 border-t border-gold/10 flex gap-2 bg-emerald-deep/60">
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                    placeholder="Type a message..." className="flex-1 bg-ivory/5 border border-ivory/10 px-3 py-2 text-sm rounded-md outline-none font-body text-ivory placeholder:text-ivory/30 focus:border-gold/30 transition-colors" />
                  <button onClick={send} className="bg-gold text-emerald-deep p-2 rounded-md hover:shadow-[0_0_15px_hsl(var(--gold)/0.3)] transition-shadow"><Send size={14} /></button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button with pulsing ring */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 bg-gold rounded-full flex items-center justify-center shadow-lg"
      >
        <MessageCircle size={22} className="text-emerald-deep relative z-10" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-gold/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.button>
    </div>
  );
};

export default FloatingChat;
