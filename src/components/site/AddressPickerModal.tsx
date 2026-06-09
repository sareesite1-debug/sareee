import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, X, Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface SavedAddress {
  id: string; label: string | null; recipient_name: string; phone: string;
  address_line: string; city: string; state: string; zip_code: string; is_default: boolean;
}

const AddressPickerModal = ({
  open, userId, onClose, onSelect, onNew,
}: {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSelect: (a: SavedAddress) => void;
  onNew: () => void;
}) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    (supabase.from("customer_addresses") as any)
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }: any) => { setAddresses(data || []); setLoading(false); });
  }, [open, userId]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-ivory border border-gold/20 shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto pointer-events-auto">
              <div className="flex items-center justify-between p-6 border-b border-gold/15">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-gold" />
                  <h3 className="font-heading text-xl text-ink">Choose an address</h3>
                </div>
                <button onClick={onClose} className="text-ink-soft hover:text-ink"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-3">
                {loading ? (
                  <p className="text-center text-sm text-ink-soft font-body py-6">Loading...</p>
                ) : addresses.length === 0 ? (
                  <p className="text-center text-sm text-ink-soft font-body py-6">No saved addresses yet.</p>
                ) : addresses.map(a => (
                  <button key={a.id} onClick={() => onSelect(a)}
                    className="w-full text-left border border-gold/20 p-4 hover:border-emerald hover:bg-emerald/5 transition-colors group">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-heading text-base text-ink">{a.label || "Address"}</span>
                          {a.is_default && <span className="text-[8px] uppercase tracking-widest text-emerald bg-emerald/10 px-1.5 py-0.5 border border-emerald/20 inline-flex items-center gap-1"><Star size={8} /> Default</span>}
                        </div>
                        <p className="text-sm font-body text-ink">{a.recipient_name} · {a.phone}</p>
                        <p className="text-xs text-ink-soft font-body mt-1">{a.address_line}, {a.city}, {a.state} - {a.zip_code}</p>
                      </div>
                      <Check size={16} className="text-emerald opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  </button>
                ))}

                <button onClick={onNew}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-gold/30 py-4 text-[10px] uppercase tracking-[0.25em] text-emerald hover:border-emerald hover:bg-emerald/5 transition-colors font-body">
                  <Plus size={12} /> Enter a new address
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddressPickerModal;
