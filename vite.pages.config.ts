// Konfigurasi build statis untuk GitHub Pages.
// Terpisah dari vite.config.ts agar `pnpm dev` versi asli tetap berjalan seperti biasa.
// Dua halaman dalam satu build: galeri dan game Sehari Setara
// (docs/sehari-setara/Architecture.md bagian 4).
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
    // Aset game selalu menjadi berkas berhash, tidak diselipkan ke JS sebagai data URI
    // (Architecture bagian 8; F-12). Berkas lain memakai aturan bawaan Vite.
    assetsInlineLimit: (filePath) =>
      filePath.replaceAll("\\", "/").includes("/app/sehari-setara/assets/") ? false : undefined,
    // Vite 8: rolldownOptions menggantikan rollupOptions yang sudah usang.
    rolldownOptions: {
      input: {
        main: root + "github-pages/index.html",
        game: root + "github-pages/sehari-setara/index.html",
      },
    },
  },
});
