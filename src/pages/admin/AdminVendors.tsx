import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface Vendor { id: string; name: string; type: string; location: string; contact_email: string; contact_phone: string; gst_no: string; }

const AdminVendors = () => {
  const { data: vendors, loading, create, update, remove } = useSupabaseCrud<Vendor>("vendors");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "", location: "", contact_email: "", contact_phone: "", gst_no: "" });

  const openNew = () => { setEditing(null); setForm({ name: "", type: "", location: "", contact_email: "", contact_phone: "", gst_no: "" }); setDialogOpen(true); };
  const openEdit = (v: Vendor) => { setEditing(v); setForm({ name: v.name, type: v.type || "", location: v.location || "", contact_email: v.contact_email || "", contact_phone: v.contact_phone || "", gst_no: v.gst_no || "" }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editing ? await update(editing.id, form) : await create(form);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Suppliers & Weavers</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Manage weaver cooperatives and fabric suppliers</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> Add Supplier
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground font-body py-8">No suppliers yet.</p>
          ) : vendors.map(v => (
            <div key={v.id} className="border border-border rounded-lg p-5 bg-card group relative">
              <h3 className="font-heading font-medium text-sm mb-1">{v.name}</h3>
              <p className="text-xs text-gold font-body">{v.type}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{v.location}</p>
              {v.contact_email && <p className="text-xs text-muted-foreground font-body mt-1">{v.contact_email}</p>}
              {v.gst_no && <p className="text-[10px] text-muted-foreground font-body mt-1">GSTIN: {v.gst_no}</p>}
              <div className="absolute top-3 right-3 hidden group-hover:flex gap-2">
                <button onClick={() => openEdit(v)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(v.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Supplier" : "Add Supplier"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <FormField label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} placeholder="e.g. Silk, Kanjivaram" />
          <FormField label="Location" value={form.location} onChange={v => setForm({ ...form, location: v })} />
          <FormField label="Email" value={form.contact_email} onChange={v => setForm({ ...form, contact_email: v })} type="email" />
          <FormField label="Phone" value={form.contact_phone} onChange={v => setForm({ ...form, contact_phone: v })} />
          <FormField label="GST Number" value={form.gst_no} onChange={v => setForm({ ...form, gst_no: v })} placeholder="22AAAAA0000A1Z5" />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="supplier" />
    </div>
  );
};

export default AdminVendors;
