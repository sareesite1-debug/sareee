import { useState } from "react";
import { Plus, Pencil, Trash2, FileDown, Printer, X } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import PartySelector from "@/components/admin/PartySelector";
import { printBill, downloadBillPdf, BillData, BillItem } from "@/lib/billPdf";

interface Quotation {
  id: string; quotation_number: string; client_name: string; client_email: string;
  bill_type: "customer" | "supplier"; party_gst_no: string;
  items: BillItem[]; subtotal: number;
  cgst_percent: number; sgst_percent: number; igst_percent: number;
  cgst_amount: number; sgst_amount: number; igst_amount: number;
  tax: number; total: number; status: string; notes: string; created_at: string;
}

const statusOptions = [
  { value: "draft", label: "Draft" }, { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" }, { value: "rejected", label: "Rejected" },
];
const billTypeOptions = [{ value: "customer", label: "Customer" }, { value: "supplier", label: "Supplier" }];

const toBill = (q: Quotation): BillData => ({
  doc_type: "QUOTATION", number: q.quotation_number, date: q.created_at, status: q.status,
  bill_type: (q.bill_type as any) || "customer",
  party_name: q.client_name, party_email: q.client_email, party_gst_no: q.party_gst_no,
  items: q.items || [], subtotal: q.subtotal,
  cgst_percent: q.cgst_percent || 0, sgst_percent: q.sgst_percent || 0, igst_percent: q.igst_percent || 0,
  cgst_amount: q.cgst_amount || 0, sgst_amount: q.sgst_amount || 0, igst_amount: q.igst_amount || 0,
  total: q.total, notes: q.notes,
});

const AdminQuotations = () => {
  const { data: quotations, loading, create, update, remove } = useSupabaseCrud<Quotation>("quotations");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const blank = {
    quotation_number: "", client_name: "", client_email: "", party_gst_no: "",
    bill_type: "customer" as "customer" | "supplier",
    status: "draft", notes: "",
    cgst_percent: "9", sgst_percent: "9", igst_percent: "0",
    items: [{ name: "", description: "", quantity: 1, rate: 0, amount: 0 }] as BillItem[],
  };
  const [form, setForm] = useState(blank);

  const genNumber = () => `QT-${Date.now().toString(36).toUpperCase()}`;
  const openNew = () => { setEditing(null); setForm({ ...blank, quotation_number: genNumber() }); setDialogOpen(true); };
  const openEdit = (q: Quotation) => {
    setEditing(q);
    const items = (q.items || []) as BillItem[];
    setForm({
      quotation_number: q.quotation_number, client_name: q.client_name, client_email: q.client_email || "",
      party_gst_no: q.party_gst_no || "", bill_type: (q.bill_type as any) || "customer",
      status: q.status, notes: q.notes || "",
      cgst_percent: String(q.cgst_percent ?? 0), sgst_percent: String(q.sgst_percent ?? 0), igst_percent: String(q.igst_percent ?? 0),
      items: items.length ? items : [{ name: "", description: "", quantity: 1, rate: 0, amount: 0 }],
    });
    setDialogOpen(true);
  };

  const updateItem = (idx: number, field: keyof BillItem, value: string | number) => {
    const items = [...form.items];
    (items[idx] as any)[field] = value;
    items[idx].amount = items[idx].quantity * items[idx].rate;
    setForm({ ...form, items });
  };
  const addItem = () => setForm({ ...form, items: [...form.items, { name: "", description: "", quantity: 1, rate: 0, amount: 0 }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const subtotal = form.items.reduce((s, i) => s + i.amount, 0);
  const cgstAmt = Math.round(subtotal * (Number(form.cgst_percent) || 0) / 100);
  const sgstAmt = Math.round(subtotal * (Number(form.sgst_percent) || 0) / 100);
  const igstAmt = Math.round(subtotal * (Number(form.igst_percent) || 0) / 100);
  const total = subtotal + cgstAmt + sgstAmt + igstAmt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      quotation_number: form.quotation_number, client_name: form.client_name, client_email: form.client_email,
      bill_type: form.bill_type, party_gst_no: form.party_gst_no,
      items: form.items as any, subtotal,
      cgst_percent: Number(form.cgst_percent) || 0, sgst_percent: Number(form.sgst_percent) || 0, igst_percent: Number(form.igst_percent) || 0,
      cgst_amount: cgstAmt, sgst_amount: sgstAmt, igst_amount: igstAmt,
      tax: cgstAmt + sgstAmt + igstAmt, total, status: form.status, notes: form.notes,
    };
    const ok = editing ? await update(editing.id, payload as any) : await create(payload as any);
    if (ok) setDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Quotations</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Customer & supplier quotations with GST and PDF export</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> New Quotation
        </button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr>
              {["#", "Type", "Party", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {quotations.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No quotations yet.</td></tr>
              ) : quotations.map(q => (
                <tr key={q.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium font-body">{q.quotation_number}</td>
                  <td className="px-4 py-3 text-xs font-body capitalize">{q.bill_type || "customer"}</td>
                  <td className="px-4 py-3 text-sm font-body">{q.client_name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">{(q.items as BillItem[] || []).length} items</td>
                  <td className="px-4 py-3 text-sm font-medium text-gold font-body">₹{Number(q.total).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-body ${
                    q.status === 'accepted' ? 'bg-green-100 text-green-700' : q.status === 'rejected' ? 'bg-destructive/10 text-destructive' : q.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-secondary text-muted-foreground'
                  }`}>{q.status}</span></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">{new Date(q.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => printBill(toBill(q))} className="text-muted-foreground hover:text-foreground" title="Print"><Printer size={14} /></button>
                      <button onClick={() => downloadBillPdf(toBill(q))} className="text-gold hover:text-gold/80" title="Download PDF"><FileDown size={14} /></button>
                      <button onClick={() => openEdit(q)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(q.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Quotation" : "New Quotation"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quotation #" value={form.quotation_number} onChange={v => setForm({ ...form, quotation_number: v })} required />
            <FormField label="Bill Type" value={form.bill_type} onChange={v => setForm({ ...form, bill_type: v as any })} options={billTypeOptions} />
          </div>

          <div>
            <label className="block text-xs font-body font-medium uppercase tracking-wider mb-1.5">Party</label>
            <PartySelector billType={form.bill_type} name={form.client_name} email={form.client_email} gstNo={form.party_gst_no}
              onChange={p => setForm({ ...form, client_name: p.name, client_email: p.email, party_gst_no: p.gstNo })} />
          </div>

          <FormField label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={statusOptions} />

          <div>
            <label className="block text-xs font-body font-medium uppercase tracking-wider mb-2">Items</label>
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="border border-border rounded-md p-3 space-y-2 relative">
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><X size={14} /></button>
                  )}
                  <input value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} placeholder="Item" className="w-full border border-border bg-background px-3 py-2 text-sm font-body rounded-md" />
                  <input value={item.description || ""} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Description" className="w-full border border-border bg-background px-3 py-2 text-sm font-body rounded-md" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} placeholder="Qty" className="border border-border bg-background px-3 py-2 text-sm font-body rounded-md" />
                    <input type="number" min={0} value={item.rate} onChange={e => updateItem(idx, "rate", Number(e.target.value))} placeholder="Rate" className="border border-border bg-background px-3 py-2 text-sm font-body rounded-md" />
                    <input readOnly value={`₹${item.amount.toLocaleString()}`} className="border border-border bg-secondary px-3 py-2 text-sm font-body rounded-md" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-xs text-gold font-body font-medium hover:underline">+ Add Item</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="CGST %" value={form.cgst_percent} onChange={v => setForm({ ...form, cgst_percent: v })} type="number" />
            <FormField label="SGST %" value={form.sgst_percent} onChange={v => setForm({ ...form, sgst_percent: v })} type="number" />
            <FormField label="IGST %" value={form.igst_percent} onChange={v => setForm({ ...form, igst_percent: v })} type="number" />
          </div>

          <div className="bg-secondary/50 rounded-md p-3 text-sm font-body space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>₹{subtotal.toLocaleString()}</span></div>
            {!!cgstAmt && <div className="flex justify-between"><span className="text-muted-foreground">CGST ({form.cgst_percent}%):</span><span>₹{cgstAmt.toLocaleString()}</span></div>}
            {!!sgstAmt && <div className="flex justify-between"><span className="text-muted-foreground">SGST ({form.sgst_percent}%):</span><span>₹{sgstAmt.toLocaleString()}</span></div>}
            {!!igstAmt && <div className="flex justify-between"><span className="text-muted-foreground">IGST ({form.igst_percent}%):</span><span>₹{igstAmt.toLocaleString()}</span></div>}
            <div className="flex justify-between font-semibold text-gold pt-1 border-t border-border"><span>Total:</span><span>₹{total.toLocaleString()}</span></div>
          </div>

          <FormField label="Notes" value={form.notes} onChange={v => setForm({ ...form, notes: v })} type="textarea" />

          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update Quotation" : "Create Quotation"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="quotation" />
    </div>
  );
};

export default AdminQuotations;
