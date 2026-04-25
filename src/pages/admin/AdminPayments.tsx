import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FileDown, Printer, X, Download, CheckCircle2 } from "lucide-react";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import CrudDialog from "@/components/admin/CrudDialog";
import FormField from "@/components/admin/FormField";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import PartySelector from "@/components/admin/PartySelector";
import { printBill, downloadBillPdf, downloadMergedPdf, printBills, BillData, BillItem } from "@/lib/billPdf";
import { toast } from "sonner";

interface Payment {
  id: string; invoice_number: string; customer_name: string; party_email: string; party_gst_no: string;
  bill_type: "customer" | "supplier"; order_title: string;
  items: BillItem[]; subtotal: number;
  cgst_percent: number; sgst_percent: number; igst_percent: number;
  cgst_amount: number; sgst_amount: number; igst_amount: number;
  amount: number; status: string; payment_date: string; created_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" },
];
const billTypeOptions = [{ value: "customer", label: "Customer" }, { value: "supplier", label: "Supplier" }];

const toBill = (p: Payment): BillData => ({
  doc_type: "INVOICE",
  number: p.invoice_number || `INV-${p.id.slice(0, 6).toUpperCase()}`,
  date: p.created_at, status: p.status,
  bill_type: (p.bill_type as any) || "customer",
  party_name: p.customer_name, party_email: p.party_email, party_gst_no: p.party_gst_no,
  items: (p.items as BillItem[]) || [{ name: p.order_title || "Service", quantity: 1, rate: p.subtotal || p.amount, amount: p.subtotal || p.amount }],
  subtotal: p.subtotal || p.amount,
  cgst_percent: p.cgst_percent || 0, sgst_percent: p.sgst_percent || 0, igst_percent: p.igst_percent || 0,
  cgst_amount: p.cgst_amount || 0, sgst_amount: p.sgst_amount || 0, igst_amount: p.igst_amount || 0,
  total: p.amount,
});

const round2 = (n: number) => Math.round(n * 100) / 100;

