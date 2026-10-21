// Konfigurasi uji Sehari Setara (Architecture keputusan A9).
// Terpisah agar vitest tidak memuat vite.config.ts milik Vinext.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["app/sehari-setara/**/*.test.ts"],
    environment: "node",
  },
});
