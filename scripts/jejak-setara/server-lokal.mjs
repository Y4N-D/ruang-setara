// Server lokal Jejak Setara untuk uji (spesifikasi JS-03, bagian "Skrip"): build, migrasi D1 ke folder
// keadaan baru, lalu vite preview dengan JEJAK_KEADAAN menunjuk folder itu. Dipakai uji ujung ke ujung
// (port 4310), uji server (4320), dan sim:beban (4330).
//   node scripts/jejak-setara/server-lokal.mjs --port 4320 [--tanpa-build] [--keadaan <folder>] [--pakai-ulang]
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const akar = fileURLToPath(new URL("../../", import.meta.url));
const argumen = process.argv.slice(2);
const ambil = (nama, bawaan) => {
  const i = argumen.indexOf(nama);
  return i >= 0 && argumen[i + 1] ? argumen[i + 1] : bawaan;
};
const port = Number(ambil("--port", "4310"));
// Jalur mutlak: plugin Vite membaca jalur relatif dari folder akar Vite, bukan dari akar repositori.
const keadaan = resolve(akar, ambil("--keadaan", join("test-results-jejak", `keadaan-${port}`)));
const vite = join(akar, "node_modules", "vite", "bin", "vite.js");
const wrangler = join(akar, "node_modules", "wrangler", "bin", "wrangler.js");
const env = { ...process.env, WRANGLER_SEND_METRICS: "false", CLOUDFLARE_CF_FETCH_ENABLED: "false", CI: "1" };

function jalankan(bin, args) {
  const hasil = spawnSync(process.execPath, [bin, ...args], { cwd: akar, stdio: "inherit", env });
  if (hasil.status !== 0) process.exit(hasil.status ?? 1);
}

if (!argumen.includes("--tanpa-build")) jalankan(vite, ["build", "--config", "vite.jejak.config.ts"]);
if (!argumen.includes("--pakai-ulang")) rmSync(keadaan, { recursive: true, force: true });
mkdirSync(keadaan, { recursive: true });
jalankan(wrangler, ["d1", "migrations", "apply", "jejak-setara-lokal", "--local", "--persist-to", keadaan, "--config", "server/jejak-setara/wrangler.jsonc"]);

const anak = spawn(process.execPath, [vite, "preview", "--config", "vite.jejak.config.ts", "--port", String(port), "--strictPort", "--host", "127.0.0.1"], {
  cwd: akar,
  stdio: "inherit",
  env: { ...env, JEJAK_KEADAAN: keadaan },
});
const berhenti = () => anak.kill("SIGTERM");
process.on("SIGTERM", berhenti);
process.on("SIGINT", berhenti);
anak.on("exit", (kode) => process.exit(kode ?? 0));
