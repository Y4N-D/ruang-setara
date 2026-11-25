// Konsol sesudah JS-15 (spesifikasi JS-15, P-25, P-26, P-29; AC-20 sampai AC-22): banner versi konsol, persen kuota
// bulanan Workers Paid, dan waktu pulang-pergi HP di bagian "Pemakaian ronde ini".
import { expect, test, type Page } from "@playwright/test";
import { buatRuang, EMAIL, idDariKode, kelas, SANDI, tajukKonsol, tutupRuangBerkas } from "./ruang-uji";

test.afterAll(tutupRuangBerkas);

async function masukKonsol(page: Page): Promise<void> {
  await page.goto("/admin/");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Sandi", { exact: true }).fill(SANDI);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Dasbor" })).toBeVisible({ timeout: 15_000 });
}

test("banner versi konsol muncul sesudah deploy (rute berubah) dan tidak di layar kelas (AC-21)", async ({ browser, baseURL, request }) => {
  await tajukKonsol(request);
  const kode = await buatRuang(request);
  const ctx = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  // Seolah deploy baru terjadi sesudah halaman konsol dimuat: pemeriksaan versi (fetch) melihat skrip konsol dengan nama
  // lain, sedangkan halaman yang sedang berjalan tetap memakai skrip lama. Pemeriksaan pertama terjadi saat rute berubah
  // (masuk → dasbor), dan pemeriksaan berikutnya paling cepat 60 detik kemudian (diuji unit).
  await page.route("**/admin/", async (route) => {
    if (route.request().resourceType() !== "fetch") return route.fallback();
    const jawaban = await route.fetch();
    await route.fulfill({ response: jawaban, body: (await jawaban.text()).replace(/admin-[A-Za-z0-9_-]+\.js/, "admin-VersiBaru1.js") });
  });
  const banner = page.getByText("Versi konsol yang baru sudah tersedia. Muat ulang halaman agar tampilan dan data cocok.");
  await page.goto("/admin/");
  await expect(banner).toHaveCount(0);
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Sandi", { exact: true }).fill(SANDI);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Dasbor" })).toBeVisible({ timeout: 15_000 });
  await expect(banner).toBeVisible({ timeout: 10_000 });
  await page.getByRole("link", { name: "Ruang" }).first().click();
  await expect(banner).toBeVisible();
  await expect(page.getByRole("status").filter({ has: banner }).getByRole("button", { name: "Muat ulang" })).toBeVisible();
  await page.screenshot({ path: "docs/jejak-setara/tests/JS-15/konsol-versi-1280x720.png" });
  await page.goto(`/admin/#/kelas/${idDariKode(kode)}`);
  await expect(page.locator(".js-kelas-layar").first()).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1500);
  await expect(banner).toHaveCount(0);
  await ctx.close();
});

test("pemakaian ronde: persen kuota bulanan Workers Paid dan waktu pulang-pergi HP (AC-22, D-1)", async ({ browser, baseURL, request }) => {
  test.setTimeout(90_000);
  await tajukKonsol(request);
  const kode = await buatRuang(request);
  const ctxP = await browser.newContext({ baseURL, viewport: { width: 731, height: 411 }, isMobile: true, hasTouch: true });
  const hp = await ctxP.newPage();
  await hp.goto(`/?kode=${kode}`);
  await expect(hp.getByRole("heading", { name: "Pilih nama dan avatar" })).toBeVisible({ timeout: 20_000 });
  await hp.getByRole("radiogroup", { name: "Nama samaran" }).getByRole("radio").first().click();
  await hp.getByRole("radio", { name: "Avatar 2" }).click();
  await hp.getByRole("button", { name: "Gabung" }).click();
  await expect(hp.getByRole("heading", { name: "Lobi" })).toBeVisible({ timeout: 20_000 });
  await kelas(request, kode, { t: "mulai" });
  // ping pertama tanpa rttMs; ping kedua (5 detik kemudian) membawa waktu pulang-pergi.
  await hp.waitForTimeout(12_000);
  const ctxA = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 } });
  const admin = await ctxA.newPage();
  await masukKonsol(admin);
  await admin.goto(`/admin/#/ruang/${idDariKode(kode)}`);
  const bagian = admin.locator(".js-ruang-pemakaian");
  await expect(bagian.getByRole("heading", { name: "Pemakaian ronde ini" })).toBeVisible({ timeout: 15_000 });
  await expect(bagian.getByRole("row", { name: /Permintaan Durable Object \(perkiraan\)/ })).toContainText("% kuota bulanan Workers Paid)");
  await expect(bagian.getByRole("row", { name: /Waktu pulang-pergi HP, median/ })).toContainText(/^Waktu pulang-pergi HP, median\s*\d+ ms$/);
  await expect(bagian.getByRole("row", { name: /Waktu pulang-pergi HP, p95/ })).toContainText(/\d+ ms$/);
  await expect(bagian.getByRole("row", { name: /Sampel waktu pulang-pergi/ })).toContainText(/[1-9]\d*$/);
  await bagian.scrollIntoViewIfNeeded();
  await admin.screenshot({ path: "docs/jejak-setara/tests/JS-15/konsol-pemakaian-1280x720.png" });
  await ctxP.close();
  await ctxA.close();
});