const AdminPayments = () => {
  const { data: payments, loading, create, update, remove } = useSupabaseCrud<Payment>("payments");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const blank = {
    invoice_number: "", customer_name: "", party_email: "", party_gst_no: "", order_title: "",
    bill_type: "customer" as "customer" | "supplier", status: "pending", payment_date: "",
    cgst_percent: "2.5", sgst_percent: "2.5", igst_percent: "0",
    items: [{ name: "", description: "", quantity: 1, rate: 0, amount: 0 }] as BillItem[],
  };
  const [form, setForm] = useState(blank);

  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterParty, setFilterParty] = useState("");

  const filtered = useMemo(() => payments.filter(p => {
    const d = new Date(p.created_at);
    if (filterFrom && d < new Date(filterFrom)) return false;
    if (filterTo && d > new Date(filterTo + "T23:59:59")) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterParty && !p.customer_name?.toLowerCase().includes(filterParty.toLowerCase())) return false;
    return true;
  }), [payments, filterFrom, filterTo, filterStatus, filterParty]);

  const setPreset = (preset: "week" | "month" | "year" | "all") => {
    const now = new Date();
    if (preset === "all") { setFilterFrom(""); setFilterTo(""); return; }
    const start = new Date(now);
    if (preset === "week") start.setDate(now.getDate() - 7);
    if (preset === "month") start.setMonth(now.getMonth() - 1);
    if (preset === "year") start.setFullYear(now.getFullYear() - 1);
    setFilterFrom(start.toISOString().slice(0, 10));
    setFilterTo(now.toISOString().slice(0, 10));
  };

  const genNumber = () => `INV-${Date.now().toString(36).toUpperCase()}`;
  const openNew = () => { setEditing(null); setForm({ ...blank, invoice_number: genNumber() }); setDialogOpen(true); };
  const openEdit = (p: Payment) => {
    setEditing(p);
    const items = (p.items as BillItem[]) || [];
    setForm({
      invoice_number: p.invoice_number || genNumber(), customer_name: p.customer_name,
      party_email: p.party_email || "", party_gst_no: p.party_gst_no || "",
      order_title: p.order_title || "", bill_type: (p.bill_type as any) || "customer",
      status: p.status, payment_date: p.payment_date || "",
      cgst_percent: String(p.cgst_percent ?? 0), sgst_percent: String(p.sgst_percent ?? 0), igst_percent: String(p.igst_percent ?? 0),
      items: items.length ? items : [{ name: p.order_title || "", description: "", quantity: 1, rate: Number(p.amount) || 0, amount: Number(p.amount) || 0 }],
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

  // GST INCLUSIVE: items rate = price seen by customer (incl. GST). Total = sum.
  // Subtotal & GST are derived backwards.
  const grossTotal = form.items.reduce((s, i) => s + i.amount, 0);
  const totalGstPct = (Number(form.cgst_percent) || 0) + (Number(form.sgst_percent) || 0) + (Number(form.igst_percent) || 0);
  const subtotal = totalGstPct > 0 ? round2(grossTotal / (1 + totalGstPct / 100)) : grossTotal;
  const gstTotal = round2(grossTotal - subtotal);
  const cgstAmt = round2(subtotal * (Number(form.cgst_percent) || 0) / 100);
  const sgstAmt = round2(subtotal * (Number(form.sgst_percent) || 0) / 100);
  const igstAmt = round2(gstTotal - cgstAmt - sgstAmt); // remainder so totals always reconcile

  const total = grossTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      invoice_number: form.invoice_number, customer_name: form.customer_name, order_title: form.order_title,
      party_email: form.party_email, party_gst_no: form.party_gst_no, bill_type: form.bill_type,
      items: form.items as any, subtotal,
      cgst_percent: Number(form.cgst_percent) || 0, sgst_percent: Number(form.sgst_percent) || 0, igst_percent: Number(form.igst_percent) || 0,
      cgst_amount: cgstAmt, sgst_amount: sgstAmt, igst_amount: igstAmt,
      amount: total, status: form.status, payment_date: form.payment_date || null,
    };
    const ok = editing ? await update(editing.id, payload as any) : await create(payload as any);
    if (ok) setDialogOpen(false);
  };

  // Mark as received → save then auto-download PDF
  const markReceivedAndDownload = async (p: Payment) => {
    const ok = await update(p.id, { status: "paid", payment_date: new Date().toISOString().slice(0, 10) } as any);
    if (ok) {
      toast.success("Marked as received — generating invoice PDF...");
      const updated = { ...p, status: "paid", payment_date: new Date().toISOString().slice(0, 10) };
      try { await downloadBillPdf(toBill(updated)); } catch (e) { console.error(e); }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Payments & Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">GST-inclusive invoices · 5% Karnataka split / 5% IGST elsewhere</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 gradient-gold text-maroon-deep px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-md font-body">
          <Plus size={14} /> New Invoice
        </button>
      </div>

      <div className="border border-border rounded-lg p-4 mb-4 bg-card">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex gap-1">
            {(["week", "month", "year", "all"] as const).map(p => (
              <button key={p} onClick={() => setPreset(p)} className="px-3 py-1.5 text-xs font-body uppercase tracking-wider border border-border rounded hover:bg-muted">
                {p === "all" ? "All time" : `Last ${p}`}
              </button>
            ))}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-body text-muted-foreground">From</label>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="block border border-border bg-background px-3 py-1.5 text-xs font-body rounded-md" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-body text-muted-foreground">To</label>
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="block border border-border bg-background px-3 py-1.5 text-xs font-body rounded-md" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-body text-muted-foreground">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="block border border-border bg-background px-3 py-1.5 text-xs font-body rounded-md">
              <option value="all">All</option>
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-body text-muted-foreground">Party name</label>
            <input value={filterParty} onChange={e => setFilterParty(e.target.value)} placeholder="search..." className="block border border-border bg-background px-3 py-1.5 text-xs font-body rounded-md" />
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => printBills(filtered.map(toBill))} disabled={!filtered.length}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body border border-border rounded hover:bg-muted disabled:opacity-40">
              <Printer size={13} /> Print all ({filtered.length})
            </button>
            <button onClick={() => downloadMergedPdf(filtered.map(toBill), `invoices-${Date.now()}.pdf`)} disabled={!filtered.length}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body gradient-gold text-maroon-deep rounded disabled:opacity-40">
              <Download size={13} /> Download merged PDF
            </button>
          </div>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr>
              {["Invoice #", "Type", "Party", "Total (incl. GST)", "Status", "Date", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No invoices match filters.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium font-body">{p.invoice_number || `INV-${p.id.slice(0, 6).toUpperCase()}`}</td>
                  <td className="px-4 py-3 text-xs font-body capitalize">{p.bill_type || "customer"}</td>
                  <td className="px-4 py-3 text-sm font-body">{p.customer_name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gold font-body">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-body ${p.status === 'paid' ? 'bg-green-100 text-green-700' : p.status === 'overdue' ? 'bg-destructive/10 text-destructive' : 'bg-gold/10 text-gold'}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {p.status !== "paid" && (
                        <button onClick={() => markReceivedAndDownload(p)} className="text-green-600 hover:text-green-700" title="Mark as Received & download PDF"><CheckCircle2 size={14} /></button>
                      )}
                      <button onClick={() => printBill(toBill(p))} className="text-muted-foreground hover:text-foreground" title="Print"><Printer size={14} /></button>
                      <button onClick={() => downloadBillPdf(toBill(p))} className="text-gold hover:text-gold/80" title="Download PDF"><FileDown size={14} /></button>
                      <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? "Edit Invoice" : "New Invoice"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Invoice #" value={form.invoice_number} onChange={v => setForm({ ...form, invoice_number: v })} required />
            <FormField label="Bill Type" value={form.bill_type} onChange={v => setForm({ ...form, bill_type: v as any })} options={billTypeOptions} />
          </div>

          <div>
            <label className="block text-xs font-body font-medium uppercase tracking-wider mb-1.5">Party</label>
            <PartySelector billType={form.bill_type} name={form.customer_name} email={form.party_email} gstNo={form.party_gst_no}
              onChange={p => setForm({ ...form, customer_name: p.name, party_email: p.email, party_gst_no: p.gstNo })} />
          </div>

          <FormField label="Order / Reference" value={form.order_title} onChange={v => setForm({ ...form, order_title: v })} />

          <div>
            <label className="block text-xs font-body font-medium uppercase tracking-wider mb-2">Items <span className="text-muted-foreground normal-case tracking-normal">(rate is the inclusive price you charge)</span></label>
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
                    <input type="number" min={0} value={item.rate} onChange={e => updateItem(idx, "rate", Number(e.target.value))} placeholder="Rate (incl.)" className="border border-border bg-background px-3 py-2 text-sm font-body rounded-md" />
                    <input readOnly value={`₹${item.amount.toLocaleString("en-IN")}`} className="border border-border bg-secondary px-3 py-2 text-sm font-body rounded-md" />
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
          <p className="text-[10px] text-muted-foreground font-body -mt-2">Tip: Karnataka → 2.5 + 2.5 + 0 · Other states → 0 + 0 + 5</p>

          <div className="bg-secondary/50 rounded-md p-3 text-sm font-body space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Total (gross, what you charge):</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">– GST removed:</span><span>− ₹{gstTotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal (excl. GST):</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            {!!cgstAmt && <div className="flex justify-between text-xs"><span className="text-muted-foreground">CGST ({form.cgst_percent}%):</span><span>₹{cgstAmt.toLocaleString("en-IN")}</span></div>}
            {!!sgstAmt && <div className="flex justify-between text-xs"><span className="text-muted-foreground">SGST ({form.sgst_percent}%):</span><span>₹{sgstAmt.toLocaleString("en-IN")}</span></div>}
            {!!igstAmt && <div className="flex justify-between text-xs"><span className="text-muted-foreground">IGST ({form.igst_percent}%):</span><span>₹{igstAmt.toLocaleString("en-IN")}</span></div>}
            <div className="flex justify-between font-semibold text-gold pt-1 border-t border-border"><span>Customer pays:</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={statusOptions} />
            <FormField label="Payment Date" value={form.payment_date} onChange={v => setForm({ ...form, payment_date: v })} type="date" />
          </div>

          <button type="submit" className="w-full gradient-gold text-maroon-deep py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-md">
            {editing ? "Update Invoice" : "Create Invoice"}
          </button>
        </form>
      </CrudDialog>

      <DeleteConfirm open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) remove(deleteId); setDeleteId(null); }} itemName="invoice" />
    </div>
  );
};

export default AdminPayments;
