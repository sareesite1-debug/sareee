// Supabase Storage image optimizer.
// Public object URLs look like:
//   https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
// Render endpoint (auto WebP/AVIF + resize):
//   https://<ref>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=W&quality=Q&resize=cover
//
// Pass through any non-Supabase URL untouched.
export function optimizeImg(
  url: string | null | undefined,
  width: number,
  quality = 70,
): string {
  if (!url) return "";
  if (!url.includes("/storage/v1/object/public/")) return url;
  const swapped = url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
  const sep = swapped.includes("?") ? "&" : "?";
  return `${swapped}${sep}width=${Math.round(width)}&quality=${quality}&resize=cover`;
}

// Build a srcset for responsive images. `widths` should be ascending.
export function imgSrcSet(url: string | null | undefined, widths: number[], quality = 70): string {
  if (!url) return "";
  return widths.map(w => `${optimizeImg(url, w, quality)} ${w}w`).join(", ");
}
