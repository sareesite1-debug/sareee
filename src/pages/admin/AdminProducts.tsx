import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import ImageUploader from "@/components/admin/ImageUploader";

interface Category { id: string; name: string; slug: string; sort_order: number | null; }
interface Product { id: string; category_id: string | null; name: string; slug: string; description: string | null; price: number; compare_at_price: number | null; image_url: string | null; stock: number | null; status: string; }

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);

const AdminProducts = () => {
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Product dialog
  const [pDialog, setPDialog] = useState(false);
  const [editingP, setEditingP] = useState<Product | null>(null);
  const [pDel, setPDel] = useState<string | null>(null);
  const blankP = { category_id: "", name: "", description: "", price: "", compare_at_price: "", image_url: "", stock: "0", status: "active" };
  const [pForm, setPForm] = useState(blankP);

  // Category dialog
  const [cDialog, setCDialog] = useState(false);
  const [editingC, setEditingC] = useState<Category | null>(null);
  const [cDel, setCDel] = useState<string | null>(null);
  const [cForm, setCForm] = useState({ name: "", description: "", image_url: "", sort_order: "0" });

  const refresh = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      (supabase.from("categories") as any).select("*").order("sort_order"),
      (supabase.from("products") as any).select("*").order("created_at", { ascending: false }),
    ]);
    setCategories(c.data || []); setProducts(p.data || []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const openNewP = () => { setEditingP(null); setPForm({ ...blankP, category_id: categories[0]?.id || "" }); setPDialog(true); };
  const openEditP = (p: Product) => {
    setEditingP(p);
    setPForm({
      category_id: p.category_id || "", name: p.name, description: p.description || "",
      price: String(p.price), compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      image_url: p.image_url || "", stock: String(p.stock ?? 0), status: p.status,
    });
    setPDialog(true);
  };
  const submitP = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      category_id: pForm.category_id || null, name: pForm.name, description: pForm.description,
      price: Number(pForm.price) || 0,
      compare_at_price: pForm.compare_at_price ? Number(pForm.compare_at_price) : null,
      image_url: pForm.image_url || null, stock: Number(pForm.stock) || 0, status: pForm.status,
    };
    if (!editingP) payload.slug = slugify(pForm.name);
    const { error } = editingP
      ? await (supabase.from("products") as any).update(payload).eq("id", editingP.id)
      : await (supabase.from("products") as any).insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editingP ? "Updated" : "Created");
    setPDialog(false); refresh();
  };
  const delP = async (id: string) => {
    const { error } = await (supabase.from("products") as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  const openNewC = () => { setEditingC(null); setCForm({ name: "", description: "", image_url: "", sort_order: "0" }); setCDialog(true); };
  const openEditC = (c: Category) => {
    setEditingC(c);
    setCForm({ name: c.name, description: (c as any).description || "", image_url: (c as any).image_url || "", sort_order: String(c.sort_order ?? 0) });
    setCDialog(true);
  };
  const submitC = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: cForm.name, description: cForm.description, image_url: cForm.image_url || null,
      sort_order: Number(cForm.sort_order) || 0,
    };
    if (!editingC) payload.slug = slugify(cForm.name);
    const { error } = editingC
      ? await (supabase.from("categories") as any).update(payload).eq("id", editingC.id)
      : await (supabase.from("categories") as any).insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editingC ? "Updated" : "Created");
    setCDialog(false); refresh();
  };
  const delC = async (id: string) => {
    const { error } = await (supabase.from("categories") as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  const catName = (id: string | null) => categories.find(c => c.id === id)?.name || "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Products & Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Manage shop products and category groupings</p>
        </div>
        <button onClick={tab === "products" ? openNewP : openNewC} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> New {tab === "products" ? "Product" : "Category"}
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border">
        {(["products", "categories"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs uppercase tracking-wider font-body ${tab === t ? "text-gold border-b-2 border-gold" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : tab === "products" ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr>
              {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No products yet.</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3"><div className="w-12 h-12 bg-secondary rounded overflow-hidden">{p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}</div></td>
                  <td className="px-4 py-3 text-sm font-medium font-body">{p.name}</td>
                  <td className="px-4 py-3 text-sm font-body">{catName(p.category_id)}</td>
                  <td className="px-4 py-3 text-sm text-gold font-medium font-body">₹{Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-body">{p.stock}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-body ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-secondary'}`}>{p.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => openEditP(p)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                    <button onClick={() => setPDel(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr>
              {["Name", "Slug", "Sort", "Products", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No categories yet.</td></tr>
              ) : categories.map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium font-body">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-body">{c.slug}</td>
                  <td className="px-4 py-3 text-sm font-body">{c.sort_order}</td>
                  <td className="px-4 py-3 text-sm font-body">{products.filter(p => p.category_id === c.id).length}</td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => openEditC(c)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                    <button onClick={() => setCDel(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog open={pDialog} onOpenChange={setPDialog} title={editingP ? "Edit Product" : "New Product"}>
        <form onSubmit={submitP} className="space-y-4">
          <FormField label="Name" value={pForm.name} onChange={v => setPForm({ ...pForm, name: v })} required />
          <FormField label="Category" value={pForm.category_id} onChange={v => setPForm({ ...pForm, category_id: v })} options={categories.map(c => ({ value: c.id, label: c.name }))} />
          <FormField label="Description" value={pForm.description} onChange={v => setPForm({ ...pForm, description: v })} type="textarea" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price (₹)" value={pForm.price} onChange={v => setPForm({ ...pForm, price: v })} type="number" required />
            <FormField label="Compare-at price (₹)" value={pForm.compare_at_price} onChange={v => setPForm({ ...pForm, compare_at_price: v })} type="number" />
          </div>
          <ImageUploader value={pForm.image_url} onChange={v => setPForm({ ...pForm, image_url: v })} folder="products" label="Product Image" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Stock" value={pForm.stock} onChange={v => setPForm({ ...pForm, stock: v })} type="number" />
            <FormField label="Status" value={pForm.status} onChange={v => setPForm({ ...pForm, status: v })} options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }]} />
          </div>
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editingP ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <CrudDialog open={cDialog} onOpenChange={setCDialog} title={editingC ? "Edit Category" : "New Category"}>
        <form onSubmit={submitC} className="space-y-4">
          <FormField label="Name" value={cForm.name} onChange={v => setCForm({ ...cForm, name: v })} required />
          <FormField label="Description" value={cForm.description} onChange={v => setCForm({ ...cForm, description: v })} type="textarea" />
          <ImageUploader value={cForm.image_url} onChange={v => setCForm({ ...cForm, image_url: v })} folder="categories" label="Collection Image" />
          <FormField label="Sort order" value={cForm.sort_order} onChange={v => setCForm({ ...cForm, sort_order: v })} type="number" />
          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editingC ? "Update" : "Create"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!pDel} onOpenChange={() => setPDel(null)} onConfirm={() => { if (pDel) delP(pDel); setPDel(null); }} itemName="product" />
      <DeleteConfirm open={!!cDel} onOpenChange={() => setCDel(null)} onConfirm={() => { if (cDel) delC(cDel); setCDel(null); }} itemName="category" />
    </div>
  );
};

export default AdminProducts;
