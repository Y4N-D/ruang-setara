// Uji ujung ke ujung ronde 5 menit (spesifikasi JS-25, rencana uji "Ujung ke ujung"; AC-2, AC-5 sampai AC-9). Satu
// ronde 5 menit berjalan dengan waktu sungguhan (sekitar 5,5 menit), karena server menghitung waktu ronde sendiri.
// Tangkapan layar disimpan di docs/jejak-setara/tests/JS-25/.
import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { buatRuang, EMAIL, kelas, SANDI, tajukKonsol, tutupRuangBerkas } from "./ruang-uji";

test.describe.configure({ mode: "serial" });
test.afterAll(tutupRuangBerkas);

const FOTO = "docs/jejak-setara/tests/JS-25";
const catat = (judul: string, isi: unknown) => console.log(`[JS-25] ${judul}: ${JSON.stringify(isi)}`);

async function konsolMasuk(browser: Browser, baseURL: string): Promise<{ ctx: BrowserContext; g: Page }> {
  const ctx = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, timezoneId: "Asia/Makassar" });
  const g = await ctx.newPage();
  await g.goto("/admin/");
  await g.getByLabel("Email", { exact: true }).fill(EMAIL);
  await g.getByLabel("Sandi", { exact: true }).fill(SANDI);
  await g.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(g.getByRole("heading", { name: "Dasbor" })).toBeVisible();
  return { ctx, g };
}

