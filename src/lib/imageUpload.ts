// Client-side image enhancer + uploader to Supabase Storage.
// "Quality upgrade" = upscale small images, sharpen, re-encode at high JPEG quality.
import { supabase } from "@/integrations/supabase/client";

const TARGET_LONG_EDGE = 1600; // px — upscale shorter sources, downscale huge ones
const JPEG_QUALITY = 0.92;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

// Lightweight unsharp-mask sharpen via convolution
function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount = 0.35) {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data, d = dst.data;
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0]; // sharpen kernel
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0, idx = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const p = ((y + ky) * w + (x + kx)) * 4 + c;
            sum += s[p] * k[idx++];
          }
        }
        const i = (y * w + x) * 4 + c;
        d[i] = Math.max(0, Math.min(255, s[i] * (1 - amount) + sum * amount));
      }
      const a = (y * w + x) * 4 + 3;
      d[a] = s[a];
    }
  }
  ctx.putImageData(dst, 0, 0);
}

async function enhanceImage(file: File): Promise<Blob> {
  // SVGs and gifs: skip processing
  if (/svg|gif/i.test(file.type)) return file;
  const img = await loadImage(file);
  const longEdge = Math.max(img.width, img.height);
  const scale = TARGET_LONG_EDGE / longEdge; // upscale or downscale to target
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // High-quality scaling
  (ctx as any).imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  // Only sharpen reasonable sizes (perf safety)
  if (w * h <= 2400 * 2400) sharpen(ctx, w, h, 0.3);
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob(b => resolve(b!), "image/jpeg", JPEG_QUALITY)
  );
}

export async function uploadEnhancedImage(file: File, folder: "products" | "categories"): Promise<string> {
  const blob = await enhanceImage(file);
  const ext = "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
