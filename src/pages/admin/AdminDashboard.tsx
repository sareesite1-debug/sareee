import { useEffect, useState } from "react";
import { Users, CreditCard, CheckCircle2, ShoppingCart, Package, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ clients: 0, pendingAmount: 0, receivedAmount: 0, customerOrders: 0, products: 0, invoices: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentReceived, setRecentReceived] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [clientsRes, paymentsRes, custOrdersRes, productsRes, recentOrdersRes, receivedRes] = await Promise.all([
        (supabase.from("clients") as any).select("*", { count: "exact", head: true }),
        (supabase.from("payments") as any).select("amount,status"),
        (supabase.from("customer_orders") as any).select("*", { count: "exact", head: true }),
        (supabase.from("products") as any).select("*", { count: "exact", head: true }),
        (supabase.from("customer_orders") as any).select("id,order_number,customer_name,total,status,created_at").order("created_at", { ascending: false }).limit(5),
        (supabase.from("payments") as any).select("id,invoice_number,customer_name,amount,payment_date,created_at").eq("status", "paid").order("created_at", { ascending: false }).limit(5),
      ]);

      const allPayments = paymentsRes.data || [];
      const pendingTotal = allPayments.filter((p: any) => p.status === "pending").reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const receivedTotal = allPayments.filter((p: any) => p.status === "paid").reduce((s: number, p: any) => s + Number(p.amount || 0), 0);

      setStats({
        clients: clientsRes.count || 0,
        pendingAmount: pendingTotal,
        receivedAmount: receivedTotal,
        customerOrders: custOrdersRes.count || 0,
        products: productsRes.count || 0,
        invoices: allPayments.length,
      });
      setRecentOrders(recentOrdersRes.data || []);
      setRecentReceived(receivedRes.data || []);
    };
    load();

    const ch = supabase.channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const kpis = [
    { label: "Payments Received", value: `₹${stats.receivedAmount.toLocaleString("en-IN")}`, icon: CheckCircle2, color: "text-green-600" },
    { label: "Pending Payments", value: `₹${stats.pendingAmount.toLocaleString("en-IN")}`, icon: CreditCard, color: "text-destructive" },
    { label: "Customer Orders", value: String(stats.customerOrders), icon: ShoppingCart, color: "text-gold" },
    { label: "Active Products", value: String(stats.products), icon: Package, color: "text-primary" },
    { label: "Total Invoices", value: String(stats.invoices), icon: FileText, color: "text-gold" },
    { label: "Total Customers", value: String(stats.clients), icon: Users, color: "text-primary" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Welcome back. Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="border border-border p-5 bg-card rounded-lg">
            <k.icon size={20} className={k.color + " mb-3"} />
            <p className="text-2xl font-heading font-semibold">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-body">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border p-6 bg-card rounded-lg">
          <h2 className="font-heading text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body">No orders yet.</p>
            ) : recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-body truncate">{o.customer_name} · {o.order_number}</p>
                  <p className="text-xs text-muted-foreground font-body">{new Date(o.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <span className="text-sm font-medium text-gold font-body shrink-0">₹{Number(o.total).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border p-6 bg-card rounded-lg">
          <h2 className="font-heading text-lg font-semibold mb-4">Recently Received Payments</h2>
          <div className="space-y-3">
            {recentReceived.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body">No received payments yet.</p>
            ) : recentReceived.map((p: any) => (
              <div key={p.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <CheckCircle2 size={14} className="text-green-600 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-body truncate">{p.customer_name} · {p.invoice_number}</p>
                  <p className="text-xs text-muted-foreground font-body">{p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN") : new Date(p.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <span className="text-sm font-semibold text-green-600 font-body shrink-0">₹{Number(p.amount).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
