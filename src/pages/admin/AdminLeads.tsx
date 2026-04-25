import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface Lead { id: string; name: string; email: string; interest: string; source: string; status: string; }

const statusOptions = [
  { value: "new", label: "New" }, { value: "warm", label: "Warm" },
  { value: "hot", label: "Hot" }, { value: "cold", label: "Cold" },
];

const AdminLeads = () => {
  const { data: leads, loading, create, update, remove } = useSupabaseCrud<Lead>("leads");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", interest: "", source: "", status: "new" });

  const openNew = () => { setEditing(null); setForm({ name: "", email: "", interest: "", source: "", status: "new" }); setDialogOpen(true); };
  const openEdit = (l: Lead) => { setEditing(l); setForm({ name: l.name, email: l.email || "", interest: l.interest || "", source: l.source || "", status: l.status }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editing ? await update(editing.id, form) : await create(form);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Track and manage potential customers</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr>
              {["Name", "Email", "Interest", "Source", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No leads yet.</td></tr>
              ) : leads.map(l => (
                <tr key={l.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium font-body">{l.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">{l.email}</td>
                  <td className="px-4 py-3 text-sm font-body">{l.interest}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">{l.source}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-body ${l.status === 'hot' ? 'bg-destructive/10 text-destructive' : l.status === 'warm' ? 'bg-gold/10 text-gold' : 'bg-secondary text-muted-foreground'}`}>{l.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(l)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(l.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Lead" : "Add Lead"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <FormField label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />
          <FormField label="Interest" value={form.interest} onChange={v => setForm({ ...form, interest: v })} placeholder="e.g. Bridal, Silk, Bulk" />
          <FormField label="Source" value={form.source} onChange={v => setForm({ ...form, source: v })} placeholder="e.g. Website, Referral" />
          <FormField label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={statusOptions} />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="lead" />
    </div>
  );
};

export default AdminLeads;
