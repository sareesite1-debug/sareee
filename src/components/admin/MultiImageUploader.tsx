import { useRef, useState } from "react";
import { Upload, Loader2, X, Star } from "lucide-react";
import { toast } from "sonner";
import { uploadEnhancedImage } from "@/lib/imageUpload";

interface Props {
  images: string[];
  onChange: (urls: string[]) => void;
  primaryUrl?: string;
  onPrimaryChange?: (url: string) => void;
  folder?: "products" | "categories";
  label?: string;
}

/**
 * Multi-image uploader. The first image (or the explicit primary) is shown as the
 * main product image (image_url). Others fall under product.images.
 */
const MultiImageUploader = ({
  images,
  onChange,
  primaryUrl,
  onPrimaryChange,
  folder = "products",
  label = "Product Images",
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const next = [...images];
    let newPrimary = primaryUrl;
    try {
      for (const f of Array.from(files)) {
        const url = await uploadEnhancedImage(f, folder);
        next.push(url);
        if (!newPrimary) newPrimary = url;
      }
      onChange(next);
      if (onPrimaryChange && newPrimary && newPrimary !== primaryUrl) onPrimaryChange(newPrimary);
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = (idx: number) => {
    const url = images[idx];
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    if (url === primaryUrl && onPrimaryChange) onPrimaryChange(next[0] || "");
  };

  const makePrimary = (url: string) => {
    if (onPrimaryChange) onPrimaryChange(url);
  };

  return (
    <div>
      <label className="block text-xs font-body font-medium uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((url, i) => {
          const isPrimary = url === primaryUrl;
          return (
            <div key={i} className="relative w-20 h-20 border border-border rounded-md overflow-hidden bg-secondary group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {isPrimary && (
                <span className="absolute top-1 left-1 bg-gold text-maroon-deep text-[8px] px-1.5 py-0.5 rounded uppercase font-body tracking-wider flex items-center gap-0.5">
                  <Star size={8} fill="currentColor" /> Main
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {!isPrimary && onPrimaryChange && (
                  <button type="button" onClick={() => makePrimary(url)} title="Set as main" className="bg-gold text-maroon-deep p-1 rounded">
                    <Star size={11} />
                  </button>
                )}
                <button type="button" onClick={() => remove(i)} title="Remove" className="bg-destructive text-destructive-foreground p-1 rounded">
                  <X size={11} />
                </button>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground hover:border-gold hover:text-gold transition disabled:opacity-50"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          <span className="text-[9px] mt-1 font-body uppercase tracking-wider">{busy ? "Uploading" : "Add"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
      />
      <p className="text-[10px] text-muted-foreground font-body">First image becomes the main product photo. Hover any image to remove or promote it.</p>
    </div>
  );
};

export default MultiImageUploader;
