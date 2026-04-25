import { useEffect, useRef, useState } from "react";
import { Send, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Thread { id: string; user_id: string; user_name: string | null; user_email: string | null; last_message_at: string; unread_admin: boolean; }
interface ChatMsg { id: string; sender_role: "user" | "admin"; message: string; created_at: string; }

const AdminChat = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadThreads = async () => {
    const { data, error } = await (supabase.from("chat_threads") as any)
      .select("id,user_id,user_name,user_email,last_message_at,unread_admin")
      .order("last_message_at", { ascending: false });
    if (error) toast.error(error.message); else setThreads(data || []);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAdminId(data.user?.id ?? null));
    loadThreads();
    const ch = supabase.channel("admin-threads")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, loadThreads)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, loadThreads)
      .subscribe();
    const poll = setInterval(loadThreads, 5000);
    return () => { supabase.removeChannel(ch); clearInterval(poll); };
  }, []);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancelled = false;
    const load = async () => {
      const { data } = await (supabase.from("chat_messages") as any)
        .select("id,sender_role,message,created_at")
        .eq("thread_id", activeId).order("created_at", { ascending: true });
      if (!cancelled) setMessages(data || []);
    };
    (async () => {
      await load();
      await (supabase.from("chat_threads") as any).update({ unread_admin: false }).eq("id", activeId);
      loadThreads();
    })();
    const ch = supabase.channel(`admin-chat-${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `thread_id=eq.${activeId}` },
        (payload) => setMessages(prev => prev.find(m => m.id === (payload.new as any).id) ? prev : [...prev, payload.new as ChatMsg]))
      .subscribe();
    const poll = setInterval(load, 4000);
    return () => { cancelled = true; supabase.removeChannel(ch); clearInterval(poll); };
  }, [activeId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !activeId || !adminId) return;
    const text = input.trim();
    setInput("");
    await (supabase.from("chat_messages") as any).insert({
      thread_id: activeId, sender_id: adminId, sender_role: "admin", message: text,
    });
    await (supabase.from("chat_threads") as any).update({ last_message_at: new Date().toISOString(), unread_user: true }).eq("id", activeId);
  };

  const active = threads.find(t => t.id === activeId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold">Customer Chat</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Per-user conversations from the website chat widget</p>
      </div>
      <div className="grid grid-cols-12 gap-4 border border-border rounded-lg overflow-hidden bg-card h-[600px]">
        <aside className="col-span-4 border-r border-border overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground font-body flex flex-col items-center gap-2">
              <Inbox size={28} className="opacity-40" />
              No conversations yet.
            </div>
          ) : threads.map(t => (
            <button key={t.id} onClick={() => setActiveId(t.id)}
              className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 ${activeId === t.id ? "bg-muted" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium font-body truncate">{t.user_name || t.user_email || "Customer"}</span>
                {t.unread_admin && <span className="w-2 h-2 rounded-full bg-gold" />}
              </div>
              <p className="text-xs text-muted-foreground font-body truncate">{t.user_email}</p>
              <p className="text-[10px] text-muted-foreground font-body mt-1">{new Date(t.last_message_at).toLocaleString()}</p>
            </button>
          ))}
        </aside>
        <section className="col-span-8 flex flex-col">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground font-body">Select a conversation</div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-border">
                <p className="text-sm font-medium font-body">{active?.user_name || active?.user_email}</p>
                <p className="text-xs text-muted-foreground font-body">{active?.user_email}</p>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-lg ${m.sender_role === "admin" ? "gradient-gold text-maroon-deep" : "bg-secondary"}`}>
                      <p className="text-sm font-body">{m.message}</p>
                      <p className="text-[10px] opacity-60 mt-1 font-body">{new Date(m.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-3">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Type your reply..." className="flex-1 bg-background border border-border px-4 py-2.5 text-sm rounded-md font-body" />
                <button onClick={send} className="gradient-gold text-maroon-deep px-4 py-2.5 rounded-md"><Send size={16} /></button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminChat;
