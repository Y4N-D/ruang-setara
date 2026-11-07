// Uji server Jejak Setara (spesifikasi JS-03, usulan 3a): Vitest di Node terhadap Worker hasil build
// yang dijalankan vite preview lewat scripts/jejak-setara/server-lokal.mjs (port 4320).
// Pola *.uji-server.ts tidak cocok dengan test:jejak.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["server/jejak-setara/uji/**/*.uji-server.ts"],
    environment: "node",
    globalSetup: ["server/jejak-setara/uji/siapkan.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 200_000,
  },
});
