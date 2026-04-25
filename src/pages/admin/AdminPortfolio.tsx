import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface PortfolioItem { id: string; title: string; description: string; image_url: string; status: string; }

const AdminPortfolio = () => {
  const { data: items, loading, create, update, remove } = useSupabaseCrud<PortfolioItem>("portfolio_items");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", status: "published" });

  const openNew = () => { setEditing(null); setForm({ title: "", description: "", image_url: "", status: "published" }); setDialogOpen(true); };
  const openEdit = (p: PortfolioItem) => { setEditing(p); setForm({ title: p.title, description: p.description || "", image_url: p.image_url || "", status: p.status }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = editing ? await update(editing.id, form) : await create(form);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Collections Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Manage your saree collections displayed on the website</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> Add Item
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground font-body py-8">No collection items yet.</p>
          ) : items.map(item => (
            <div key={item.id} className="border border-border rounded-lg p-4 bg-card group relative">
              <div className="aspect-square bg-secondary rounded-md mb-3 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-xs font-body">No image</span>
                )}
              </div>
              <h3 className="font-heading font-medium text-sm">{item.title}</h3>
              {item.description && <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{item.description}</p>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-body mt-2 inline-block ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`}>{item.status}</span>
              <div className="absolute top-6 right-6 hidden group-hover:flex gap-2">
                <button onClick={() => openEdit(item)} className="bg-card/80 p-1 rounded text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(item.id)} className="bg-card/80 p-1 rounded text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Item" : "Add Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} required />
          <FormField label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} type="textarea" />
          <FormField label="Image URL" value={form.image_url} onChange={v => setForm({ ...form, image_url: v })} placeholder="https://..." />
          <FormField label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="collection item" />
    </div>
  );
};

export default AdminPortfolio;
