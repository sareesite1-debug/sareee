import { useState } from "react";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface Message { id: string; sender_name: string; sender_email: string; subject: string; message: string; is_read: boolean; created_at: string; }

const AdminMessages = () => {
  const { data: messages, loading, update, remove } = useSupabaseCrud<Message>("messages");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleRead = async (m: Message) => {
    await update(m.id, { is_read: !m.is_read } as any);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Contact form submissions and inquiries</p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground font-body py-8">No messages yet.</p>
          ) : messages.map(m => (
            <div key={m.id} className={`border rounded-lg p-4 bg-card cursor-pointer transition-colors ${m.is_read ? 'border-border' : 'border-gold/30 bg-gold/5'}`}
              onClick={() => { setExpanded(expanded === m.id ? null : m.id); if (!m.is_read) toggleRead(m); }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {m.is_read ? <MailOpen size={14} className="text-muted-foreground" /> : <Mail size={14} className="text-gold" />}
                  <h3 className={`text-sm font-body ${m.is_read ? '' : 'font-semibold'}`}>{m.sender_name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-body">{new Date(m.created_at).toLocaleDateString()}</span>
                  <button onClick={e => { e.stopPropagation(); setDeleteId(m.id); }} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-sm font-medium font-body mb-1">{m.subject}</p>
              <p className={`text-xs text-muted-foreground font-body ${expanded === m.id ? '' : 'line-clamp-1'}`}>{m.message}</p>
              {expanded === m.id && m.sender_email && (
                <p className="text-xs text-gold font-body mt-2">Reply to: {m.sender_email}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="message" />
    </div>
  );
};

export default AdminMessages;
