import { useMemo } from "react";
import { resolveColor } from "@/lib/colorNames";
import { X } from "lucide-react";

export interface FilterableProduct {
  id: string;
  category_id: string | null;
  price: number;
  colors?: string[] | null;
  color?: string | null;
}

export interface FilterCategory { id: string; name: string; }

export interface FilterState {
  categoryId: string; // "all" or id
  colors: string[];   // lowercased color names
  minPrice: number;
  maxPrice: number;
}

interface Props {
  products: FilterableProduct[];
  categories: FilterCategory[];
  showCategory?: boolean;
  state: FilterState;
  onChange: (next: FilterState) => void;
  priceBounds: { min: number; max: number };
}

export function applyProductFilters<T extends FilterableProduct>(products: T[], f: FilterState): T[] {
  return products.filter(p => {
    if (f.categoryId !== "all" && p.category_id !== f.categoryId) return false;
    if (Number(p.price) < f.minPrice || Number(p.price) > f.maxPrice) return false;
    if (f.colors.length) {
      const pc = [...(p.colors || []), ...(p.color ? [p.color] : [])].map(c => c.toLowerCase());
      if (!f.colors.some(c => pc.includes(c))) return false;
    }
    return true;
  });
}

const ProductFilters = ({ products, categories, showCategory = true, state, onChange, priceBounds }: Props) => {
  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      (p.colors || []).forEach(c => set.add(c.toLowerCase()));
      if (p.color) set.add(p.color.toLowerCase());
    });
    return Array.from(set).sort();
  }, [products]);

  const toggleColor = (c: string) => {
    const next = state.colors.includes(c) ? state.colors.filter(x => x !== c) : [...state.colors, c];
    onChange({ ...state, colors: next });
  };

  const hasActive =
    state.categoryId !== "all" ||
    state.colors.length > 0 ||
    state.minPrice !== priceBounds.min ||
    state.maxPrice !== priceBounds.max;

  return (
    <aside className="bg-ivory-deep/40 border border-gold/15 p-5 lg:p-6 space-y-7" aria-label="Product filters">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[10px] tracking-[0.3em] uppercase text-ink">Refine</h2>
        {hasActive && (
          <button
            type="button"
            onClick={() => onChange({ categoryId: "all", colors: [], minPrice: priceBounds.min, maxPrice: priceBounds.max })}
            className="font-display text-[9px] tracking-[0.25em] uppercase text-gold-dark hover:text-emerald inline-flex items-center gap-1"
          >
            <X size={11} aria-hidden="true" /> Clear
          </button>
        )}
      </div>

      {showCategory && categories.length > 0 && (
        <div>
          <h3 className="font-heading text-base text-ink mb-3">Category</h3>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-body text-ink-soft cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={state.categoryId === "all"}
                onChange={() => onChange({ ...state, categoryId: "all" })}
                className="accent-emerald"
              />
              All
            </label>
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-2 text-sm font-body text-ink-soft cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={state.categoryId === c.id}
                  onChange={() => onChange({ ...state, categoryId: c.id })}
                  className="accent-emerald"
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-heading text-base text-ink mb-3">Price</h3>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Minimum price</span>
            <input
              type="number"
              inputMode="numeric"
              min={priceBounds.min}
              max={state.maxPrice}
              value={state.minPrice}
              onChange={e => onChange({ ...state, minPrice: Math.max(priceBounds.min, Number(e.target.value) || 0) })}
              className="w-full border border-gold/25 bg-ivory px-3 py-2 text-sm font-body text-ink focus:border-emerald focus:outline-none"
              aria-label="Minimum price"
            />
          </label>
          <span className="text-ink-soft" aria-hidden="true">—</span>
          <label className="flex-1">
            <span className="sr-only">Maximum price</span>
            <input
              type="number"
              inputMode="numeric"
              min={state.minPrice}
              max={priceBounds.max}
              value={state.maxPrice}
              onChange={e => onChange({ ...state, maxPrice: Math.min(priceBounds.max, Number(e.target.value) || priceBounds.max) })}
              className="w-full border border-gold/25 bg-ivory px-3 py-2 text-sm font-body text-ink focus:border-emerald focus:outline-none"
              aria-label="Maximum price"
            />
          </label>
        </div>
        <p className="mt-2 text-[11px] font-body text-ink-soft">
          ₹{state.minPrice.toLocaleString("en-IN")} – ₹{state.maxPrice.toLocaleString("en-IN")}
        </p>
      </div>

      {allColors.length > 0 && (
        <div>
          <h3 className="font-heading text-base text-ink mb-3">Colour</h3>
          <div className="flex flex-wrap gap-2">
            {allColors.map(c => {
              const hex = resolveColor(c) || "#cccccc";
              const active = state.colors.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleColor(c)}
                  aria-pressed={active}
                  aria-label={`Filter by colour ${c}`}
                  title={c}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all ${active ? "border-emerald scale-110" : "border-gold/25 hover:border-gold"}`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
          </div>
          {state.colors.length > 0 && (
            <p className="mt-2 text-[11px] font-body text-ink-soft capitalize">{state.colors.join(", ")}</p>
          )}
        </div>
      )}
    </aside>
  );
};

export default ProductFilters;
