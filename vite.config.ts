import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: [
      "react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime",
      "@tanstack/react-query", "@tanstack/query-core",
    ],
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep React core tiny and stable
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/")) {
            return "vendor-react";
          }
          // Isolate framer-motion (137KB) — loaded async per page
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-motion";
          }
          // Supabase client
          if (id.includes("node_modules/@supabase/")) {
            return "vendor-supabase";
          }
          // Tanstack query
          if (id.includes("node_modules/@tanstack/")) {
            return "vendor-query";
          }
          // Radix UI components
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Icons
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-icons";
          }
          // Heavy PDF/canvas libs — only loaded on checkout/admin pages
          if (id.includes("node_modules/html2canvas") || id.includes("node_modules/jspdf") || id.includes("node_modules/html2pdf")) {
            return "vendor-pdf";
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.warn"],
      },
      format: { comments: false },
    },
    cssCodeSplit: true,
  },
});
