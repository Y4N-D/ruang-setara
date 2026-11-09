// Uji unit Jejak Setara (spesifikasi JS-01). Terpisah dari vitest.config.ts Sehari Setara,
// dan tidak memuat vite.jejak.config.ts, agar plugin Cloudflare tidak ikut berjalan.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "app/jejak-setara/**/*.test.ts",
      "app/jejak-setara/**/*.test.tsx",
      "server/jejak-setara/**/*.test.ts",
    ],
    environment: "node",
    // Batas waktu per uji 20 detik (bawaan Vitest 5 detik), karena mesin GitHub kadang lebih lambat dari mesin
    // agen. Uji yang lebih lama dari sekitar 2 detik tetap menulis batasnya sendiri (perbaikan 9 Nov 2026).
    testTimeout: 20_000,
  },
});
