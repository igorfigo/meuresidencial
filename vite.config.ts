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
    react({
      // Desabilitar SWC
      swcOptions: undefined
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Desabilitar otimizações nativas
  optimizeDeps: {
    disabled: process.env.VITE_DISABLE_NATIVE === 'true',
  },
  build: {
    // Desabilitar otimizações nativas para build
    minify: process.env.VITE_DISABLE_NATIVE === 'true' ? false : 'esbuild',
    sourcemap: mode === 'development',
  }
}));
