import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface TeamMember { id: string; name: string; role: string; status: string; email: string; phone: string; }

const AdminTeam = () => {
  const { data: members, loading, create, update, remove } = useSupabaseCrud<TeamMember>("team_members");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "", status: "active", email: "", phone: "" });

  const openNew = () => { setEditing(null); setForm({ name: "", role: "", status: "active", email: "", phone: "" }); setDialogOpen(true); };
  const openEdit = (t: TeamMember) => { setEditing(t); setForm({ name: t.name, role: t.role || "", status: t.status, email: t.email || "", phone: t.phone || "" }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editing ? await update(editing.id, form) : await create(form);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Manage your team members and roles</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> Add Member
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground font-body py-8">No team members yet.</p>
          ) : members.map(t => (
            <div key={t.id} className="border border-border rounded-lg p-5 bg-card group relative">
              <div className="w-10 h-10 gradient-gold rounded-full flex items-center justify-center mb-3">
                <span className="text-maroon-deep font-heading font-semibold text-sm">{t.name[0]}</span>
              </div>
              <h3 className="font-heading font-medium text-sm">{t.name}</h3>
              <p className="text-xs text-muted-foreground font-body">{t.role}</p>
              {t.email && <p className="text-xs text-muted-foreground font-body mt-1">{t.email}</p>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-body mt-2 inline-block ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}>{t.status}</span>
              <div className="absolute top-3 right-3 hidden group-hover:flex gap-2">
                <button onClick={() => openEdit(t)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Member" : "Add Member"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <FormField label="Role" value={form.role} onChange={v => setForm({ ...form, role: v })} placeholder="e.g. Saree Consultant" />
          <FormField label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
          <FormField label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />
          <FormField label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="team member" />
    </div>
  );
};

export default AdminTeam;
