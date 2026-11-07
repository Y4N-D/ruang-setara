// Konfigurasi Vite Jejak Setara (spesifikasi JS-01; Architecture JA-15).
// Plugin Cloudflare untuk Vite menjalankan halaman dan Worker di satu alamat saat dev dan preview,
// lalu membangun halaman ke dist-jejak/client/ dan Worker ke dist-jejak/worker/.
// Terpisah dari vite.config.ts (Vinext) dan vite.pages.config.ts (GitHub Pages).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const akar = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(async () => {
  // Tanpa telemetri Wrangler dan tanpa mengambil data Request.cf dari Cloudflare (P-4).
  // Diisi sebelum plugin dimuat, seperti di vite.config.ts.
  process.env.WRANGLER_SEND_METRICS ??= "false";
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    root: "web/jejak-setara",
    base: "/",
    plugins: [
      react(),
      cloudflare({
        configPath: akar + "server/jejak-setara/wrangler.jsonc",
        viteEnvironment: { name: "worker" },
        inspectorPort: false,
        // Keadaan lokal (D1, Durable Object) di .wrangler/state, sama dengan db:migrasi:lokal.
        // Uji memakai folder sendiri lewat JEJAK_KEADAAN (spesifikasi JS-03, bagian "Konfigurasi").
        persistState: { path: process.env.JEJAK_KEADAAN ?? akar + ".wrangler/state" },
      }),
    ],
    build: { outDir: akar + "dist-jejak", emptyOutDir: true },
    // Masukan dua halaman hanya untuk lingkungan klien. Bila ditulis di build teratas,
    // build Worker ikut membacanya dan gagal (UNRESOLVED_ENTRY, percobaan Plan JS-01).
    environments: {
      client: {
        build: {
          rolldownOptions: {
            input: {
              pemain: akar + "web/jejak-setara/index.html",
              admin: akar + "web/jejak-setara/admin/index.html",
            },
          },
        },
      },
    },
  };
});
