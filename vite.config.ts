import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];

  // Only load lovable-tagger in development to avoid Vercel build failures
  if (mode === "development") {
    try {
      const { componentTagger } = require("lovable-tagger");
      plugins.push(componentTagger());
    } catch {
      // lovable-tagger not available, skip
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      // Target modern browsers for smaller output
      target: "es2020",
      // Increase chunk warning threshold
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Split vendor chunks to improve caching & parallel loading
          manualChunks: {
            // React core — tiny, changes rarely
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            // Animation library — large, isolate so pages load fast
            "vendor-motion": ["framer-motion"],
            // Query & supabase
            "vendor-query": ["@tanstack/react-query"],
            // Icons
            "vendor-icons": ["lucide-react"],
          },
          // Consistent hash-based file names for long-lived caching
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
      // Minification
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info", "console.warn"],
        },
        format: {
          comments: false,
        },
      },
      // CSS code splitting
      cssCodeSplit: true,
    },
  };
});
