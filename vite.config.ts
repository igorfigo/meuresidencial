import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
