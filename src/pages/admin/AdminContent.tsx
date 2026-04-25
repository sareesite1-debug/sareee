import { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Section { id: string; section_key: string; title: string; content: any; }

const FIELD_HINTS: Record<string, string[]> = {
  hero: ["eyebrow", "heading", "subheading", "cta_label", "cta_link"],
  featured_collections: ["eyebrow", "heading"],
  testimonials: ["items (JSON array of {name, quote})"],
  promotions: ["banner_text", "banner_link"],
};

const AdminContent = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; content: string }>({ title: "", content: "" });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data } = await (supabase.from("content_sections") as any).select("*").order("section_key");
    setSections(data || []); setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const startEdit = (s: Section) => {
    setEditing(s.id);
    setDraft({ title: s.title, content: JSON.stringify(s.content || {}, null, 2) });
  };

  const save = async (s: Section) => {
    let parsed: any = {};
    try { parsed = JSON.parse(draft.content || "{}"); }
    catch { toast.error("Content must be valid JSON"); return; }
    const { error } = await (supabase.from("content_sections") as any)
      .update({ title: draft.title, content: parsed }).eq("id", s.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setEditing(null); refresh();
  };

  const addSection = async () => {
    const key = prompt("Section key (e.g. hero, about, banner):");
    if (!key) return;
    const title = prompt("Section title:") || key;
    const { error } = await (supabase.from("content_sections") as any)
      .insert({ section_key: key.toLowerCase().replace(/\s+/g, "_"), title, content: {} });
    if (error) { toast.error(error.message); return; }
    toast.success("Section added"); refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    const { error } = await (supabase.from("content_sections") as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Content Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Edit homepage sections, banners, testimonials & promotions.</p>
        </div>
        <button onClick={addSection} className="bg-emerald-deep text-ivory px-4 py-2 text-xs font-body uppercase tracking-wider rounded-md hover:bg-emerald">
          + New Section
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body">Loading…</p> : (
        <div className="space-y-4">
          {sections.length === 0 && (
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
              <p className="font-heading text-lg mb-2">No content sections yet</p>
              <p className="text-sm text-muted-foreground font-body">Click "New Section" to add your first one.</p>
            </div>
          )}
          {sections.map(s => (
            <div key={s.id} className="border border-border rounded-lg p-5 bg-card">
              {editing === s.id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">{s.section_key}</span>
                    <div className="flex gap-2">
                      <button onClick={() => save(s)} className="inline-flex items-center gap-1 text-xs bg-emerald text-ivory px-3 py-1.5 rounded font-body uppercase tracking-wider"><Save size={13} /> Save</button>
                      <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1 text-xs border border-border px-3 py-1.5 rounded font-body uppercase tracking-wider"><X size={13} /> Cancel</button>
                    </div>
                  </div>
                  <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm font-heading rounded" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">
                    Content (JSON) — typical fields: {(FIELD_HINTS[s.section_key] || ["title", "body"]).join(", ")}
                  </p>
                  <textarea value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })}
                    rows={10} className="w-full border border-border bg-background px-3 py-2 text-xs font-mono rounded resize-y" />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">{s.section_key}</span>
                    <h3 className="font-heading text-lg mt-1">{s.title}</h3>
                    <pre className="text-[11px] font-mono text-muted-foreground mt-2 max-h-32 overflow-auto bg-muted/30 p-2 rounded">{JSON.stringify(s.content || {}, null, 2)}</pre>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => startEdit(s)} className="inline-flex items-center gap-1 text-xs text-emerald hover:text-emerald-deep font-body uppercase tracking-wider"><Pencil size={13} /> Edit</button>
                    <button onClick={() => remove(s.id)} className="text-xs text-destructive hover:underline font-body uppercase tracking-wider">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
