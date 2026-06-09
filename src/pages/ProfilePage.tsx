import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Plus, Trash2, Star, Pencil, Save, X, Package, LogOut, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Chandigarh",
];

interface Profile { full_name: string; email: string; phone: string | null; }
interface Address {
  id: string; label: string | null; recipient_name: string; phone: string;
  address_line: string; city: string; state: string; zip_code: string; is_default: boolean;
}
interface Order {
  id: string; order_number: string; total: number; status: string; created_at: string;
  customer_order_items: { product_name: string; quantity: number }[];
}

const emptyAddr = { label: "Home", recipient_name: "", phone: "", address_line: "", city: "", state: "Karnataka", zip_code: "", is_default: false };

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userId, setUserId]               = useState<string | null>(null);
  const [profile, setProfile]             = useState<Profile>({ full_name: "", email: "", phone: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [addresses, setAddresses]         = useState<Address[]>([]);
  const [editingAddr, setEditingAddr]     = useState<string | null>(null);
  const [newAddr, setNewAddr]             = useState<typeof emptyAddr | null>(null);
  const [orders, setOrders]               = useState<Order[]>([]);
  const [loading, setLoading]             = useState(true);
  const [changingPw, setChangingPw]       = useState(false);
  const [pwForm, setPwForm]               = useState({ newPw: "", confirmPw: "" });
  const [pwLoading, setPwLoading]         = useState(false);

  const load = async (uid: string) => {
    const [{ data: p }, { data: a }, { data: o }] = await Promise.all([
      (supabase.from("profiles") as any).select("full_name, email, phone").eq("user_id", uid).maybeSingle(),
      (supabase.from("customer_addresses") as any).select("*").eq("user_id", uid).order("is_default", { ascending: false }).order("created_at", { ascending: false }),
      (supabase.from("customer_orders") as any)
        .select("id, order_number, total, status, created_at, customer_order_items(product_name, quantity)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    setProfile({ full_name: p?.full_name || "", email: p?.email || "", phone: p?.phone || "" });
    setAddresses(a || []);
    setOrders(o || []);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
      load(session.user.id);
    });
  }, [navigate]);

  const saveProfile = async () => {
    if (!userId) return;
    const { error } = await (supabase.from("profiles") as any)
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    setEditingProfile(false);
  };

  const saveAddress = async (addr: any, id?: string) => {
    if (!userId) return;
    if (!addr.recipient_name || !addr.phone || !addr.address_line || !addr.city || !addr.zip_code) {
      toast.error("Please fill all required fields"); return;
    }
    if (addr.is_default) {
      await (supabase.from("customer_addresses") as any).update({ is_default: false }).eq("user_id", userId);
    }
    if (id) {
      const { error } = await (supabase.from("customer_addresses") as any).update(addr).eq("id", id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await (supabase.from("customer_addresses") as any).insert({ ...addr, user_id: userId });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Address saved");
    setEditingAddr(null); setNewAddr(null);
    load(userId);
  };

  const removeAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const { error } = await (supabase.from("customer_addresses") as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Address removed");
    if (userId) load(userId);
  };

  const setDefault = async (id: string) => {
    if (!userId) return;
    await (supabase.from("customer_addresses") as any).update({ is_default: false }).eq("user_id", userId);
    await (supabase.from("customer_addresses") as any).update({ is_default: true }).eq("id", id);
    load(userId);
  };

  const handleChangePassword = async () => {
    if (pwForm.newPw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (pwForm.newPw !== pwForm.confirmPw) { toast.error("Passwords do not match"); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
    setPwLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated successfully");
    setChangingPw(false);
    setPwForm({ newPw: "", confirmPw: "" });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      pending: "text-amber-600 bg-amber-50 border-amber-200",
      processing: "text-blue-600 bg-blue-50 border-blue-200",
      shipped: "text-purple-600 bg-purple-50 border-purple-200",
      delivered: "text-emerald-600 bg-emerald-50 border-emerald-200",
      cancelled: "text-rose-600 bg-rose-50 border-rose-200",
    };
    return m[s?.toLowerCase()] || "text-ink-soft bg-ivory-deep border-gold/20";
  };

  if (loading) return <div className="container mx-auto px-4 py-32 text-center font-body text-ink-soft">Loading...</div>;

  const userInitial = profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="bg-ivory min-h-screen">
      <div className="container mx-auto px-6 pt-36 pb-24 max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-gold-dark mb-3">Your Account</p>
              <h1 className="text-display text-4xl md:text-5xl text-ink">My Profile</h1>
            </div>
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-maroon-deep flex items-center justify-center shrink-0">
              <span className="font-heading text-ivory text-2xl">{userInitial}</span>
            </div>
          </div>
        </motion.div>

        {/* Personal details */}
        <section className="glass-card p-8 md:p-10 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gold/15">
            <div className="flex items-center gap-3">
              <User size={16} className="text-gold" />
              <h2 className="font-heading text-2xl text-ink">Personal Details</h2>
            </div>
            {!editingProfile ? (
              <button onClick={() => setEditingProfile(true)} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald hover:text-emerald-deep font-body">
                <Pencil size={12} /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => { setEditingProfile(false); if (userId) load(userId); }} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-soft font-body"><X size={12} /> Cancel</button>
                <button onClick={saveProfile} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald font-body"><Save size={12} /> Save</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">Full Name</label>
              <input value={profile.full_name} disabled={!editingProfile} onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full border-b border-gold/30 bg-transparent py-2 text-sm font-body text-ink focus:outline-none focus:border-emerald disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft flex items-center gap-1.5"><Mail size={10} /> Email</label>
              <input value={profile.email} disabled className="w-full border-b border-gold/30 bg-transparent py-2 text-sm font-body text-ink opacity-70" />
            </div>
            <div>
              <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft flex items-center gap-1.5"><Phone size={10} /> Phone</label>
              <input value={profile.phone || ""} disabled={!editingProfile} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full border-b border-gold/30 bg-transparent py-2 text-sm font-body text-ink focus:outline-none focus:border-emerald disabled:opacity-70" />
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section className="glass-card p-8 md:p-10 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gold/15">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-gold" />
              <h2 className="font-heading text-2xl text-ink">Password</h2>
            </div>
            {!changingPw ? (
              <button onClick={() => setChangingPw(true)} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald hover:text-emerald-deep font-body">
                <Pencil size={12} /> Change
              </button>
            ) : (
              <button onClick={() => { setChangingPw(false); setPwForm({ newPw: "", confirmPw: "" }); }} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink-soft font-body">
                <X size={12} /> Cancel
              </button>
            )}
          </div>

          {!changingPw ? (
            <p className="text-sm font-body text-ink-soft">••••••••••••</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">New Password</label>
                <input type="password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
                  className="w-full border-b border-gold/30 bg-transparent py-2 text-sm font-body text-ink focus:outline-none focus:border-emerald" />
              </div>
              <div>
                <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">Confirm Password</label>
                <input type="password" value={pwForm.confirmPw} onChange={e => setPwForm({ ...pwForm, confirmPw: e.target.value })}
                  className="w-full border-b border-gold/30 bg-transparent py-2 text-sm font-body text-ink focus:outline-none focus:border-emerald" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button onClick={handleChangePassword} disabled={pwLoading}
                  className="px-6 py-2.5 bg-maroon-deep text-ivory font-display text-[9px] tracking-[0.25em] uppercase hover:bg-maroon transition-colors disabled:opacity-60">
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Recent Orders */}
        <section className="glass-card p-8 md:p-10 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gold/15">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-gold" />
              <h2 className="font-heading text-2xl text-ink">Recent Orders</h2>
            </div>
            <Link to="/orders" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald hover:text-emerald-deep font-body">
              View all
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-ink-soft font-body py-8 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <Link key={o.id} to={`/orders/${o.id}`}
                  className="flex items-center justify-between p-4 border border-gold/20 bg-ivory-deep/30 hover:border-gold/40 transition-colors group">
                  <div>
                    <p className="font-heading text-lg text-ink group-hover:text-maroon transition-colors">{o.order_number}</p>
                    <p className="text-[11px] font-body text-ink-soft mt-0.5">
                      {o.customer_order_items?.map((i: any) => `${i.product_name} × ${i.quantity}`).join(", ")}
                    </p>
                    <p className="text-[10px] font-body text-ink-soft/60 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border font-body ${statusColor(o.status)}`}>
                      {o.status}
                    </span>
                    <p className="font-heading text-lg text-ink">₹{o.total.toLocaleString("en-IN")}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Saved addresses */}
        <section className="glass-card p-8 md:p-10 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gold/15">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gold" />
              <h2 className="font-heading text-2xl text-ink">Saved Addresses</h2>
            </div>
            {!newAddr && (
              <button onClick={() => setNewAddr({ ...emptyAddr, recipient_name: profile.full_name, phone: profile.phone || "" })} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald hover:text-emerald-deep font-body">
                <Plus size={12} /> Add new
              </button>
            )}
          </div>

          {newAddr && (
            <AddressForm
              data={newAddr}
              onChange={setNewAddr as any}
              onSave={() => saveAddress(newAddr)}
              onCancel={() => setNewAddr(null)}
            />
          )}

          {addresses.length === 0 && !newAddr ? (
            <p className="text-sm text-ink-soft font-body py-8 text-center">No saved addresses yet.</p>
          ) : (
            <div className="space-y-4 mt-4">
              {addresses.map(a => editingAddr === a.id ? (
                <AddressForm
                  key={a.id}
                  data={a}
                  onChange={(d: any) => setAddresses(addresses.map(x => x.id === a.id ? { ...x, ...d } : x))}
                  onSave={() => saveAddress(addresses.find(x => x.id === a.id), a.id)}
                  onCancel={() => { setEditingAddr(null); if (userId) load(userId); }}
                />
              ) : (
                <div key={a.id} className="border border-gold/20 p-5 bg-ivory-deep/30">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-heading text-lg text-ink">{a.label || "Address"}</span>
                        {a.is_default && <span className="text-[9px] uppercase tracking-widest text-emerald bg-emerald/10 px-2 py-0.5 border border-emerald/20">Default</span>}
                      </div>
                      <p className="text-sm font-body text-ink">{a.recipient_name} · {a.phone}</p>
                      <p className="text-sm text-ink-soft font-body mt-1">{a.address_line}, {a.city}, {a.state} - {a.zip_code}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {!a.is_default && <button onClick={() => setDefault(a.id)} title="Set default" className="text-ink-soft hover:text-emerald"><Star size={14} /></button>}
                      <button onClick={() => setEditingAddr(a.id)} title="Edit" className="text-ink-soft hover:text-emerald"><Pencil size={14} /></button>
                      <button onClick={() => removeAddress(a.id)} title="Delete" className="text-ink-soft hover:text-rose"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sign out */}
        <div className="flex justify-end">
          <button onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gold/25 text-ink-soft hover:text-maroon hover:border-maroon/40 transition-colors font-display text-[9px] tracking-[0.3em] uppercase">
            <LogOut size={13} strokeWidth={1.5} /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

const AddressForm = ({ data, onChange, onSave, onCancel }: { data: any; onChange: (d: any) => void; onSave: () => void; onCancel: () => void }) => (
  <div className="border border-emerald/30 p-5 bg-emerald/5 mb-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Label (Home / Work)" value={data.label || ""} onChange={(v) => onChange({ ...data, label: v })} />
      <Field label="Recipient Name *" value={data.recipient_name} onChange={(v) => onChange({ ...data, recipient_name: v })} />
      <Field label="Phone *" value={data.phone} onChange={(v) => onChange({ ...data, phone: v })} />
      <Field label="Pincode *" value={data.zip_code} onChange={(v) => onChange({ ...data, zip_code: v })} />
      <div className="md:col-span-2">
        <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">Full Address *</label>
        <textarea value={data.address_line} onChange={e => onChange({ ...data, address_line: e.target.value })} rows={2}
          className="w-full border border-gold/20 bg-ivory p-3 text-sm font-body focus:outline-none focus:border-emerald" />
      </div>
      <Field label="City *" value={data.city} onChange={(v) => onChange({ ...data, city: v })} />
      <div>
        <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">State *</label>
        <select value={data.state} onChange={e => onChange({ ...data, state: e.target.value })}
          className="w-full border-b border-gold/30 bg-transparent py-2 text-sm font-body text-ink focus:outline-none focus:border-emerald">
          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <label className="md:col-span-2 inline-flex items-center gap-2 text-sm font-body text-ink-soft">
        <input type="checkbox" checked={!!data.is_default} onChange={e => onChange({ ...data, is_default: e.target.checked })} className="accent-emerald" />
        Set as default address
      </label>
    </div>
    <div className="flex justify-end gap-3 mt-5">
      <button onClick={onCancel} className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-ink-soft border border-gold/20 font-body">Cancel</button>
      <button onClick={onSave} className="px-5 py-2 text-[10px] uppercase tracking-[0.2em] bg-emerald text-ivory font-body">Save Address</button>
    </div>
  </div>
);

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)}
      className="w-full border-b border-gold/30 bg-transparent py-2 text-sm font-body text-ink focus:outline-none focus:border-emerald" />
  </div>
);

export default ProfilePage;
