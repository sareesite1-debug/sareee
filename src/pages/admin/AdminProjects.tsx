import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface Order { id: string; title: string; client_name: string; stage: string; budget: number; }

const stages = ["inquiry", "confirmed", "weaving", "shipping", "delivered"];
const stageOptions = stages.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

const AdminProjects = () => {
  const { data: orders, loading, create, update, remove } = useSupabaseCrud<Order>("orders");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", client_name: "", stage: "inquiry", budget: "0" });

  const openNew = () => { setEditing(null); setForm({ title: "", client_name: "", stage: "inquiry", budget: "0" }); setDialogOpen(true); };
  const openEdit = (o: Order) => { setEditing(o); setForm({ title: o.title, client_name: o.client_name || "", stage: o.stage, budget: String(o.budget) }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: form.title, client_name: form.client_name, stage: form.stage, budget: Number(form.budget) };
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Order Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Track saree orders from inquiry to delivery</p>
        </div>
        <div className="flex gap-3">
          <div className="flex border border-border rounded-md overflow-hidden">
            <button onClick={() => setView("kanban")} className={`px-4 py-2 text-xs font-medium font-body ${view === "kanban" ? "gradient-gold text-maroon-deep" : ""}`}>Kanban</button>
            <button onClick={() => setView("list")} className={`px-4 py-2 text-xs font-medium font-body ${view === "list" ? "gradient-gold text-maroon-deep" : ""}`}>List</button>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
            <Plus size={14} /> New Order
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stages.map(s => (
            <div key={s} className="bg-secondary/50 rounded-lg p-3">
              <h3 className="text-xs font-medium uppercase tracking-wider mb-3 capitalize font-body text-muted-foreground">{s}</h3>
              <div className="space-y-2">
                {orders.filter(o => o.stage === s).map(o => (
                  <div key={o.id} className="bg-card p-3 rounded-md border border-border group relative">
                    <p className="text-sm font-medium font-body">{o.title}</p>
                    <p className="text-xs text-muted-foreground font-body">{o.client_name}</p>
                    <p className="text-xs text-gold mt-1 font-body">₹{Number(o.budget).toLocaleString()}</p>
                    <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                      <button onClick={() => openEdit(o)} className="text-muted-foreground hover:text-foreground"><Pencil size={12} /></button>
                      <button onClick={() => setDeleteId(o.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr>
              {["Order", "Customer", "Stage", "Budget", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No orders yet.</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3 text-sm font-body">{o.title}</td>
                  <td className="px-4 py-3 text-sm font-body">{o.client_name}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 bg-gold/10 text-gold rounded-full capitalize font-body">{o.stage}</span></td>
                  <td className="px-4 py-3 text-sm font-body">₹{Number(o.budget).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(o)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(o.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Order" : "New Order"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Order Title" value={form.title} onChange={v => setForm({ ...form, title: v })} required placeholder="e.g. Bridal Banarasi Set" />
          <FormField label="Customer Name" value={form.client_name} onChange={v => setForm({ ...form, client_name: v })} />
          <FormField label="Stage" value={form.stage} onChange={v => setForm({ ...form, stage: v })} options={stageOptions} />
          <FormField label="Budget (₹)" value={form.budget} onChange={v => setForm({ ...form, budget: v })} type="number" />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="order" />
    </div>
  );
};

export default AdminProjects;
