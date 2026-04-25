import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface Client { id: string; name: string; email: string; phone: string; gst_no: string; total_orders: number; total_spent: number; }

const AdminClients = () => {
  const { data: clients, loading, create, update, remove } = useSupabaseCrud<Client>("clients");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", gst_no: "", total_orders: "0", total_spent: "0" });

  const openNew = () => { setEditing(null); setForm({ name: "", email: "", phone: "", gst_no: "", total_orders: "0", total_spent: "0" }); setDialogOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ name: c.name, email: c.email || "", phone: c.phone || "", gst_no: c.gst_no || "", total_orders: String(c.total_orders), total_spent: String(c.total_spent) }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, email: form.email, phone: form.phone, gst_no: form.gst_no, total_orders: Number(form.total_orders), total_spent: Number(form.total_spent) };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Manage your customer database</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> Add Customer
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr>
              {["Name", "Email", "Phone", "Orders", "Total Spent", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No customers yet. Add your first customer!</td></tr>
              ) : clients.map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium font-body">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">{c.phone}</td>
                  <td className="px-4 py-3 text-sm font-body">{c.total_orders}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gold font-body">₹{Number(c.total_spent).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
          <FormField label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} type="email" />
          <FormField label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <FormField label="GST Number" value={form.gst_no} onChange={v => setForm({ ...form, gst_no: v })} placeholder="22AAAAA0000A1Z5" />
          <FormField label="Total Orders" value={form.total_orders} onChange={v => setForm({ ...form, total_orders: v })} type="number" />
          <FormField label="Total Spent (₹)" value={form.total_spent} onChange={v => setForm({ ...form, total_spent: v })} type="number" />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="customer" />
    </div>
  );
};

export default AdminClients;
