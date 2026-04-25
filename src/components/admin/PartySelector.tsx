import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PartyOption { id: string; name: string; email?: string; gst_no?: string; }

interface Props {
  billType: "customer" | "supplier";
  name: string;
  email: string;
  gstNo: string;
  onChange: (p: { name: string; email: string; gstNo: string }) => void;
}

const PartySelector = ({ billType, name, email, gstNo, onChange }: Props) => {
  const [options, setOptions] = useState<PartyOption[]>([]);
  const [mode, setMode] = useState<"select" | "custom">("custom");

  useEffect(() => {
    (async () => {
      const table = billType === "supplier" ? "vendors" : "clients";
      const cols = billType === "supplier" ? "id,name,contact_email,gst_no" : "id,name,email,gst_no";
      const { data } = await (supabase.from(table) as any).select(cols).order("name");
      const opts: PartyOption[] = (data || []).map((r: any) => ({
        id: r.id, name: r.name,
        email: billType === "supplier" ? r.contact_email : r.email,
        gst_no: r.gst_no,
      }));
      setOptions(opts);
    })();
  }, [billType]);

  const handlePick = (id: string) => {
    if (id === "__custom__") { setMode("custom"); onChange({ name: "", email: "", gstNo: "" }); return; }
    const p = options.find(o => o.id === id);
    if (p) onChange({ name: p.name, email: p.email || "", gstNo: p.gst_no || "" });
  };

  return (
    <div className="space-y-3 border border-border rounded-md p-3 bg-muted/30">
      <div className="flex gap-2 text-xs font-body">
        <button type="button" onClick={() => setMode("select")} className={`px-3 py-1 rounded ${mode === "select" ? "gradient-gold text-maroon-deep" : "bg-background border border-border"}`}>From {billType === "supplier" ? "Suppliers" : "Customers"}</button>
        <button type="button" onClick={() => setMode("custom")} className={`px-3 py-1 rounded ${mode === "custom" ? "gradient-gold text-maroon-deep" : "bg-background border border-border"}`}>Custom</button>
      </div>
      {mode === "select" && (
        <select onChange={e => handlePick(e.target.value)} value=""
          className="w-full border border-border bg-background px-3 py-2 text-sm font-body rounded-md">
          <option value="">— Select {billType === "supplier" ? "supplier" : "customer"} —</option>
          {options.map(o => <option key={o.id} value={o.id}>{o.name}{o.gst_no ? ` (GST: ${o.gst_no})` : ""}</option>)}
        </select>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={name} onChange={e => onChange({ name: e.target.value, email, gstNo })} placeholder="Name" className="border border-border bg-background px-3 py-2 text-sm font-body rounded-md" />
        <input value={email} onChange={e => onChange({ name, email: e.target.value, gstNo })} placeholder="Email" className="border border-border bg-background px-3 py-2 text-sm font-body rounded-md" />
        <input value={gstNo} onChange={e => onChange({ name, email, gstNo: e.target.value })} placeholder="GST Number" className="border border-border bg-background px-3 py-2 text-sm font-body rounded-md" />
      </div>
    </div>
  );
};

export default PartySelector;
