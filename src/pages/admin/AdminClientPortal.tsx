import { ShoppingCart, Calendar, Heart, Star, MessageSquare, Package } from "lucide-react";

const AdminClientPortal = () => (
  <div className="max-w-4xl">
    <div className="mb-8">
      <h1 className="text-2xl font-heading font-semibold">Customer Portal</h1>
      <p className="text-sm text-muted-foreground mt-1 font-body">
        The Customer Portal is the part of the site your shoppers actually use after signing in. It bundles every customer-facing
        capability of Arpitha Saree Center in one place — placing orders, tracking shipments, talking to you, and managing their account.
      </p>
    </div>

    <div className="border border-border rounded-lg p-6 bg-card mb-6">
      <h2 className="font-heading text-lg font-semibold mb-2">What customers can do here</h2>
      <p className="text-sm text-muted-foreground font-body leading-relaxed">
        When a customer signs up on the storefront, they automatically get a personal portal. Everything below is already wired up in
        your live site — this page is a quick reference of the experience they get.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { icon: ShoppingCart, title: "Cart & Checkout", desc: "Add sarees to cart, apply state-based GST and place orders with COD or online payment." },
        { icon: Package, title: "Order Tracking", desc: "View live status from order placed → confirmed → packed → shipped → delivered. Cancel anytime before delivery." },
        { icon: Calendar, title: "Appointment Booking", desc: "Customers can request a boutique visit or bridal consultation directly from the contact page." },
        { icon: MessageSquare, title: "Live Chat", desc: "One-on-one chat with the shop, with admin replies syncing in real time." },
        { icon: Heart, title: "Account & Profile", desc: "Manage email, name and view full order history under My Orders." },
        { icon: Star, title: "Email Notifications", desc: "Customers receive automatic emails when their order is received, delivered or cancelled." },
      ].map(f => (
        <div key={f.title} className="border border-border rounded-lg p-5 bg-card">
          <f.icon size={18} className="text-gold mb-3" />
          <h3 className="font-heading font-medium text-base mb-1">{f.title}</h3>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
);
export default AdminClientPortal;
