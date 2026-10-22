// Uji ujung ke ujung Sehari Setara (Architecture bagian 12; spesifikasi F-04).
// Dijalankan di lingkungan agen dengan: npx pnpm@11.25.0 test:e2e. Tidak dijalankan di CI (Architecture bagian 4).
import { defineConfig } from "@playwright/test";

const PORT = 4180;

export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 120_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}/ruang-setara/`,
    browserName: "chromium",
  },
  webServer: {
    // Membangun lalu menyajikan dist-pages/ di bawah /ruang-setara/, meniru alamat GitHub Pages.
    command: `npx pnpm@11.25.0 build:pages && node scripts/game/serve-subpath.mjs --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/ruang-setara/sehari-setara/`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
