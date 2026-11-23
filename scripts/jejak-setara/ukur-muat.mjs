// Pengukur waktu muat layar pemain (spesifikasi JS-15, P-23 dan AC-18), cara yang sama dengan percobaan Plan JS-15:
// Worker lokal (tanpa build ulang, tanpa semai), Chromium dengan emulasi HP 731 × 411, pembatas jaringan dan CPU lewat
// CDP, median tiga kali. "Siap" berarti isian kode ruang tampil; "aset" berarti 95% gambar dunia sudah dimuat.
// Hanya dijalankan agen di mesin lokal (butuh JEJAK_CHROMIUM bila Chromium Playwright tidak terpasang), bukan di alur kerja.
//   node scripts/jejak-setara/ukur-muat.mjs [--port 4345]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const akar = fileURLToPath(new URL("../../", import.meta.url));
const arg = process.argv.slice(2);
const PORT = Number(arg.indexOf("--port") >= 0 ? arg[arg.indexOf("--port") + 1] : 4345);
const tidur = (ms) => new Promise((ok) => setTimeout(ok, ms));
export const PROFIL = [
  { nama: "10 Mbps, 40 ms, CPU normal", turun: 10e6 / 8, naik: 5e6 / 8, latensi: 40, cpu: 1 },
  { nama: "10 Mbps, 40 ms, CPU 4x lebih lambat", turun: 10e6 / 8, naik: 5e6 / 8, latensi: 40, cpu: 4 },
  { nama: "3 Mbps, 150 ms, CPU 4x lebih lambat", turun: 3e6 / 8, naik: 1e6 / 8, latensi: 150, cpu: 4 },
];
const median = (x) => [...x].sort((a, b) => a - b)[Math.floor(x.length / 2)];

const server = spawn(process.execPath, ["scripts/jejak-setara/server-lokal.mjs", "--port", String(PORT), "--tanpa-build", "--tanpa-semai"], { cwd: akar, stdio: "ignore" });
try {
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${PORT}/api/sehat`)).ok) break;
    } catch {
      // Belum siap.
    }
    await tidur(500);
  }
  const peramban = await chromium.launch({ executablePath: process.env.JEJAK_CHROMIUM || undefined });
  const hasil = [];
  for (const p of PROFIL) {
    const ukur = [];
    for (let i = 0; i < 3; i++) {
      const ctx = await peramban.newContext({ viewport: { width: 731, height: 411 }, isMobile: true, hasTouch: true });
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: p.latensi, downloadThroughput: p.turun, uploadThroughput: p.naik });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: p.cpu });
      const t0 = Date.now();
      await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "commit" });
      await page.locator("input").first().waitFor({ state: "visible", timeout: 60_000 });
      const siap = Date.now() - t0;
      const gambarSaatSiap = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.endsWith(".png")).length);
      // Gambar dunia: tunggu sampai jumlahnya tidak bertambah selama 2 detik, lalu catat saat 95% tercapai.
      let n = -1;
      for (let j = 0; j < 120; j++) {
        await page.waitForTimeout(1000);
        const baru = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.endsWith(".png")).length);
        if (baru === n && baru > 10) break;
        n = baru;
      }
      const aset = await page.evaluate(() => {
        const e = performance.getEntriesByType("resource").filter((r) => r.name.endsWith(".png")).map((r) => r.responseEnd).sort((a, b) => a - b);
        return Math.round(e[Math.max(0, Math.ceil(e.length * 0.95) - 1)] ?? 0);
      });
      ukur.push({ siap, gambarSaatSiap, aset, gambar: n });
      await ctx.close();
    }
    const baris = { profil: p.nama, siapMs: median(ukur.map((u) => u.siap)), asetMs: median(ukur.map((u) => u.aset)), gambarSaatSiap: median(ukur.map((u) => u.gambarSaatSiap)), gambar: median(ukur.map((u) => u.gambar)), semua: ukur };
    hasil.push(baris);
    console.log(`${p.nama}: layar Kode siap ${baris.siapMs} ms (median), gambar saat siap ${baris.gambarSaatSiap}, 95% dari ${baris.gambar} gambar dunia termuat pada ${baris.asetMs} ms`);
  }
  await peramban.close();
  mkdirSync(join(akar, "test-results-jejak"), { recursive: true });
  writeFileSync(join(akar, "test-results-jejak", `muat-${Date.now()}.json`), JSON.stringify(hasil, null, 2));
} finally {
  server.kill("SIGTERM");
  await tidur(800);
}
