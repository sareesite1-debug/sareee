import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Image, FileText,
  CreditCard, Package, Shield, Calendar,
  MessageSquare, UserCircle, LogOut, Menu, X, ShoppingBag, ShoppingCart, Users
} from "lucide-react";
import { useState } from "react";

const adminNav = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: ShoppingBag },
  { label: "Customer Orders", to: "/admin/customer-orders", icon: ShoppingCart },
  { label: "Customers", to: "/admin/clients", icon: Users },
  { label: "Collections", to: "/admin/portfolio", icon: Image },
  { label: "Quotations", to: "/admin/quotations", icon: FileText },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Suppliers", to: "/admin/vendors", icon: Package },
  { label: "Team", to: "/admin/team", icon: Shield },
  { label: "Content", to: "/admin/content", icon: FileText },
  { label: "Appointments", to: "/admin/appointments", icon: Calendar },
  { label: "Chat", to: "/admin/chat", icon: MessageSquare },
  { label: "Customer Portal", to: "/admin/client-portal", icon: UserCircle },
];

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-maroon-deep shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gold/10">
          <Link to="/admin" className="font-heading text-lg font-semibold tracking-wide text-gold">
            ASC <span className="text-xs font-body text-warm-white/40 ml-1">Arpitha Saree Center · Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
          {adminNav.map(item => {
            const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors font-body ${
                  active ? "bg-gold/10 text-gold" : "text-warm-white/50 hover:text-warm-white hover:bg-warm-white/5"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gold/10">
          <Link to="/" className="flex items-center gap-2 text-sm text-warm-white/40 hover:text-warm-white transition-colors font-body">
            <LogOut size={16} /> Back to Site
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-maroon-deep/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-maroon-deep flex flex-col">
            <div className="p-6 border-b border-gold/10 flex items-center justify-between">
              <span className="font-heading text-lg font-semibold text-gold">Admin</span>
              <button onClick={() => setSidebarOpen(false)} className="text-warm-white/60"><X size={20} /></button>
            </div>
            <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
              {adminNav.map(item => {
                const active = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors font-body ${
                      active ? "bg-gold/10 text-gold" : "text-warm-white/50 hover:text-warm-white"
                    }`}>
                    <item.icon size={18} />{item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-maroon-deep p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-warm-white/60"><Menu size={22} /></button>
          <span className="font-heading text-lg font-semibold text-gold">Admin</span>
          <Link to="/" className="text-xs text-warm-white/40 font-body">Site →</Link>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
