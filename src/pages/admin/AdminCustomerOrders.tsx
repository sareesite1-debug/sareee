import { useEffect, useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CrudDialog from "@/components/admin/CrudDialog";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { colorToSwatch } from "@/lib/colorNames";

interface Order { id: string; order_number: string; customer_name: string; customer_email: string; customer_phone: string; shipping_address: string; total: number; status: string; tracking_status: string; created_at: string; notes: string; shiprocket_order_id?: string; shiprocket_shipment_id?: string; }
interface Item { id: string; product_name: string; unit_price: number; quantity: number; subtotal: number; product_image?: string | null; product_color?: string | null; }

const trackingOptions = ["order_placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const statusOptions = ["pending", "processing", "completed", "cancelled"];

const AdminCustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, Item[]>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [del, setDel] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data } = await (supabase.from("customer_orders") as any).select("*").order("created_at", { ascending: false });
    const orderList: Order[] = data || [];
    setOrders(orderList);
    if (orderList.length) {
      const ids = orderList.map(o => o.id);
      const { data: allItems } = await (supabase.from("customer_order_items") as any).select("*").in("order_id", ids);
      const map: Record<string, Item[]> = {};
      (allItems || []).forEach((it: any) => { (map[it.order_id] = map[it.order_id] || []).push(it); });
      setOrderItems(map);
    } else setOrderItems({});
    setLoading(false);
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
      if (!res.ok) console.error(`[${fnName}] failed:`, data);
    } catch (err) { console.error(`[${fnName}] error:`, err); }
  };

  const updateField = async (id: string, field: string, value: string) => {
    const { error } = await (supabase.from("customer_orders") as any).update({ [field]: value }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");

    if (field === "status" && value === "processing") callFn("send-email", { type: "order_received", order_id: id });
    if (field === "tracking_status" && value === "delivered") callFn("send-email", { type: "order_delivered", order_id: id });
    if ((field === "tracking_status" || field === "status") && value === "cancelled") callFn("send-email", { type: "order_cancelled", order_id: id });

    refresh();
    if (view?.id === id) setView({ ...view, [field]: value } as any);
  };

  const remove = async (id: string) => {
    const { error } = await (supabase.from("customer_orders") as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  const shippedOrDelivered = (o: Order) => o.tracking_status === "shipped" || o.tracking_status === "delivered";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold">Customer Orders</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Once shipped or delivered, an order cannot be cancelled.</p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground font-body animate-pulse">Loading...</p> : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-secondary"><tr>
              {["Order #", "Customer", "Products", "Total", "Status", "Tracking", "Date", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider font-body whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground font-body">No customer orders yet.</td></tr>
              ) : orders.map(o => {
                const locked = shippedOrDelivered(o);
                return (
                <tr key={o.id} className="border-t border-border hover:bg-muted/50 align-top">
                  <td className="px-4 py-3 text-sm font-medium font-body whitespace-nowrap">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm font-body">
                    <p>{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-body min-w-[280px]">
                    {(orderItems[o.id] || []).length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <ul className="space-y-1.5">
                        {(orderItems[o.id] || []).map(it => (
                          <li key={it.id} className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-secondary rounded overflow-hidden shrink-0 border border-border">
                              {it.product_image && <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" loading="lazy" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium leading-tight truncate">{it.product_name}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                Qty {it.quantity}
                                {it.product_color && (
                                  <>
                                    <span className="inline-flex items-center gap-1">
                                      · <span className="w-2.5 h-2.5 rounded-full border border-border inline-block" style={{ background: colorToSwatch(it.product_color) }} />
                                      <span className="capitalize">{it.product_color}</span>
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gold font-body whitespace-nowrap">₹{Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateField(o.id, "status", e.target.value)} className="text-xs bg-background border border-border rounded px-2 py-1 font-body">
                      {statusOptions.map(s => (
                        <option key={s} value={s} disabled={s === "cancelled" && locked}>{s}{s === "cancelled" && locked ? " (locked)" : ""}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={o.tracking_status} onChange={e => updateField(o.id, "tracking_status", e.target.value)} className="text-xs bg-background border border-border rounded px-2 py-1 font-body">
                      {trackingOptions.map(s => (
                        <option key={s} value={s} disabled={s === "cancelled" && locked}>{s.replace(/_/g, " ")}{s === "cancelled" && locked ? " (locked)" : ""}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-body whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button onClick={() => openView(o)} className="text-muted-foreground hover:text-foreground"><Eye size={14} /></button>
                    <button onClick={() => setDel(o.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      )}

      <CrudDialog open={!!view} onOpenChange={() => setView(null)} title={view ? `Order ${view.order_number}` : ""}>
        {view && (
          <div className="space-y-4 text-sm font-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Customer</p><p>{view.customer_name}</p><p className="text-muted-foreground">{view.customer_email}</p><p className="text-muted-foreground">{view.customer_phone}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Address</p><p className="whitespace-pre-line">{view.shipping_address}</p></div>
            </div>
            {view.notes && <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p><p>{view.notes}</p></div>}
            <div className="border border-border rounded overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-secondary"><tr>{["Item", "Color", "Qty", "Price", "Subtotal"].map(h => <th key={h} className="text-left px-3 py-2 text-xs uppercase">{h}</th>)}</tr></thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-secondary rounded overflow-hidden shrink-0 border border-border">
                            {it.product_image && <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" loading="lazy" />}
                          </div>
                          <span>{it.product_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {it.product_color ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border border-border" style={{ background: colorToSwatch(it.product_color) }} />
                            <span className="capitalize text-xs">{it.product_color}</span>
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
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
