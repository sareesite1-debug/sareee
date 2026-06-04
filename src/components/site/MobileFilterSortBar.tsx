import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ProductFilters, { FilterableProduct, FilterCategory, FilterState, SortKey, SORT_OPTIONS } from "./ProductFilters";

interface Props {
  products: FilterableProduct[];
  categories: FilterCategory[];
  showCategory?: boolean;
  state: FilterState;
  onChange: (next: FilterState) => void;
  priceBounds: { min: number; max: number };
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  visibleCount: number;
}

/**
 * Sticky bottom Filter + Sort bar — mobile only (hidden on lg+).
 * Each button opens a bottom drawer. Safe-area aware for iOS notch devices.
 */
const MobileFilterSortBar = ({
  products, categories, showCategory = true, state, onChange, priceBounds,
  sort, onSortChange, visibleCount,
}: Props) => {
  const [sortOpen, setSortOpen] = useState(false);
  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || "Sort";

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-gold/25 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-2 divide-x divide-gold/20">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3.5 font-display text-[10px] tracking-[0.25em] uppercase text-ink active:bg-ivory-deep"
              aria-label="Open filters"
            >
              <SlidersHorizontal size={14} aria-hidden="true" /> Filter
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto p-0 bg-ivory">
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-gold/15">
              <SheetTitle className="font-heading text-2xl text-ink text-left">Filter</SheetTitle>
              <p className="text-[11px] font-body text-ink-soft text-left">{visibleCount} {visibleCount === 1 ? "piece" : "pieces"}</p>
            </SheetHeader>
            <div className="p-4">
              <ProductFilters
                products={products}
                categories={categories}
                showCategory={showCategory}
                state={state}
                onChange={onChange}
                priceBounds={priceBounds}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={sortOpen} onOpenChange={setSortOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3.5 font-display text-[10px] tracking-[0.25em] uppercase text-ink active:bg-ivory-deep"
              aria-label={`Sort by ${sortLabel}`}
            >
              <ArrowUpDown size={14} aria-hidden="true" /> Sort
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="p-0 bg-ivory">
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-gold/15">
              <SheetTitle className="font-heading text-2xl text-ink text-left">Sort by</SheetTitle>
            </SheetHeader>
            <div className="py-2">
              {SORT_OPTIONS.map(o => {
                const active = o.value === sort;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onSortChange(o.value); setSortOpen(false); }}
                    className={`w-full flex items-center justify-between px-5 py-4 text-sm font-body text-left ${active ? "text-emerald" : "text-ink"} hover:bg-ivory-deep/60`}
                  >
                    <span>{o.label}</span>
                    {active && <Check size={16} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileFilterSortBar;
