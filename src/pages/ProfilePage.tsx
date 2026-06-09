import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Plus, Trash2, Star, Pencil, Save, X } from "lucide-react";
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

const emptyAddr = { label: "Home", recipient_name: "", phone: "", address_line: "", city: "", state: "Karnataka", zip_code: "", is_default: false };

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: "", phone: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddr, setEditingAddr] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState<typeof emptyAddr | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (uid: string) => {
    const [{ data: p }, { data: a }] = await Promise.all([
      (supabase.from("profiles") as any).select("full_name, email, phone").eq("user_id", uid).maybeSingle(),
      (supabase.from("customer_addresses") as any).select("*").eq("user_id", uid).order("is_default", { ascending: false }).order("created_at", { ascending: false }),
    ]);
    setProfile({ full_name: p?.full_name || "", email: p?.email || "", phone: p?.phone || "" });
    setAddresses(a || []);
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

  if (loading) return <div className="container mx-auto px-4 py-32 text-center font-body text-ink-soft">Loading...</div>;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="container mx-auto px-6 pt-36 pb-24 max-w-4xl">
        <motion.div initial={{ opacity: 1, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
          <p className="eyebrow text-gold-dark mb-3">Your Account</p>
          <h1 className="text-display text-4xl md:text-5xl text-ink">My Profile</h1>
        </motion.div>

        {/* Personal details */}
        <section className="glass-card p-8 md:p-10 mb-10">
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

        {/* Saved addresses */}
        <section className="glass-card p-8 md:p-10">
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
