// Shared CORS helper — restricts allowed origins to known production + preview domains.
const ALLOWED_ORIGINS = [
  "https://sareee.lovable.app",
  "https://arpithasareecenter.vercel.app",
  "https://arpithasareecenter.com",
  "https://www.arpithasareecenter.com",
  "http://localhost:8080",
  "http://localhost:5173",
];

const ALLOWED_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/i,
  /^https:\/\/[a-z0-9-]+\.lovable\.dev$/i,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
];

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    ALLOWED_PATTERNS.some((re) => re.test(origin));

  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