test("konsol: tombol 5 menit paling kiri dan catatan paket di dialog Ruang baru (AC-2)", async ({ browser, baseURL, request }) => {
  await tajukKonsol(request); // akun admin e2e dibuat lewat API sebelum masuk konsol
  const { ctx, g } = await konsolMasuk(browser, baseURL!);
  await g.getByRole("link", { name: "Ruang" }).first().click();
  await g.getByRole("button", { name: "+ Ruang baru" }).click();
  const d = g.getByRole("dialog", { name: "Ruang baru" });
  const durasi = d.getByRole("group", { name: "Durasi" });
  await expect(durasi.getByRole("button")).toHaveText(["5 menit", "10 menit", "15 menit", "20 menit"]);
  await expect(durasi.getByRole("button", { name: "15 menit", exact: true })).toHaveAttribute("aria-pressed", "true");
  const catatan = d.locator(".js-konsol-petunjuk", { hasText: "Dalam ronde 5 menit" });
  await expect(catatan).toHaveCount(0);
  // Paket inti memuat 16 kejadian: catatan tampil tanpa menolak, dan tombol 5 menit merujuknya.
  await durasi.getByRole("button", { name: "5 menit", exact: true }).click();
  await expect(durasi.getByRole("button", { name: "5 menit", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(catatan).toHaveText(
    "Paket ini memuat 16 kejadian. Dalam ronde 5 menit, setiap siswa biasanya sempat menjawab 3 sampai 4 kejadian, jadi paket berisi sekitar 8 kejadian lebih mudah dibahas.",
  );
  const id = await catatan.getAttribute("id");
  await expect(durasi.getByRole("button", { name: "5 menit", exact: true })).toHaveAttribute("aria-describedby", id!);
  await g.screenshot({ path: `${FOTO}/dialog-ruang-baru-5-menit.png` });
  await durasi.getByRole("button", { name: "15 menit", exact: true }).click();
  await expect(catatan).toHaveCount(0);
  await d.getByRole("button", { name: "Batal" }).click();
  await ctx.close();
});

test("ronde 5 menit di HP sampai rekap: kode lama ditolak, siang, sore, Satu menit lagi, rekap, riwayat, dan dasbor (AC-5 sampai AC-9)", async ({
  browser,
  baseURL,
  request,
}) => {
  test.setTimeout(480_000);
  const kode = await buatRuang(request, { durasiMenit: 5, labelKelas: "Lima menit" });
  const ctx = await browser.newContext({ baseURL, viewport: { width: 731, height: 411 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 });
  const page = await ctx.newPage();
  const galat: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") galat.push(m.text());
  });
  page.on("pageerror", (g) => galat.push(g.message));
  await page.goto(`/?kode=${kode}`);
  await expect(page.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first().click();
  await page.getByRole("radio", { name: "Avatar 1" }).click();
  await page.getByRole("button", { name: "Gabung" }).click();
  await expect(page.locator("canvas.js-kanvas-dunia")).toHaveAttribute("data-diri", /^\d+,\d+$/);

  // P-9: kode lama (tanpa ?tambahan) ditolak sebelum halo dengan VERSI_BERBEDA versi 6, lalu ditutup 4005.
  const lama = await page.evaluate(
    (k) =>
      new Promise<{ pesan: string[]; kode: number }>((selesai) => {
        const pesan: string[] = [];
        const ws = new WebSocket(`${location.origin.replace(/^http/, "ws")}/ws/ruang/${k}`);
        ws.onmessage = (e) => pesan.push(String(e.data));
        ws.onclose = (e) => selesai({ pesan, kode: e.code });
      }),
    kode,
  );
  expect(lama.kode).toBe(4005);
  expect(lama.pesan).toHaveLength(1);
  expect(JSON.parse(lama.pesan[0])).toEqual({ v: 6, t: "galat", kode: "VERSI_BERBEDA", pesan: "Ada pembaruan. Muat ulang halaman." });

  // P-4 sampai P-6: masa dan peringatan menurut waktu sungguhan sejak status main.
  await kelas(request, kode, { t: "mulai" });
  await expect(page.locator(".js-dunia")).toHaveAttribute("data-status", "main", { timeout: 15_000 });
  const mulai = Date.now();
  const detik = () => Math.round((Date.now() - mulai) / 100) / 10;
  const bilah = page.locator(".js-bilah");
  await expect(bilah).toHaveAttribute("data-masa", "pagi");
  await expect(bilah).toHaveAttribute("data-masa", "siang", { timeout: 100_000 });
  const siang = detik();
  await expect(bilah).toHaveAttribute("data-masa", "sore", { timeout: 120_000 });
  const sore = detik();
  await expect(page.locator(".js-pita")).toHaveText("Satu menit lagi", { timeout: 60_000 });
  const satuMenit = detik();
  await page.screenshot({ path: `${FOTO}/satu-menit-lagi-731x411.png` });
  await expect(page.locator(".js-layar-rekap")).toBeVisible({ timeout: 75_000 });
  const rekap = detik();
  catat("detik sejak status main (siang, sore, Satu menit lagi, rekap)", [siang, sore, satuMenit, rekap]);
  expect(siang).toBeGreaterThanOrEqual(88);
  expect(siang).toBeLessThanOrEqual(93);
  expect(sore).toBeGreaterThanOrEqual(193);
  expect(sore).toBeLessThanOrEqual(198);
  expect(satuMenit).toBeGreaterThanOrEqual(238);
  expect(satuMenit).toBeLessThanOrEqual(243);
  expect(rekap).toBeGreaterThanOrEqual(298);
  expect(rekap).toBeLessThanOrEqual(305);
  await page.screenshot({ path: `${FOTO}/rekap-731x411.png` });
  expect(galat, "tanpa galat konsol").toEqual([]);

  // P-13 dan P-14: sesudah ruang ditutup, riwayat dan dasbor menyebut durasinya.
  await kelas(request, kode, { t: "tutup_ruang" });
  const { ctx: kctx, g } = await konsolMasuk(browser, baseURL!);
  await g.goto("/admin/#/ruang/riwayat");
  const baris = g.locator("tr", { hasText: kode });
  await expect(baris).toBeVisible({ timeout: 15_000 });
  await expect(g.getByRole("columnheader", { name: "Durasi" })).toBeVisible();
  await expect(baris.locator('td[data-label="Durasi"]')).toHaveText("5 menit");
  await g.screenshot({ path: `${FOTO}/riwayat-durasi.png` });
  await g.goto("/admin/");
  // Butir Sesi terakhir admin: "{tanggal} · {kelas} · {guru} · {durasi} menit · {n} pemain · rata-rata {rata}".
  await expect(g.getByText(/· Lima menit · Admin e2e · 5 menit · 1 pemain · rata-rata/).first()).toBeVisible({ timeout: 15_000 });
  await g.screenshot({ path: `${FOTO}/dasbor-durasi.png` });
  await kctx.close();
  await ctx.close();
});
