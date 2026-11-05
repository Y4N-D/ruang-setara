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
  },
});
