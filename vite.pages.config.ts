// Konfigurasi build statis untuk GitHub Pages.
// Terpisah dari vite.config.ts agar `pnpm dev` versi asli tetap berjalan seperti biasa.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: "github-pages",
  base: "./",
  publicDir: "../public",
  resolve: { alias: { "@": root } },
  plugins: [react()],
  build: {
    outDir: "../dist-pages",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
});
