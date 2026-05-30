// Smart color-name resolver: type a name, get a hex.
// Covers the saree-specific palette plus all CSS named colors.
const NAMED: Record<string, string> = {
  // Saree-specific / Indian palette
  maroon: "#8B1E3F", "deep maroon": "#5C0F22", burgundy: "#7C1F2C",
  emerald: "#0F7B5A", "emerald green": "#0F7B5A", "deep green": "#0a3a2a",
  gold: "#C9A84C", "antique gold": "#B7882F", brass: "#B5A642",
  ivory: "#F5F0E0", cream: "#FBF7F0", offwhite: "#F8F4ED", "off white": "#F8F4ED",
  rose: "#C9445A", "rose pink": "#E8728C", blush: "#F4C2C2",
  peacock: "#005F69", "peacock blue": "#005F69", teal: "#008080",
  saffron: "#F4C430", mustard: "#E1AD01", turmeric: "#D4A017",
  sandalwood: "#C8AD7F", beige: "#E8DCC4", tan: "#D2B48C",
  copper: "#B87333", bronze: "#CD7F32", rust: "#B7410E",
  indigo: "#4B0082", violet: "#8B00FF", lavender: "#967BB6",
  charcoal: "#36454F", "jet black": "#0A0A0A", onyx: "#353839",
  silver: "#C0C0C0", platinum: "#E5E4E2",
  // Standard CSS named colors (subset)
  black: "#000000", white: "#FFFFFF", red: "#FF0000", green: "#008000",
  blue: "#0000FF", yellow: "#FFFF00", orange: "#FFA500", purple: "#800080",
  pink: "#FFC0CB", brown: "#A52A2A", grey: "#808080", gray: "#808080",
  cyan: "#00FFFF", magenta: "#FF00FF", lime: "#00FF00", navy: "#000080",
  olive: "#808000", aqua: "#00FFFF", coral: "#FF7F50", crimson: "#DC143C",
  fuchsia: "#FF00FF", khaki: "#F0E68C", salmon: "#FA8072", tomato: "#FF6347",
  wheat: "#F5DEB3", plum: "#DDA0DD", orchid: "#DA70D6", azure: "#F0FFFF",
  mint: "#98FF98", "mint green": "#98FF98",
};

/** Resolve a free-form color string to a 6-digit hex. Returns null if unresolvable. */
export function resolveColor(input: string): string | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) {
    // Expand shorthand
    if (s.length === 4) return "#" + s.slice(1).split("").map(c => c + c).join("").toUpperCase();
    return s.toUpperCase();
  }
  if (NAMED[s]) return NAMED[s];
  // Try without spaces & punctuation
  const collapsed = s.replace(/[^a-z]/g, "");
  for (const [k, v] of Object.entries(NAMED)) {
    if (k.replace(/[^a-z]/g, "") === collapsed) return v;
  }
  return null;
}

/** Best-effort: return either resolved hex or null. Used to render a swatch beside a name. */
export function colorToSwatch(input: string): string {
  return resolveColor(input) ?? "transparent";
}

/** Suggest matching color names for an in-progress query. */
export function suggestColors(query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Object.keys(NAMED)
    .filter(k => k.includes(q))
    .slice(0, limit);
}
