// Uji ujung ke ujung Jejak Setara (spesifikasi JS-01). Terpisah dari playwright.config.ts Sehari Setara:
// hanya membaca e2e/jejak-setara/**/*.uji.ts, yang tidak dibaca konfigurasi Sehari Setara.
// Server uji adalah hasil build yang dijalankan vite preview di runtime Workers lokal.
// Di lingkungan agen, jalur Chromium diberikan lewat variabel JEJAK_CHROMIUM.
import { defineConfig } from "@playwright/test";

const PORT = 4310;
const jalurChromium = process.env.JEJAK_CHROMIUM;

export default defineConfig({
  testDir: "e2e/jejak-setara",
  testMatch: "**/*.uji.ts",
  outputDir: "test-results-jejak",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    browserName: "chromium",
    launchOptions: jalurChromium ? { executablePath: jalurChromium } : {},
  },
  webServer: {
    command: `npx pnpm@11.25.0 build:jejak && npx vite preview --config vite.jejak.config.ts --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/api/sehat`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
