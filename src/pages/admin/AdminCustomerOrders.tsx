import { useEffect, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CrudDialog from "@/components/admin/CrudDialog";
import DeleteConfirm from "@/components/admin/DeleteConfirm";

interface Order { id: string; order_number: string; customer_name: string; customer_email: string; customer_phone: string; shipping_address: string; total: number; status: string; tracking_status: string; created_at: string; notes: string; shiprocket_order_id?: string; shiprocket_shipment_id?: string; }
interface Item { id: string; product_name: string; unit_price: number; quantity: number; subtotal: number; }

const trackingOptions = ["order_placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const statusOptions = ["pending", "processing", "completed", "cancelled"];

const AdminCustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [del, setDel] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data } = await (supabase.from("customer_orders") as any).select("*").order("created_at", { ascending: false });
    setOrders(data || []); setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const openView = async (o: Order) => {
    setView(o);
    const { data } = await (supabase.from("customer_order_items") as any).select("*").eq("order_id", o.id);
    setItems(data || []);
  };

  const callFn = async (fnName: string, body: object) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fnName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(`[${fnName}] failed:`, data);
      } else {
        console.log(`[${fnName}] ok:`, data);
      }
    } catch (err) { console.error(`[${fnName}] error:`, err); }
  };

  const updateField = async (id: string, field: string, value: string) => {
    const { error } = await (supabase.from("customer_orders") as any).update({ [field]: value }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");

    // Send email when order is confirmed/received (status → processing)
    if (field === "status" && value === "processing") {
      callFn("send-email", { type: "order_received", order_id: id });
    }
    // Send email when order is delivered
    if (field === "tracking_status" && value === "delivered") {
      callFn("send-email", { type: "order_delivered", order_id: id });
    }
    // Send email when order is cancelled (either field)
    if ((field === "tracking_status" || field === "status") && value === "cancelled") {
      callFn("send-email", { type: "order_cancelled", order_id: id });
    }

    refresh();
    if (view?.id === id) setView({ ...view, [field]: value } as any);
  };

  const remove = async (id: string) => {
    const { error } = await (supabase.from("customer_orders") as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold">Customer Orders</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Online orders from customers — update status & tracking</p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr>
              {["Order #", "Customer", "Total", "Status", "Tracking", "Date", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No customer orders yet.</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium font-body">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm font-body">
                    <p>{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gold font-body">₹{Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateField(o.id, "status", e.target.value)} className="text-xs bg-background border border-border rounded px-2 py-1 font-body">
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={o.tracking_status} onChange={e => updateField(o.id, "tracking_status", e.target.value)} className="text-xs bg-background border border-border rounded px-2 py-1 font-body">
                      {trackingOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => openView(o)} className="text-muted-foreground hover:text-foreground"><Eye size={14} /></button>
                    <button onClick={() => setDel(o.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog open={!!view} onOpenChange={() => setView(null)} title={view ? `Order ${view.order_number}` : ""}>
        {view && (
          <div className="space-y-4 text-sm font-body">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Customer</p><p>{view.customer_name}</p><p className="text-muted-foreground">{view.customer_email}</p><p className="text-muted-foreground">{view.customer_phone}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Address</p><p className="whitespace-pre-line">{view.shipping_address}</p></div>
            </div>
            {view.notes && <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p><p>{view.notes}</p></div>}
            <div className="border border-border rounded">
              <table className="w-full text-sm">
                <thead className="bg-secondary"><tr>{["Item", "Qty", "Price", "Subtotal"].map(h => <th key={h} className="text-left px-3 py-2 text-xs uppercase">{h}</th>)}</tr></thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.id} className="border-t border-border">
                      <td className="px-3 py-2">{it.product_name}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
                      <td className="px-3 py-2">₹{Number(it.unit_price).toLocaleString()}</td>
                      <td className="px-3 py-2 font-semibold">₹{Number(it.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-right font-semibold text-gold">Total: ₹{Number(view.total).toLocaleString()}</p>
          </div>
        )}
      </CrudDialog>

      <DeleteConfirm open={!!del} onOpenChange={() => setDel(null)} onConfirm={() => { if (del) remove(del); setDel(null); }} itemName="order" />
    </div>
  );
};

export default AdminCustomerOrders;
