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
      jsxImportSource: "@emotion/react",
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Desabilitar otimizações nativas sempre para evitar problemas no Docker
  optimizeDeps: {
    disabled: true,
  },
  build: {
    // Desabilitar otimizações nativas para build sempre no Docker
    minify: process.env.VITE_DISABLE_NATIVE === 'true' ? false : 'esbuild',
    sourcemap: mode === 'development',
    // Forçar uso do Rollup JS
    rollupOptions: {
      treeshake: {
        moduleSideEffects: true,
      },
    }
  }
}));
