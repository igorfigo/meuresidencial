import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "4f962b0d-63d0-4fff-ac2b-71188fbe8709.lovableproject.com"
    ]
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    disabled: process.env.VITE_DISABLE_NATIVE === 'true',
  },
  build: {
    minify: process.env.VITE_DISABLE_NATIVE === 'true' ? false : 'esbuild',
    sourcemap: mode === 'development',
    rollupOptions: {
      treeshake: {
        moduleSideEffects: true,
      },
    }
  }
}));