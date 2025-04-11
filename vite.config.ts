
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
      // Disable SWC optimization when native modules are disabled
      plugins: process.env.VITE_DISABLE_NATIVE === 'true' ? [] : undefined
    }),
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
      // Use inline options to avoid native dependencies
      treeshake: process.env.VITE_DISABLE_NATIVE === 'true' ? {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      } : {
        moduleSideEffects: true,
      }
    }
  }
}));
