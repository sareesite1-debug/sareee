import { useState } from "react";
import { X } from "lucide-react";
import { resolveColor, colorToSwatch, suggestColors } from "@/lib/colorNames";
import { toast } from "sonner";

interface Props {
  colors: string[];
  onChange: (next: string[]) => void;
  label?: string;
}

const ColorTagInput = ({ colors, onChange, label = "Colors" }: Props) => {
  const [draft, setDraft] = useState("");
  const suggestions = suggestColors(draft);

  const add = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (colors.map(c => c.toLowerCase()).includes(clean.toLowerCase())) {
      toast.info("Already added");
      return;
    }
    if (!resolveColor(clean)) {
      toast.error(`"${clean}" isn't a recognised color — try a name like "maroon" or a hex like "#8B1E3F"`);
      return;
    }
    onChange([...colors, clean]);
    setDraft("");
  };

  const remove = (idx: number) => onChange(colors.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-xs font-body font-medium uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {colors.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full pl-1.5 pr-2 py-1 text-xs font-body">
            <span className="w-4 h-4 rounded-full border border-border shrink-0" style={{ background: colorToSwatch(c) }} />
            <span className="capitalize">{c}</span>
            <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder="Type a color name (e.g. maroon, emerald) and press Enter"
          className="w-full border border-border bg-background px-4 py-2.5 text-sm font-body rounded-md"
        />
        {draft && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-body hover:bg-muted text-left"
              >
                <span className="w-3 h-3 rounded-full border border-border" style={{ background: colorToSwatch(s) }} />
                <span className="capitalize">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground font-body mt-1">Add multiple — customers will see all options on the product page.</p>
    </div>
  );
};

export default ColorTagInput;
