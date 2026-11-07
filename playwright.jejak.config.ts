// Uji ujung ke ujung Jejak Setara (spesifikasi JS-01). Terpisah dari playwright.config.ts Sehari Setara:
// hanya membaca e2e/jejak-setara/**/*.uji.ts, yang tidak dibaca konfigurasi Sehari Setara.
// Server uji adalah hasil build yang dijalankan vite preview di runtime Workers lokal, dengan D1 lokal yang sudah dimigrasi.
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
    // Build, migrasi D1 ke folder keadaan baru, lalu vite preview (spesifikasi JS-03, bagian "Skrip").
    command: `node scripts/jejak-setara/server-lokal.mjs --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/api/sehat`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
