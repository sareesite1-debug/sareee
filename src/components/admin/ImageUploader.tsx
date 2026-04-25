import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadEnhancedImage } from "@/lib/imageUpload";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder: "products" | "categories";
  label?: string;
}

const ImageUploader = ({ value, onChange, folder, label = "Image" }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const url = await uploadEnhancedImage(file, folder);
      onChange(url);
      toast.success("Image uploaded & enhanced");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-body font-medium uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-24 h-24 border border-border rounded-md bg-secondary overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground font-body">No image</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-body border border-border rounded-md hover:bg-muted disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {busy ? "Enhancing & uploading..." : value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="flex items-center gap-1 text-xs text-destructive font-body hover:underline">
              <X size={12} /> Remove
            </button>
          )}
          <p className="text-[10px] text-muted-foreground font-body">Auto-enhanced: upscaled, sharpened, optimized to high-quality JPEG.</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
